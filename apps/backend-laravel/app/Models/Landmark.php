<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Landmark extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_id',
        'external_id',
        'name',
        'name_en',
        'description',
        'description_en',
        'categories',
        'category_names',
        'latitude',
        'longitude',
        'google_maps_url',
        'images',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'categories' => 'array',
        'category_names' => 'array',
        'images' => 'array',
        'is_active' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function mapViews(): HasMany
    {
        return $this->hasMany(MapView::class);
    }
}
