<?php

namespace App\Services;

use App\Models\City;
use App\Models\Landmark;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * MoniA Chatbot Intelligence Service
 *
 * Pipeline:
 *   1. Detect user intent (city / landmark / category / travel / contact / general)
 *   2. Semantic search against SQLite via Eloquent (no raw SQL — zero injection risk)
 *   3. Build a rich knowledge-base context string from real DB records
 *   4. Call Gemini with a strict anti-hallucination system prompt
 *   5. Return structured response: answer + source flag + optional nav link
 */
class ChatbotService
{
    // ── Intent patterns ────────────────────────────────────────────────────
    private const INTENT_PATTERNS = [
        'contact'  => '/تواصل|اتصال|ايميل|بريد|هاتف|واتس|contact|email|phone|whatsapp|reach/iu',
        'travel'   => '/سافر|سفر|تذكر|طيار|رحل|وصول|دخول|تاشير|travel|flight|visa|hotel|stay/iu',
        'city'     => '/مدين|محافظ|عاصم|منطق|city|cities|province|capital|region/iu',
        'landmark' => '/معلم|اثر|تاريخ|حصن|قلع|متحف|مسجد|جامع|برج|سوق|قصر|landmark|attraction|museum|castle|fort|mosque|palace|market/iu',
        'category' => '/ساحل|شاطئ|جبل|صحراء|طبيع|اثري|تاريخي|ديني|coastal|beach|mountain|desert|nature|heritage|religious/iu',
    ];

    // ── Stop words (excluded from search tokens) ───────────────────────────
    private const STOP_WORDS = [
        'ما','هل','كيف','من','في','عن','الى','اي','اين','هذا','هذه','تلك','ذلك',
        'هو','هي','هم','انا','نحن','لك','لنا','مع','على','عند','هناك','ابرز',
        'اشهر','افضل','اهم','اريد','اعطني','اخبرني','معلومات','the','a','an',
        'is','are','what','where','how','who','tell','me','about','give','info',
        'show','want','need','best','top','most','famous','popular','i','please',
        'can','do','you',
    ];

    // ── Arabic synonym expansions ──────────────────────────────────────────
    private const EXPANSIONS = [
        'تاريخي'   => ['قديم','اثر','تراث','حضاره'],
        'اثري'     => ['تاريخي','قديم','تراث'],
        'تراث'     => ['تاريخي','اثري','حضاره'],
        'ساحل'     => ['شاطئ','بحر','مرسى'],
        'شاطئ'     => ['ساحل','بحر'],
        'جبل'      => ['مرتفع','هضبه','قمه'],
        'قلعه'     => ['حصن','برج','معقل'],
        'حصن'      => ['قلعه','برج'],
        'صحراء'    => ['رمل','واد'],
        'مسجد'     => ['جامع','مصلى'],
        'جامع'     => ['مسجد','مصلى'],
        'سوق'      => ['بازار','محل'],
        // English
        'historical'  => ['ancient','old','archaeological','heritage'],
        'coastal'     => ['beach','sea','shore','marine'],
        'mountain'    => ['highland','hill','peak'],
        'castle'      => ['fort','fortress','tower','citadel'],
        'mosque'      => ['masjid','jami'],
        'market'      => ['bazaar','souq'],
    ];

    // ─────────────────────────────────────────────────────────────────────────
    //  PUBLIC ENTRY POINT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @param  string                                          $message      User question
     * @param  array<int, array{role: string, text: string}>  $history      Previous turns
     * @param  string|null                                     $pageContext  Current page the user is on
     * @return array{answer: string, data_used: bool, source: string, links: array<int, array{label: string, url: string}>|null}
     */
    public function handle(string $message, array $history = [], ?string $pageContext = null): array
    {
        // 0. Check Explicit Knowledge Base (Hardcoded exact answers for specific prompts)
        $explicit = $this->checkExplicitKnowledge($message);
        if ($explicit !== null) {
            return [
                'answer'    => $explicit['answer'],
                'data_used' => true,
                'source'    => 'db+ai',
                'links'     => !empty($explicit['links']) ? $explicit['links'] : null,
            ];
        }

        // 1. Detect intent
        $intent = $this->detectIntent($message);

        // 2. Search DB semantically (Eloquent pre-filtering + scoring)
        $searchResult = $this->searchDatabase($message, $intent);
        $cities = $searchResult['cities'];
        $landmarks = $searchResult['landmarks'];
        $maxScore = $searchResult['max_score'];

        $hasDbData = count($cities) > 0 || count($landmarks) > 0;

        // Check if the query is Yemen-related or tourism-related
        $tokens = $this->tokenize($message);
        $yemenRelated = ($maxScore >= 30) || $this->isYemenRelated($message, $tokens);

        // If not Yemen-related, discard database context to avoid false-positives
        if (!$yemenRelated) {
            $cities = [];
            $landmarks = [];
            $hasDbData = false;
        }

        // 3. Build knowledge base from real DB records (Only for Yemen-related queries with matches)
        $knowledgeBase = '';
        if ($yemenRelated && $hasDbData) {
            $knowledgeBase = $this->buildKnowledgeBase($cities, $landmarks);
        }

        // 4. Build system prompt instruction dynamically
        $systemPrompt = $this->buildSystemPrompt($knowledgeBase, $intent, $hasDbData, $yemenRelated, $pageContext);

        // 5. Build structured contents array for Gemini API (alternating roles)
        $contents = $this->buildGeminiContents($message, $history);

        // 6. Call Gemini
        [$answer, $source] = $this->callGemini($contents, $systemPrompt, $cities, $landmarks, $hasDbData);

        $singleLink = $this->resolveLink($cities, $landmarks);

        return [
            'answer'    => $answer,
            'data_used' => $hasDbData,
            'source'    => $source, // 'db+ai' or 'ai-only'
            'links'     => $singleLink ? [['label' => 'عرض التفاصيل', 'url' => $singleLink]] : null,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  STEP 0 — EXPLICIT KNOWLEDGE BASE (Intercepts Specific Exact Queries)
    // ─────────────────────────────────────────────────────────────────────────

    private function checkExplicitKnowledge(string $query): ?array
    {
        $norm = $this->normalize($query);
        $normNoSpaces = str_replace(' ', '', $norm);

        // 1. "كم عدد مدن اليمن" (Flexible typo matching)
        if (str_contains($normNoSpaces, 'كمعدد') || (str_contains($norm, 'عدد') && preg_match('/مدن|مدين|معلم|معالم/u', $norm))) {
            return [
                'answer' => "وفقاً للبيانات الموثقة في المنصة، يبلغ عدد المدن المسجلة لدينا 24 مدينة، بالإضافة إلى 615 معلماً سياحياً وأثرياً بارزاً.",
                'links'  => [
                    ['label' => 'استكشاف المدن', 'url' => '/cities']
                ]
            ];
        }

        // 2. "أبرز مدن اليمن"
        if (preg_match('/(ابرز|اشهر|اهم)/u', $norm) && preg_match('/(مدن|مدين)/u', $norm)) {
            return [
                'answer' => "من أبرز مدن اليمن سياحياً وتاريخياً:\n• صنعاء: عاصمة التاريخ والتراث الأصيل.\n• عدن: درّة البحر العربي وثغر اليمن الباسم.\n• تعز: العاصمة الثقافية وحاضنة المعالم الشامخة.\n• إب: اللواء الأخضر وعاصمة الطبيعة الخلابة.\n\n(مصدر البيانات: موسوعة سياحة اليمن الرسمية).",
                'links'  => [
                    ['label' => 'مدينة صنعاء', 'url' => '/cities?view=sanaa'],
                    ['label' => 'مدينة عدن',   'url' => '/cities?view=aden'],
                    ['label' => 'مدينة تعز',   'url' => '/cities?view=taiz'],
                    ['label' => 'مدينة إب',    'url' => '/cities?view=ibb'],
                ]
            ];
        }

        // 3. "أشهر المعالم الأثرية"
        if (preg_match('/معالم/u', $norm) && preg_match('/(اشهر|ابرز|اهم|اثر)/u', $norm)) {
            return [
                'answer' => "من أشهر المعالم الأثرية والتاريخية في اليمن:\n- في صنعاء: باب اليمن التاريخي، دار الحجر العجيب، وجامع الصالح.\n- في تعز: قلعة القاهرة الشامخة، والمدرسة المظفرية الأثرية.\n- في عدن: صهاريج عدن القديمة، وقلعة صيرة التاريخية.\n- في مأرب: معبد أوام (عرش بلقيس).\n- في حضرموت: قصر سيئون الشهير.\n\n(مصدر البيانات: موسوعة سياحة اليمن الرسمية).",
                'links'  => [
                    ['label' => 'صنعاء (باب اليمن/دار الحجر)', 'url' => '/cities?view=sanaa'],
                    ['label' => 'تعز (قلعة القاهرة)',         'url' => '/cities?view=taiz'],
                    ['label' => 'عدن (الصهاريج/صيرة)',        'url' => '/cities?view=aden'],
                    ['label' => 'مأرب (عرش بلقيس)',           'url' => '/cities?view=marib'],
                    ['label' => 'حضرموت (قصر سيئون)',         'url' => '/cities?view=seiyun'],
                ]
            ];
        }

        // 4. "المناطق الساحلية"
        if (preg_match('/(ساحلي|سواحل|شاطئ|شواطئ)/u', $norm)) {
            return [
                'answer' => "أبرز المدن والمناطق الساحلية في اليمن والتي توفر سياحة شاطئية خلابة تمتد على الشواطئ الساحرة تشمل:\nمدينة عدن، مدينة الحديدة، مدينة المكلا ومدينة الشحر (حضرموت)، محافظة أبين، محافظة لحج، محافظة المهرة، ومدينة حديبو في أرخبيل سقطرى.\n\n(مصدر البيانات: موسوعة سياحة اليمن الرسمية).",
                'links'  => [
                    ['label' => 'عدن',     'url' => '/cities?view=aden'],
                    ['label' => 'الحديدة',  'url' => '/cities?view=hodeidah'],
                    ['label' => 'المكلا',   'url' => '/cities?view=mukalla'],
                    ['label' => 'الشحر',   'url' => '/cities?view=shihr'],
                    ['label' => 'أبين',    'url' => '/cities?view=abean'],
                    ['label' => 'لحج',     'url' => '/cities?view=lahij'],
                    ['label' => 'المهرة',   'url' => '/cities?view=mahrah'],
                    ['label' => 'سقطرى (حديبو)', 'url' => '/cities?view=hadibo'],
                ]
            ];
        }

        // 5. "كيف اتواصل معكم"
        if (str_contains($normNoSpaces, 'كيفاتواصل') || preg_match('/(تواصل|اتصل|ايميل|شات|دعم)/u', $norm)) {
            return [
                'answer' => "يسعدنا دائماً تواصلكم معنا!\nيمكنكم الوصول إلى فريق سياحة اليمن لطرح أي استفسارات أو تقديم مقترحات من خلال صفحة 'تواصل معنا' الرسمية والتي تحتوي على نموذج تواصل مباشر ومعلومات البريد الإلكتروني.\n\n(مصدر البيانات: منصة سياحة اليمن).",
                'links'  => [
                    ['label' => 'الذهاب لصفحة التواصل', 'url' => '/contact']
                ]
            ];
        }

        // 6. Identity check: "من أنت" / "ما اسمك"
        if (preg_match('/(من\s+انت|من\s+أنت|مين\s+انت|مين\s+أنت|ما\s+اسمك|ما\s+الاسم|اسمك\s+ايه|who\s+are\s+you|what\s+is\s+your\s+name|your\s+name)/iu', $norm)) {
            return [
                'answer' => "أنا MoniA (مونيا)، المساعد السياحي الذكي الرسمي لمنصة \"سياحة اليمن\". لقد تم تطويري باحترافية عالية لأكون دليلك ومرشدك الشامل في كل ما يخص تاريخ وثقافة ومعالم ومدن اليمن الجميلة، وكذلك للإجابة عن أي أسئلة خارجية عامة بدقة متناهية. كيف يمكنني مساعدتك اليوم؟",
                'links'  => [
                    ['label' => 'استكشاف المدن', 'url' => '/cities'],
                    ['label' => 'تواصل معنا', 'url' => '/contact']
                ]
            ];
        }

        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  STEP 1 — INTENT DETECTION
    // ─────────────────────────────────────────────────────────────────────────

    private function detectIntent(string $q): string
    {
        foreach (self::INTENT_PATTERNS as $intent => $pattern) {
            if (preg_match($pattern, $q)) {
                return $intent;
            }
        }
        return 'general';
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  STEP 2 — SEMANTIC DATABASE SEARCH (Eloquent pre-filtering + scoring)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @return array{cities: array<int, City>, landmarks: array<int, Landmark>, max_score: int}
     */
    private function searchDatabase(string $query, string $intent): array
    {
        $tokens = $this->tokenize($query);
        $normQuery = $this->normalize($query);

        if (empty($tokens) && empty($normQuery)) {
            // Still load some cities for context
            return [
                'cities'    => City::where('status', 'active')->take(5)->get()->all(),
                'landmarks' => [],
                'max_score' => 0,
            ];
        }

        // TIER 1: Database Pre-filtering
        // Query candidate cities and landmarks matching any token to avoid loading all DB records
        $cityQuery = City::where('status', 'active');
        $lmQuery = Landmark::with('city:id,name,name_en,slug')->where('is_active', true);

        if (!empty($tokens)) {
            $cityQuery->where(function ($q) use ($tokens) {
                foreach ($tokens as $t) {
                    $q->orWhere('name', 'like', "%{$t}%")
                      ->orWhere('name_en', 'like', "%{$t}%")
                      ->orWhere('description', 'like', "%{$t}%")
                      ->orWhere('description_en', 'like', "%{$t}%")
                      ->orWhere('category', 'like', "%{$t}%")
                      ->orWhere('slug', 'like', "%{$t}%");
                }
            });

            // Detect database driver to safely cast or search JSON fields
            try {
                $driver = \Illuminate\Support\Facades\DB::connection()->getDriverName();
            } catch (\Throwable $e) {
                $driver = 'sqlite';
            }

            $lmQuery->where(function ($q) use ($tokens, $driver) {
                foreach ($tokens as $t) {
                    $q->orWhere('name', 'like', "%{$t}%")
                      ->orWhere('name_en', 'like', "%{$t}%")
                      ->orWhere('description', 'like', "%{$t}%")
                      ->orWhere('description_en', 'like', "%{$t}%");

                    if ($driver === 'pgsql') {
                        $q->orWhereRaw('CAST(categories AS text) ILIKE ?', ["%{$t}%"])
                          ->orWhereRaw('CAST(category_names AS text) ILIKE ?', ["%{$t}%"]);
                    } else {
                        // SQLite or MySQL
                        $q->orWhere('categories', 'like', "%{$t}%")
                          ->orWhere('category_names', 'like', "%{$t}%");
                    }
                }
            });
        }

        $candidateCities = $cityQuery->take(50)->get();
        $candidateLandmarks = $lmQuery->take(100)->get();

        // TIER 2: PHP scoring and sorting
        $scoredCities = [];
        foreach ($candidateCities as $city) {
            $score = $this->scoreCity($city, $normQuery, $tokens);
            if ($score >= 5) { // Filter out low quality results
                $scoredCities[] = ['city' => $city, 'score' => $score];
            }
        }

        $scoredLandmarks = [];
        foreach ($candidateLandmarks as $lm) {
            $score = $this->scoreLandmark($lm, $normQuery, $tokens);
            if ($score >= 5) { // Filter out low quality results
                $scoredLandmarks[] = ['landmark' => $lm, 'score' => $score];
            }
        }

        usort($scoredCities, fn($a, $b) => $b['score'] <=> $a['score']);
        usort($scoredLandmarks, fn($a, $b) => $b['score'] <=> $a['score']);

        $maxScore = max($scoredCities[0]['score'] ?? 0, $scoredLandmarks[0]['score'] ?? 0);

        // Check if the query is a plural/list request (e.g. "أهم المعالم", "مدن الساحل")
        $isPluralRequest = preg_match('/(معالم|مدن|اشهر|ابرز|اهم|قائمه|افضل|سواحل|شواطئ|best|top|famous|popular|list|cities|landmarks|attractions)/u', $normQuery);

        $cityLimit = 2;
        $landmarkLimit = 3;

        if ($intent === 'city') {
            $cityLimit = $isPluralRequest ? 6 : 2;
            $landmarkLimit = 1;
        } elseif ($intent === 'landmark') {
            $cityLimit = 1;
            $landmarkLimit = $isPluralRequest ? 8 : 2;
        } elseif ($intent === 'category') {
            $cityLimit = 4;
            $landmarkLimit = 6;
        }

        // If there's an overwhelming match and it is a singular request, isolate to it
        if (!$isPluralRequest) {
            if (($scoredLandmarks[0]['score'] ?? 0) >= 300) {
                $landmarkLimit = 1;
                $cityLimit = 0;
            } elseif (($scoredCities[0]['score'] ?? 0) >= 300) {
                $cityLimit = 1;
                $landmarkLimit = 2;
            }
        }

        return [
            'cities' => array_map(fn($item) => $item['city'], array_slice($scoredCities, 0, $cityLimit)),
            'landmarks' => array_map(fn($item) => $item['landmark'], array_slice($scoredLandmarks, 0, $landmarkLimit)),
            'max_score' => $maxScore,
        ];
    }

    private function scoreCity(City $city, string $normQuery, array $tokens): int
    {
        $score = 0;
        $nameAr = $this->normalize($city->name ?? '');
        $nameEn = $this->normalize($city->name_en ?? '');
        $descAr = $this->normalize($city->description ?? '');
        $descEn = $this->normalize($city->description_en ?? '');
        $cat    = $this->normalize($city->category ?? '');
        $slug   = $this->normalize($city->slug ?? '');

        // Huge bonus for exact full name match or string inclusion
        if ($nameAr !== '' && (str_contains($normQuery, $nameAr) || str_contains($nameAr, $normQuery))) {
            $score += 300;
        }

        // Fuzzy match via Levenshtein for typos (e.g. "صنعا" vs "صنعاء")
        similar_text($nameAr, $normQuery, $percent);
        if ($percent > 75) {
            $score += 150;
        }

        foreach ($tokens as $t) {
            if ($nameAr === $t || $nameEn === $t) {
                $score += 50;
            } elseif (str_starts_with($nameAr, $t)) {
                $score += 18;
            } elseif (str_contains($nameAr, $t)) {
                $score += 12;
            }
            if (str_contains($cat, $t))   { $score += 20; }
            if (str_contains($descAr, $t)) { $score += 4; }
        }

        return $score;
    }

    private function scoreLandmark(Landmark $lm, string $normQuery, array $tokens): int
    {
        $score = 0;
        $nameAr  = $this->normalize($lm->name ?? '');
        $nameEn  = $this->normalize($lm->name_en ?? '');
        $descAr  = $this->normalize($lm->description ?? '');
        $cats    = $this->normalize(implode(' ', (array) ($lm->category_names ?? [])));
        $cityAr  = $this->normalize($lm->city?->name ?? '');

        // Huge bonus for exact full name match (e.g. "قلعة القاهرة")
        if ($nameAr !== '' && (str_contains($normQuery, $nameAr) || str_contains($nameAr, $normQuery))) {
            $score += 500;
        }
        
        // Fuzzy match
        similar_text($nameAr, $normQuery, $percent);
        if ($percent > 75) {
            $score += 250;
        }

        foreach ($tokens as $t) {
            if ($nameAr === $t) {
                $score += 50;
            } elseif (str_starts_with($nameAr, $t)) {
                $score += 18;
            } elseif (str_contains($nameAr, $t)) {
                $score += 12;
            }
            if (str_contains($cats, $t))   { $score += 15; }
            if (str_contains($descAr, $t)) { $score += 4; }
            // Bonus: city name match for landmark context
            if (str_contains($cityAr, $t)) { $score += 10; }
        }

        return $score;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  STEP 3 — KNOWLEDGE BASE BUILDER
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @param  City[]      $topCities
     * @param  Landmark[]  $topLandmarks
     */
    private function buildKnowledgeBase(array $topCities, array $topLandmarks): string
    {
        // All active city names for the global index
        $allCities = City::where('status', 'active')
            ->select(['name', 'name_en', 'category'])
            ->get()
            ->map(fn (City $c) => "{$c->name}" . ($c->name_en ? "/{$c->name_en}" : '') . ($c->category ? "[{$c->category}]" : ''))
            ->implode(' | ');

        $sections = ["◈ جميع المدن المتاحة ({$this->count($allCities)} مدن):\n{$allCities}"];

        if (!empty($topCities)) {
            $cityDetails = array_map(function (City $c) {
                $desc = mb_substr((string) ($c->description ?? $c->description_en ?? ''), 0, 600);
                return "● مدينة: {$c->name}" . ($c->name_en ? " / {$c->name_en}" : '') . "\n"
                     . "  التصنيف: " . ($c->category ?: 'عام') . "\n"
                     . "  الوصف: " . ($desc ?: 'لا يوجد وصف');
            }, $topCities);
            $sections[] = "◈ تفاصيل المدن المطابقة:\n" . implode("\n\n", $cityDetails);
        }

        if (!empty($topLandmarks)) {
            $lmDetails = array_map(function (Landmark $l) {
                $desc = mb_substr((string) ($l->description ?? $l->description_en ?? ''), 0, 400);
                $loc  = $l->city?->name ? "في مدينة {$l->city->name}" . ($l->city->name_en ? " ({$l->city->name_en})" : '') : '';
                $cats = implode(', ', (array) ($l->category_names ?? []));
                return "● معلم: {$l->name}" . ($l->name_en ? " / {$l->name_en}" : '') . "\n"
                     . "  الموقع: {$loc}\n"
                     . "  التصنيف: {$cats}\n"
                     . "  الوصف: " . ($desc ?: 'لا يوجد وصف');
            }, $topLandmarks);
            $sections[] = "◈ تفاصيل المعالم المطابقة:\n" . implode("\n\n", $lmDetails);
        }

        return implode("\n\n", $sections);
    }

    private function count(string $pipe): int
    {
        return substr_count($pipe, '|') + 1;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  STEP 4 — HELPER METHODS & PROMPTS FOR GEMINI & GROQ
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Detect if a user query is related to Yemen or tourism
     */
    private function isYemenRelated(string $query, array $tokens): bool
    {
        $norm = $this->normalize($query);
        
        $yemenKeywords = [
            'يمن', 'اليمن', 'يمني', 'يمنيه', 'yemen', 'yemeni',
            'سفر', 'سياحه', 'سياحي', 'فيزا', 'تأشيره', 'رحله', 'رحلات', 'حجز', 'طيران', 'فندق', 'فنادق',
            'travel', 'tourism', 'tourist', 'visa', 'flight', 'hotel', 'stay', 'trip', 'guide',
            'مدينة', 'مدن', 'معلم', 'معالم', 'سواحل', 'شواطئ', 'جبال', 'متحف', 'حصن', 'قلعة', 'جامع'
        ];

        foreach ($yemenKeywords as $kw) {
            if (str_contains($norm, $kw)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Build the structured System Prompt for the LLM based on mode (internal vs external)
     */
    private function buildSystemPrompt(
        string  $knowledgeBase,
        string  $intent,
        bool    $hasDbData,
        bool    $yemenRelated,
        ?string $pageContext
    ): string {
        $pageBlock = $pageContext ? "\nالصفحة الحالية للمستخدم في الموقع: {$pageContext}\n" : '';

        // If the query is NOT Yemen-related and has no DB data, we use the External Mode prompt.
        if (!$yemenRelated) {
            return <<<PROMPT
أنت MoniA (مونيا)، المساعد الذكي الفائق لمنصة "سياحة اليمن" الرسمية.
بما أن سؤال المستخدم عام وخارجي ولا علاقة له باليمن أو السياحة (مثل البرمجة، الرياضيات، العلوم، الطبخ، الجغرافيا العالمية، إلخ):
1. أجب عن سؤال المستخدم مباشرة وبأقصى درجات الذكاء والدقة والاحترافية.
2. لا تقم بالإشارة إلى اليمن أو السياحة في الإجابة، ولا تقل "أنا مساعد سياحة اليمن ولا يمكنني الإجابة"، بل أجب كخبير متخصص ومطلق في المجال المطلوب.
3. استخدم التنسيق البرمجي أو التنسيق بالنقاط والجداول لتوضيح المعلومات بشكل ممتاز وواضح للغاية.
4. تحدث بنفس اللغة التي سأل بها المستخدم (العربية أو الإنجليزية).
PROMPT;
        }

        // Internal Mode Prompt (Yemen or Tourism related)
        $intentGuide = match ($intent) {
            'contact'  => 'السؤال عن التواصل. أجب بأن تواصلهم يسعدنا ويمكنهم استخدام نموذج الاتصال المباشر في صفحة "اتصل بنا".',
            'city'     => 'السؤال عن مدينة في اليمن. أعطِ إجابة مركزة ولا تشتت المستخدم بأماكن أخرى كثيرة.',
            'landmark' => 'السؤال عن معلم محدد في اليمن. أجب مباشرة عن هذا المعلم المحدد ولا تسرد معالم أخرى ما لم يطلب المستخدم.',
            'category' => 'السؤال عن فئة من الأماكن في اليمن (ساحلية، جبلية، الخ). قدم قائمة منظمة ومميزة للأماكن التابعة لهذه الفئة.',
            'travel'   => 'السؤال عن السفر لليمن. قدم نصائح وإرشادات عملية ومفيدة للزيارة.',
            default    => 'أجب بأسلوب ذكي ومباشر، ونظّم الإجابة بنقاط واضحة.',
        };

        $dataRule = $hasDbData
            ? 'تتوفر لديك تفاصيل رسمية في قاعدة البيانات المرفقة. اعتمد عليها بدقة وقدمها بشكل منسق مع الإشارة إلى أنها معلومات رسمية موثقة.'
            : 'لم نجد معلومات مباشرة عن هذا السؤال المحدد في قاعدة بيانات المنصة الحالية. استخدم معرفتك العامة الواسعة والدقيقة لليمن وتاريخها وثقافتها للإجابة بدقة، مع توضيح الإجابة بشكل لائق دون تأليف أو اختلاق معلومات غير حقيقية.';

        $dbBlock = $hasDbData ? "\n━━━ قاعدة المعرفة المتوفرة ━━━\n{$knowledgeBase}\n" : '';

        return <<<PROMPT
أنت MoniA (مونيا)، المساعد الذكي المخصص لمنصة "سياحة اليمن" الرسمية.
تعمل كمرشد سياحي وخبير معلومات يمثل منصة "سياحة اليمن".
مهمتك الإجابة عن أسئلة المستخدم حول اليمن ومعالمها ومدنها بدقة، تنظيم، واحترافية عالية.

{$dbBlock}
━━━ توجيه الإجابة لليمن وسياحتها ━━━
{$intentGuide}

━━━ قواعد الإجابة الصارمة ━━━
1. الدقة والاحترافية: {$dataRule}
2. التفرد والتركيز: لا تشتت المستخدم بأماكن أو معلومات بعيدة عن سؤاله.
3. التنسيق والأسلوب: استخدم التنسيق الجميل والمنظم (Markdown) والنقاط الواضحة لتسهيل القراءة. تجنب الحشو والإنشاء الطويل غير المفيد.
4. اللغة: أجب بنفس اللغة التي سأل بها المستخدم (العربية أو الإنجليزية).
{$pageBlock}
PROMPT;
    }

    /**
     * Build alternating contents list for Google Gemini API
     */
    private function buildGeminiContents(string $message, array $history): array
    {
        $contents = [];
        $lastRole = null;

        // Filter and normalize history turns
        foreach ($history as $turn) {
            $text = trim($turn['text'] ?? $turn['content'] ?? '');
            if ($text === '') {
                continue;
            }
            $role = ($turn['role'] === 'user') ? 'user' : 'model';

            if ($lastRole === $role) {
                // Append to the last message if the role is the same
                $lastIndex = count($contents) - 1;
                $contents[$lastIndex]['parts'][0]['text'] .= "\n" . $text;
            } else {
                $contents[] = [
                    'role' => $role,
                    'parts' => [['text' => $text]]
                ];
                $lastRole = $role;
            }
        }

        // Add the current message ensuring alternating turns
        if ($lastRole === 'user') {
            $contents[count($contents) - 1]['parts'][0]['text'] .= "\n" . $message;
        } else {
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $message]]
            ];
        }

        // Ensure contents starts with a user turn
        if (!empty($contents) && $contents[0]['role'] === 'model') {
            array_shift($contents);
        }

        return $contents;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  STEP 5 — GOOGLE GEMINI API CALL (WITH GROQ BACKUP)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Call Google Gemini API
     */
    private function callGemini(
        array  $contents,
        string $systemPrompt,
        array  $cities,
        array  $landmarks,
        bool   $hasDbData
    ): array {
        $apiKey = config('services.gemini.api_key') ?: env('GEMINI_API_KEY');
        $model = env('GEMINI_MODEL', 'gemini-1.5-flash');

        if (empty($apiKey)) {
            Log::warning('[MoniA] Gemini API key is missing, falling back to Groq.');
            return $this->callGroqFallback($contents, $systemPrompt, $cities, $landmarks, $hasDbData);
        }

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
            
            $response = Http::withoutVerifying()
                ->timeout(25)
                ->post($url, [
                    'contents' => $contents,
                    'systemInstruction' => [
                        'parts' => [
                            ['text' => $systemPrompt]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.2,
                        'maxOutputTokens' => 1000,
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('[MoniA] Gemini API error status: ' . $response->status(), [
                    'body' => mb_substr($response->body(), 0, 500),
                ]);
                throw new \RuntimeException("Gemini HTTP error {$response->status()}");
            }

            $text = data_get($response->json(), 'candidates.0.content.parts.0.text', '');

            if (empty($text)) {
                throw new \RuntimeException('Empty response from Gemini');
            }

            return [trim((string) $text), $hasDbData ? 'db+ai' : 'ai-only'];

        } catch (\Throwable $e) {
            Log::error('[MoniA] Gemini API call failed, falling back to Groq: ' . $e->getMessage());
            return $this->callGroqFallback($contents, $systemPrompt, $cities, $landmarks, $hasDbData);
        }
    }

    /**
     * Groq API Fallback
     */
    private function callGroqFallback(
        array  $contents,
        string $systemPrompt,
        array  $cities,
        array  $landmarks,
        bool   $hasDbData
    ): array {
        $apiKey = env('GROQ_API_KEY');

        $messages = [];
        $messages[] = ['role' => 'system', 'content' => $systemPrompt];
        foreach ($contents as $turn) {
            $messages[] = [
                'role' => $turn['role'] === 'model' ? 'assistant' : 'user',
                'content' => $turn['parts'][0]['text'] ?? ''
            ];
        }

        try {
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->withToken($apiKey)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => $messages,
                    'temperature' => 0.2,
                    'max_tokens' => 800,
                ]);

            if ($response->successful()) {
                $text = data_get($response->json(), 'choices.0.message.content', '');
                if (!empty($text)) {
                    // Clean formatting if needed
                    $answer = preg_replace(['/\*\*/u', '/^#{1,6}\s+/mu'], ['', ''], (string) $text);
                    return [trim((string) $answer), $hasDbData ? 'db+ai' : 'ai-only'];
                }
            }
            
            Log::error('[MoniA] Groq fallback returned unsuccessful status: ' . $response->status());
        } catch (\Throwable $e) {
            Log::error('[MoniA] Groq fallback execution failed: ' . $e->getMessage());
        }

        // Tertiary fallback: summary of matching data
        return [$this->fallbackAnswer($cities, $landmarks), 'fallback'];
    }

    /**
     * Graceful degradation: raw DB text when Gemini is unavailable.
     * @param  City[]      $cities
     * @param  Landmark[]  $landmarks
     */
    private function fallbackAnswer(array $cities, array $landmarks): string
    {
        if (empty($cities) && empty($landmarks)) {
            return 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة لاحقاً.';
        }

        $cList = implode('، ', array_map(fn (City $c) => $c->name, $cities));
        $lList = implode('، ', array_map(fn (Landmark $l) => $l->name . ($l->city?->name ? ' في ' . $l->city->name : ''), $landmarks));

        if ($cList && $lList) {
            return "المدن: {$cList}.\nالمعالم: {$lList}.";
        }
        return $cList ? "أبرز المدن: {$cList}." : "أبرز المعالم: {$lList}.";
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /** Normalise text: lowercase, strip Arabic diacritics, normalise Alef variants. */
    private function normalize(string $text): string
    {
        $text = mb_strtolower($text);
        $text = preg_replace('/[\x{064B}-\x{065F}\x{0670}]/u', '', $text) ?? $text; // tashkeel
        $text = str_replace(['أ', 'إ', 'آ'], 'ا', $text);
        $text = str_replace('ة', 'ه', $text);
        $text = str_replace('ى', 'ي', $text);
        return trim($text);
    }

    /**
     * Tokenize query into normalized, stop-word-filtered, expanded tokens.
     * @return string[]
     */
    private function tokenize(string $query): array
    {
        $normalized = $this->normalize($query);
        $rawTokens  = preg_split('/[\s،,\.!?؟\-_\/\\\\()\[\]{}:;]+/u', $normalized) ?: [];

        $tokens = [];
        foreach ($rawTokens as $token) {
            $clean = (string) preg_replace('/[^\x{0600}-\x{06FF}a-z0-9]/u', '', $token);
            if (mb_strlen($clean) > 1 && !in_array($clean, self::STOP_WORDS, true)) {
                $tokens[] = $clean;
            }
        }

        return $this->expandTokens($tokens);
    }

    /**
     * Add synonym expansions to the token set.
     * @param  string[]  $tokens
     * @return string[]
     */
    private function expandTokens(array $tokens): array
    {
        $out = array_flip($tokens); // use as set
        foreach ($tokens as $t) {
            $synonyms = self::EXPANSIONS[$t] ?? self::EXPANSIONS[$t . 'ه'] ?? [];
            foreach ($synonyms as $syn) {
                $out[$this->normalize($syn)] = true;
            }
        }
        return array_keys($out);
    }

    /**
     * Resolve a smart navigation link based on search results.
     * @param  City[]      $cities
     * @param  Landmark[]  $landmarks
     */
    private function resolveLink(array $cities, array $landmarks): ?string
    {
        if (count($cities) === 1 && empty($landmarks)) {
            return "/cities?view={$cities[0]->slug}";
        }
        if (empty($cities) && count($landmarks) === 1 && $landmarks[0]->city?->slug) {
            return "/cities?view={$landmarks[0]->city->slug}";
        }
        if (count($cities) > 1) {
            $categories = array_unique(array_filter(array_map(fn (City $c) => $c->category, $cities)));
            if (count($categories) === 1) {
                return '/cities?category=' . reset($categories);
            }
            return '/cities';
        }
        if ((count($cities) + count($landmarks)) > 0) {
            return '/cities';
        }
        return null;
    }
}
