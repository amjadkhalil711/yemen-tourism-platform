<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Landmark;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiContentEnvelopeTest extends TestCase
{
    use RefreshDatabase;

    private string $adminToken = '';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminUserSeeder::class);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'admin123',
        ])->assertOk()->json();

        $this->adminToken = (string) ($loginResponse['token'] ?? '');
    }

    public function test_city_index_response_uses_success_envelope_and_keeps_pagination_keys(): void
    {
        City::query()->create([
            'name' => 'Sanaa',
            'slug' => 'sanaa',
            'description' => 'Capital city',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/v1/cities?per_page=1&page=1');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Cities loaded.')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonStructure([
                'status',
                'message',
                'data',
                'links',
                'meta',
            ]);
    }

    public function test_city_index_can_filter_by_status(): void
    {
        City::query()->create([
            'name' => 'Sanaa',
            'slug' => 'sanaa',
            'description' => 'Capital city',
            'status' => 'published',
        ]);

        City::query()->create([
            'name' => 'Marib',
            'slug' => 'marib',
            'description' => 'Historic destination',
            'status' => 'draft',
        ]);

        $response = $this->getJson('/api/v1/cities?per_page=10&page=1&status=published');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Cities loaded.')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'sanaa')
            ->assertJsonPath('data.0.status', 'published');
    }

    public function test_city_index_normalizes_status_filter_value(): void
    {
        City::query()->create([
            'name' => 'Sanaa',
            'slug' => 'sanaa',
            'description' => 'Capital city',
            'status' => 'published',
        ]);

        City::query()->create([
            'name' => 'Marib',
            'slug' => 'marib',
            'description' => 'Historic destination',
            'status' => 'draft',
        ]);

        $query = http_build_query([
            'per_page' => 10,
            'page' => 1,
            'status' => '  PUBLISHED  ',
        ]);

        $response = $this->getJson("/api/v1/cities?{$query}");

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Cities loaded.')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'sanaa')
            ->assertJsonPath('data.0.status', 'published');
    }

    public function test_city_index_treats_blank_status_as_no_filter(): void
    {
        City::query()->create([
            'name' => 'Sanaa',
            'slug' => 'sanaa',
            'description' => 'Capital city',
            'status' => 'published',
        ]);

        City::query()->create([
            'name' => 'Marib',
            'slug' => 'marib',
            'description' => 'Historic destination',
            'status' => 'draft',
        ]);

        $query = http_build_query([
            'per_page' => 10,
            'page' => 1,
            'status' => '   ',
        ]);

        $response = $this->getJson("/api/v1/cities?{$query}");

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Cities loaded.')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonCount(2, 'data');
    }

    public function test_city_index_can_filter_by_search_query(): void
    {
        City::query()->create([
            'name' => 'Sanaa',
            'slug' => 'sanaa',
            'description' => 'Capital city',
            'status' => 'published',
        ]);

        City::query()->create([
            'name' => 'Marib',
            'slug' => 'marib',
            'description' => 'Historic destination',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/v1/cities?per_page=10&page=1&q=capital');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Cities loaded.')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'sanaa');
    }

    public function test_city_index_rejects_array_search_query(): void
    {
        $this->getJson('/api/v1/cities?page=1&per_page=10&q[]=capital')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['q'],
            ]);
    }

    public function test_city_index_rejects_array_page_query(): void
    {
        $this->getJson('/api/v1/cities?page[]=1&per_page=10')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['page'],
            ]);
    }

    public function test_city_index_rejects_non_numeric_page_query(): void
    {
        $this->getJson('/api/v1/cities?page=abc&per_page=10')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['page'],
            ]);
    }

    public function test_landmark_index_response_uses_success_envelope_and_keeps_pagination_keys(): void
    {
        $city = City::query()->create([
            'name' => 'Aden',
            'slug' => 'aden',
            'description' => 'Port city',
            'status' => 'published',
        ]);

        Landmark::query()->create([
            'city_id' => $city->id,
            'name' => 'Aden Cisterns',
            'description' => 'Historic cisterns',
            'categories' => ['historical'],
            'category_names' => ['Historical'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/landmarks?per_page=10&page=1');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Landmarks loaded.')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonStructure([
                'status',
                'message',
                'data',
                'links',
                'meta',
            ]);
    }

    public function test_admin_landmark_index_includes_inactive_records(): void
    {
        $city = City::query()->create([
            'name' => 'Aden',
            'slug' => 'aden',
            'description' => 'Port city',
            'status' => 'published',
        ]);

        Landmark::query()->create([
            'city_id' => $city->id,
            'name' => 'Active Landmark',
            'description' => 'Active record',
            'categories' => ['historical'],
            'category_names' => ['Historical'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Landmark::query()->create([
            'city_id' => $city->id,
            'name' => 'Inactive Landmark',
            'description' => 'Inactive record',
            'categories' => ['cultural'],
            'category_names' => ['Cultural'],
            'sort_order' => 2,
            'is_active' => false,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/v1/admin/landmarks?per_page=10&page=1');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Landmarks loaded.')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment([
                'name' => 'Inactive Landmark',
                'is_active' => false,
            ]);
    }

    public function test_landmark_index_can_filter_by_city_slug(): void
    {
        $aden = City::query()->create([
            'name' => 'Aden',
            'slug' => 'aden',
            'description' => 'Port city',
            'status' => 'published',
        ]);

        $sanaa = City::query()->create([
            'name' => 'Sanaa',
            'slug' => 'sanaa',
            'description' => 'Capital city',
            'status' => 'published',
        ]);

        Landmark::query()->create([
            'city_id' => $aden->id,
            'name' => 'Aden Cisterns',
            'description' => 'Historic cisterns',
            'categories' => ['historical'],
            'category_names' => ['Historical'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Landmark::query()->create([
            'city_id' => $sanaa->id,
            'name' => 'Bab al-Yemen',
            'description' => 'Old city gate',
            'categories' => ['cultural'],
            'category_names' => ['Cultural'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/landmarks?per_page=10&page=1&city_slug=aden');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Landmarks loaded.')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.city.slug', 'aden');
    }

    public function test_landmark_index_normalizes_city_slug_and_category_filters(): void
    {
        $city = City::query()->create([
            'name' => 'Aden',
            'slug' => 'aden',
            'description' => 'Port city',
            'status' => 'published',
        ]);

        Landmark::query()->create([
            'city_id' => $city->id,
            'name' => 'Aden Cisterns',
            'description' => 'Historic cisterns',
            'categories' => ['historical'],
            'category_names' => ['Historical'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $query = http_build_query([
            'per_page' => 10,
            'page' => 1,
            'city_slug' => '  ADEN  ',
            'category' => '  HISTORICAL  ',
        ]);

        $response = $this->getJson("/api/v1/landmarks?{$query}");

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Landmarks loaded.')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.city.slug', 'aden')
            ->assertJsonPath('data.0.name', 'Aden Cisterns');
    }

    public function test_landmark_index_returns_empty_paginated_payload_for_unknown_city_slug(): void
    {
        $city = City::query()->create([
            'name' => 'Mukalla',
            'slug' => 'mukalla',
            'description' => 'Coastal destination',
            'status' => 'published',
        ]);

        Landmark::query()->create([
            'city_id' => $city->id,
            'name' => 'Corniche',
            'description' => 'Seafront walk',
            'categories' => ['nature'],
            'category_names' => ['Nature'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/landmarks?per_page=5&page=1&city_slug=unknown-city');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Landmarks loaded.')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.total', 0)
            ->assertJsonCount(0, 'data');
    }

    public function test_landmark_index_rejects_array_city_slug_query(): void
    {
        $this->getJson('/api/v1/landmarks?page=1&per_page=10&city_slug[]=aden')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['city_slug'],
            ]);
    }

    public function test_landmark_index_rejects_array_category_query(): void
    {
        $this->getJson('/api/v1/landmarks?page=1&per_page=10&category[]=historical')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['category'],
            ]);
    }

    public function test_landmark_index_rejects_array_search_query(): void
    {
        $this->getJson('/api/v1/landmarks?page=1&per_page=10&q[]=gate')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['q'],
            ]);
    }

    public function test_landmark_index_rejects_array_page_query(): void
    {
        $this->getJson('/api/v1/landmarks?page[]=1&per_page=10')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['page'],
            ]);
    }

    public function test_landmark_index_rejects_non_numeric_page_query(): void
    {
        $this->getJson('/api/v1/landmarks?page=abc&per_page=10')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['page'],
            ]);
    }

    public function test_admin_landmark_index_rejects_array_city_slug_query(): void
    {
        $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/v1/admin/landmarks?page=1&per_page=10&city_slug[]=aden')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['city_slug'],
            ]);
    }

    public function test_admin_landmark_index_rejects_array_category_query(): void
    {
        $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/v1/admin/landmarks?page=1&per_page=10&category[]=historical')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['category'],
            ]);
    }

    public function test_admin_landmark_index_rejects_array_search_query(): void
    {
        $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/v1/admin/landmarks?page=1&per_page=10&q[]=gate')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['q'],
            ]);
    }

    public function test_admin_landmark_index_rejects_array_page_query(): void
    {
        $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/v1/admin/landmarks?page[]=1&per_page=10')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['page'],
            ]);
    }

    public function test_admin_landmark_index_rejects_non_numeric_page_query(): void
    {
        $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/v1/admin/landmarks?page=abc&per_page=10')
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => ['page'],
            ]);
    }

    public function test_city_show_response_uses_success_envelope(): void
    {
        $city = City::query()->create([
            'name' => 'Taiz',
            'slug' => 'taiz',
            'description' => 'Mountain city',
            'status' => 'published',
        ]);

        $this->getJson("/api/v1/cities/{$city->slug}")
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'City loaded.')
            ->assertJsonPath('data.slug', 'taiz');
    }

    public function test_city_show_includes_only_active_landmarks_and_expected_landmark_shape(): void
    {
        $city = City::query()->create([
            'name' => 'Dhamar',
            'slug' => 'dhamar',
            'description' => 'Historic city',
            'status' => 'published',
        ]);

        Landmark::query()->create([
            'city_id' => $city->id,
            'external_id' => 'DH-01',
            'name' => 'Ancient Fort',
            'description' => 'Historic fortification',
            'categories' => ['historical'],
            'category_names' => ['Historical'],
            'latitude' => 14.55,
            'longitude' => 44.40,
            'google_maps_url' => 'https://maps.example.com/fort',
            'images' => ['https://example.com/fort.jpg'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Landmark::query()->create([
            'city_id' => $city->id,
            'external_id' => 'DH-02',
            'name' => 'Inactive Site',
            'description' => 'Should not appear',
            'categories' => ['cultural'],
            'category_names' => ['Cultural'],
            'sort_order' => 2,
            'is_active' => false,
        ]);

        $response = $this->getJson("/api/v1/cities/{$city->slug}");

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'City loaded.')
            ->assertJsonPath('data.slug', 'dhamar')
            ->assertJsonCount(1, 'data.landmarks')
            ->assertJsonPath('data.landmarks.0.external_id', 'DH-01')
            ->assertJsonPath('data.landmarks.0.name', 'Ancient Fort')
            ->assertJsonPath('data.landmarks.0.is_active', true)
            ->assertJsonPath('data.landmarks.0.city_id', $city->id)
            ->assertJsonStructure([
                'data' => [
                    'landmarks' => [
                        [
                            'id',
                            'city_id',
                            'external_id',
                            'name',
                            'description',
                            'categories',
                            'category_names',
                            'latitude',
                            'longitude',
                            'google_maps_url',
                            'images',
                            'sort_order',
                            'is_active',
                            'created_at',
                            'updated_at',
                        ],
                    ],
                ],
            ]);
    }

    public function test_public_city_index_supports_http_cache_revalidation(): void
    {
        City::query()->create([
            'name' => 'Shibam',
            'slug' => 'shibam',
            'description' => 'Historic mudbrick city',
            'status' => 'published',
        ]);

        $firstResponse = $this->get('/api/v1/cities?per_page=1&page=1', [
            'Accept' => 'application/json',
        ]);

        $firstResponse->assertOk();
        $cacheControl = (string) $firstResponse->headers->get('Cache-Control');
        $this->assertStringContainsString('public', $cacheControl);
        $this->assertStringContainsString('max-age=60', $cacheControl);
        $this->assertStringContainsString('stale-while-revalidate=120', $cacheControl);

        $etag = (string) $firstResponse->headers->get('ETag');
        $this->assertNotSame('', $etag);

        $this->withHeaders([
            'Accept' => 'application/json',
            'If-None-Match' => $etag,
        ])
            ->get('/api/v1/cities?per_page=1&page=1')
            ->assertStatus(304);
    }

    public function test_landmark_show_response_uses_success_envelope(): void
    {
        $city = City::query()->create([
            'name' => 'Ibb',
            'slug' => 'ibb',
            'description' => 'Green city',
            'status' => 'published',
        ]);

        $landmark = Landmark::query()->create([
            'city_id' => $city->id,
            'name' => 'Ibb Palace',
            'description' => 'Famous palace',
            'categories' => ['cultural'],
            'category_names' => ['Cultural'],
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $this->getJson("/api/v1/landmarks/{$landmark->id}")
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Landmark loaded.')
            ->assertJsonPath('data.id', $landmark->id);
    }

    public function test_admin_city_store_and_update_responses_use_success_envelope(): void
    {
        $storeResponse = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->postJson('/api/v1/cities', [
                'name' => 'Mukalla',
                'slug' => 'mukalla',
                'description' => 'Coastal destination',
                'status' => 'published',
            ]);

        $storeResponse->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'City created successfully.')
            ->assertJsonPath('data.slug', 'mukalla');

        $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->putJson('/api/v1/cities/mukalla', [
                'name' => 'Al Mukalla',
                'slug' => 'mukalla',
                'description' => 'Updated coastal destination',
                'status' => 'draft',
            ])
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'City updated successfully.')
            ->assertJsonPath('data.name', 'Al Mukalla');
    }

    public function test_admin_landmark_store_and_update_responses_use_success_envelope(): void
    {
        $city = City::query()->create([
            'name' => 'Socotra',
            'slug' => 'socotra',
            'description' => 'Island destination',
            'status' => 'published',
        ]);

        $storeResponse = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->postJson('/api/v1/landmarks', [
                'city_id' => $city->id,
                'name' => 'Dragon Blood Tree',
                'description' => 'Iconic tree',
                'categories' => ['nature'],
                'category_names' => ['Nature'],
                'sort_order' => 1,
                'is_active' => true,
            ]);

        $storeResponse->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Landmark created successfully.')
            ->assertJsonPath('data.name', 'Dragon Blood Tree');

        $landmarkId = (int) ($storeResponse->json('data.id') ?? 0);

        $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->putJson("/api/v1/landmarks/{$landmarkId}", [
                'city_id' => $city->id,
                'name' => 'Dragon Blood Tree Reserve',
                'description' => 'Protected reserve area',
                'sort_order' => 2,
                'is_active' => true,
            ])
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Landmark updated successfully.')
            ->assertJsonPath('data.name', 'Dragon Blood Tree Reserve');
    }
}
