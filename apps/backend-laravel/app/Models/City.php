<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'name_en',
        'description',
        'description_en',
        'image_url',
        'status',
        'category',
    ];

    public function landmarks(): HasMany
    {
        return $this->hasMany(Landmark::class);
    }
}
