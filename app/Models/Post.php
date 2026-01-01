<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'images',
        'youtube_url',
        'link_url',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    protected $appends = [
        'likes_count',
        'comments_count',
        'is_liked',
        'is_saved',
        'image_url',
    ];

    /**
     * Get the user that owns the post
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the likes for the post
     */
    public function likes()
    {
        return $this->hasMany(PostLike::class);
    }

    /**
     * Get the comments for the post
     */
    public function comments()
    {
        return $this->hasMany(PostComment::class)->with('user')->latest();
    }

    /**
     * Get likes count attribute
     */
    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    /**
     * Get comments count attribute
     */
    public function getCommentsCountAttribute()
    {
        return $this->comments()->count();
    }

    /**
     * Check if current user liked this post
     */
    public function getIsLikedAttribute()
    {
        if (!auth()->check()) {
            return false;
        }

        return $this->likes()->where('user_id', auth()->id())->exists();
    }

    /**
     * Get full image URL
     */
    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }

        return Storage::url($this->image);
    }

    /**
     * Get formatted timestamp
     */
    public function getFormattedTimestampAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'saved_posts', 'post_id', 'user_id')->withTimestamps();
    }

    public function getIsSavedAttribute()
    {
        if (!auth()->check()) {
            return false;
        }
        return $this->savedByUsers()->where('user_id', auth()->id())->exists();
    }
}
