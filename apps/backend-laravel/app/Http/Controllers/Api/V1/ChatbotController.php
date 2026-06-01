<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatbotMessageRequest;
use App\Services\ChatbotService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function __construct(private readonly ChatbotService $chatbot)
    {
    }

    /**
     * Handle a chatbot message.
     *
     * POST /api/v1/chatbot/message
     *
     * Request body:
     *   - message:       string (required, ≤500 chars)
     *   - user_id:       int|null
     *   - page_context:  string|null   (e.g. "cities page", "/cities?view=taiz")
     *   - history:       array of {role, text} (optional, last N turns)
     *
     * Response (200):
     *   {
     *     "answer":    "…",
     *     "data_used": true|false,
     *     "source":    "database" | "ai" | "both" | "fallback"
     *   }
     */
    public function message(ChatbotMessageRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $message     = (string) $validated['message'];
        $history     = (array)  ($validated['history']     ?? []);
        $pageContext  = isset($validated['page_context'])
            ? (string) $validated['page_context']
            : null;

        Log::info('[MoniA] Incoming message', [
            'message'      => mb_substr($message, 0, 100),
            'user_id'      => $validated['user_id'] ?? null,
            'page_context' => $pageContext,
            'history_len'  => count($history),
        ]);

        $result = $this->chatbot->handle($message, $history, $pageContext);

        return ApiResponse::success(
            data: [
                'answer'    => $result['answer'],
                'data_used' => $result['data_used'],
                'source'    => $result['source'],
                'links'     => $result['links'],
            ],
            message: 'Chatbot response generated.'
        );
    }
}
