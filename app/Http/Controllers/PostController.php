<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Services\FCMService;

class PostController extends Controller
{
    /**
     * Display a listing of posts
     */
    public function index(Request $request)
    {
        // Detect device type from user agent
        $userAgent = $request->header('User-Agent');
        $isMobile = preg_match('/(android|iphone|ipad|mobile)/i', $userAgent);

        // Set per_page based on device
        $perPage = $isMobile ? 5 : 10;

        // Get per_page from request or use default
        $perPage = $request->input('per_page', $perPage);

        $query = Post::with(['user', 'comments.user'])
            ->withCount(['likes', 'comments', 'savedByUsers']);

        if ($request->boolean('saved')) {
            $query->whereHas('savedByUsers', function ($q) {
                $q->where('user_id', auth()->id());
            });
        }

        $posts = $query->latest()
            ->paginate($perPage);

        // Format posts for frontend
        $formattedPosts = $posts->map(function ($post) {
            // Images already decoded by Laravel casts
            $images = $post->images ?? [];
            $imageUrls = array_map(function ($path) {
                return Storage::url($path);
            }, $images);

            return [
                'id' => $post->id,
                'user' => [
                    'name' => $post->user->name,
                    'avatar_url' => $post->user->avatar_url,
                ],
                'content' => $post->content,
                'images' => $imageUrls, // Array of image URLS
                'image' => !empty($imageUrls) ? $imageUrls[0] : null, // First image for backward compatibility
                'youtube_url' => $post->youtube_url,
                'link_url' => $post->link_url,
                'likes' => $post->likes_count,
                'saved_count' => $post->saved_by_users_count,
                'isLiked' => $post->likes->contains('user_id', auth()->id()),
                'is_saved' => $post->is_saved,
                'canDelete' => $post->user_id === auth()->id(),
                'comments' => $post->comments->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'user' => [
                            'name' => $comment->user->name,
                            'avatar_url' => $comment->user->avatar_url,
                        ],
                        'content' => $comment->content,
                        'timestamp' => $comment->created_at->diffForHumans(),
                        'canDelete' => $comment->user_id === auth()->id(),
                    ];
                }),
                'timestamp' => $post->created_at->diffForHumans(),
            ];
        });

        return Inertia::render('Post', [
            'posts' => $formattedPosts,
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
                'has_more' => $posts->hasMorePages(),
            ],
        ]);
    }

    /**
     * Show a single post
     */
    public function show(Post $post)
    {
        // Load relationships
        $post->load(['user', 'likes', 'comments.user']);

        // Format single post
        $images = $post->images ?? [];
        $imageUrls = array_map(function ($path) {
            return Storage::url($path);
        }, $images);

        $formattedPost = [
            'id' => $post->id,
            'user' => [
                'name' => $post->user->name,
                'avatar' => null,
            ],
            'content' => $post->content,
            'images' => $imageUrls,
            'image' => !empty($imageUrls) ? $imageUrls[0] : null,
            'youtube_url' => $post->youtube_url,
            'likes' => $post->likes_count,
            'isLiked' => $post->likes->contains('user_id', auth()->id()),
            'canDelete' => $post->user_id === auth()->id(),
            'comments' => $post->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'user' => [
                        'name' => $comment->user->name,
                        'avatar' => null,
                    ],
                    'content' => $comment->content,
                    'timestamp' => $comment->created_at->diffForHumans(),
                    'canDelete' => $comment->user_id === auth()->id(),
                ];
            }),
            'timestamp' => $post->created_at->diffForHumans(),
        ];

        return Inertia::render('Post', [
            'posts' => [$formattedPost], // Single post as array
            'pagination' => [
                'current_page' => 1,
                'has_more' => false,
            ],
            'singlePost' => true, // Flag to indicate single post view
        ]);
    }

    /**
     * Store a newly created post
     */
    public function store(Request $request)
    {
        $request->validate([
            'content' => 'nullable|string|max:5000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:5120', // 5MB max per image
            'youtube_url' => 'nullable|url',
            'link_url' => 'nullable|url',
        ]);

        $imagePaths = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // Generate unique filename: timestamp_randomstring.extension
                $timestamp = now()->format('YmdHis');
                $randomString = \Illuminate\Support\Str::random(10);
                $extension = $image->getClientOriginalExtension();
                $filename = "{$timestamp}_{$randomString}.{$extension}";

                // Store with custom filename
                $imagePath = $image->storeAs('posts', $filename, 'public');
                $imagePaths[] = $imagePath;
            }
        }

        Post::create([
            'user_id' => auth()->id(),
            'content' => $request->input('content'),
            'images' => $imagePaths,  // Laravel casts will auto-encode to JSON
            'youtube_url' => $request->input('youtube_url'),
            'link_url' => $request->input('link_url'),
        ]);

        return back();
    }

    /**
     * Toggle like on a post
     */
    public function toggleLike(Post $post, FCMService $fcmService)
    {
        $like = $post->likes()->where('user_id', auth()->id())->first();

        if ($like) {
            /** @var \Illuminate\Database\Eloquent\Model $like */
            $like->delete();
            // Optionally: delete notification when unliking
            \App\Models\Notification::where('user_id', $post->user_id)
                ->where('type', 'like')
                ->where('notifiable_id', $post->id)
                ->where('data->actor_id', auth()->id())
                ->delete();
        } else {
            $post->likes()->create([
                'user_id' => auth()->id(),
            ]);

            // Create notification for post owner (not for self-like)
            if ($post->user_id !== auth()->id()) {
                \App\Models\Notification::create([
                    'user_id' => $post->user_id,
                    'type' => 'like',
                    'notifiable_type' => 'App\\Models\\Post',
                    'notifiable_id' => $post->id,
                    'data' => [
                        'actor_id' => auth()->id(),
                        'actor_name' => auth()->user()->name,
                        'post_id' => $post->id,
                        'post_content' => substr($post->content, 0, 50),
                    ],
                ]);

                // Send FCM Notification
                $targetUser = \App\Models\User::find($post->user_id);

                if ($targetUser) {
                    if ($targetUser->fcm_token) {
                        $title = "Ada Like Baru! ❤️";
                        $body = auth()->user()->name . " menyukai postingan Anda: \"" . substr($post->content, 0, 30) . "...\"";

                        // Add URL to open
                        $dataPayload = [
                            'url' => route('post.show', $post->id),
                            'click_action' => 'FLUTTER_NOTIFICATION_CLICK' // Standard for many handlers
                        ];

                        $fcmService->sendToToken($targetUser->fcm_token, $title, $body, $dataPayload);
                    }
                }
            }
        }

        return back();
    }

    /**
     * Add a comment to a post
     */
    public function addComment(Request $request, Post $post, FCMService $fcmService)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment = $post->comments()->create([
            'user_id' => auth()->id(),
            'content' => $request->input('content'),
        ]);

        // Get all unique users who should be notified
        $usersToNotify = collect();

        // 1. Add post owner (if not the commenter)
        if ($post->user_id !== auth()->id()) {
            $usersToNotify->push($post->user_id);
        }

        // 2. Add all previous commenters (excluding current commenter)
        $previousCommenters = $post->comments()
            ->where('user_id', '!=', auth()->id())
            ->pluck('user_id')
            ->unique();

        $usersToNotify = $usersToNotify->merge($previousCommenters)->unique();



        // Create notifications for all participants AND Send FCM
        foreach ($usersToNotify as $userId) {
            \App\Models\Notification::create([
                'user_id' => $userId,
                'type' => 'comment',
                'notifiable_type' => 'App\\Models\\Post',
                'notifiable_id' => $post->id,
                'data' => [
                    'actor_id' => auth()->id(),
                    'actor_name' => auth()->user()->name,
                    'post_id' => $post->id,
                    'post_content' => substr($post->content, 0, 50),
                    'comment_content' => $request->input('content'),
                    'comment_id' => $comment->id, // Add comment ID for scrolling
                ],
            ]);

            // Send FCM
            $targetUser = \App\Models\User::find($userId);
            if ($targetUser && $targetUser->fcm_token) {
                $title = "Komentar Baru 💬";
                $body = auth()->user()->name . " mengomentari postingan: \"" . substr($request->input('content'), 0, 30) . "...\"";

                $dataPayload = [
                    'url' => route('post.show', $post->id),
                ];

                $response = $fcmService->sendToToken($targetUser->fcm_token, $title, $body, $dataPayload);
            }
        }

        return back();
    }

    /**
     * Delete a comment
     */
    public function deleteComment(PostComment $comment)
    {
        // Only allow user to delete their own comments
        if ($comment->user_id !== auth()->id()) {
            abort(403);
        }

        // Delete associated notifications
        \App\Models\Notification::where('type', 'comment')
            ->where('notifiable_id', $comment->post_id)
            ->where('data->comment_id', $comment->id)
            ->delete();

        $comment->delete();

        return back();
    }

    /**
     * Delete a post
     */
    public function deletePost(Post $post)
    {
        // Only allow user to delete their own posts
        if ($post->user_id !== auth()->id()) {
            abort(403);
        }

        // Delete associated image if exists
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return back();
    }

    /**
     * Search users for mention autocomplete
     */
    public function searchUsers(Request $request)
    {
        $query = $request->input('q', '');

        // Build query
        $usersQuery = \App\Models\User::where('id', '!=', auth()->id()); // Exclude current user

        // If query is provided, filter by name
        if (strlen($query) > 0) {
            $usersQuery->where('name', 'LIKE', "%{$query}%");
        }

        $users = $usersQuery
            ->limit(5)
            ->get(['id', 'name'])
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                ];
            });

        return response()->json($users);
    }
    public function toggleSave(Post $post)
    {
        $user = auth()->user();

        if ($post->savedByUsers()->where('user_id', $user->id)->exists()) {
            $post->savedByUsers()->detach($user->id);
            $message = 'Post removed from saved';
        } else {
            $post->savedByUsers()->attach($user->id);
            $message = 'Post saved';
        }

        return back()->with('success', $message);
    }
}
