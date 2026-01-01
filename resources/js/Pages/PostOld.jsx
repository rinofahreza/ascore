import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import ConfirmDialog from '@/Components/ConfirmDialog';
import ImageViewer from '@/Components/ImageViewer';
import MentionInput from '@/Components/MentionInput';
import ImageCarousel from '@/Components/ImageCarousel';
import Toast from '@/Components/Toast';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import imageCompression from 'browser-image-compression';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Post({ auth, posts: initialPosts, pagination }) {
    const { data, setData, post, processing, reset } = useForm({
        content: '',
        images: [],
        youtube_url: '',
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isCompressing, setIsCompressing] = useState(false);
    const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
    const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
    const [isValidYoutubeUrl, setIsValidYoutubeUrl] = useState(false);
    const [showComments, setShowComments] = useState({});
    const [commentText, setCommentText] = useState({});
    const [viewerImage, setViewerImage] = useState({ isOpen: false, images: [], currentIndex: 0 });
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const [likeAnimations, setLikeAnimations] = useState({});
    const commentInputRefs = useRef({});
    const [posts, setPosts] = useState(initialPosts || []);
    const [currentPage, setCurrentPage] = useState(pagination?.current_page || 1);
    const [hasMore, setHasMore] = useState(pagination?.has_more || false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    // Handle highlight post from notification
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const highlightPostId = urlParams.get('highlight');

        if (highlightPostId) {
            const scrollToPost = () => {
                const postElement = document.getElementById(`post-${highlightPostId}`);
                if (postElement) {
                    // Scroll to post
                    postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Add highlight animation
                    postElement.classList.add('highlight-post');

                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        postElement.classList.remove('highlight-post');
                    }, 3000);

                    return true;
                }
                return false;
            };

            // Try to scroll after initial render
            setTimeout(() => {
                const found = scrollToPost();

                // If post not found, it might be on next page - load more posts
                if (!found && hasMore && !isLoadingMore) {
                    console.log('Post not found, loading more posts...');
                    loadMore();
                    // Try again after a delay to allow posts to load
                    setTimeout(() => {
                        scrollToPost();
                    }, 2000);
                }
            }, 500);
        }
    }, [posts, hasMore]);

    // Handle scroll to specific comment from notification
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const commentId = urlParams.get('comment');

        if (commentId && posts.length > 0) {
            // Find the post that contains this comment
            const postWithComment = posts.find(post =>
                post.comments.some(comment => comment.id === parseInt(commentId))
            );

            if (postWithComment) {
                // Auto-expand comments for this post
                setShowComments(prev => ({
                    ...prev,
                    [postWithComment.id]: true
                }));

                // Wait for comments to render, then scroll
                setTimeout(() => {
                    const commentElement = document.getElementById(`comment-${commentId}`);
                    if (commentElement) {
                        // Scroll to comment
                        commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // Add highlight animation
                        commentElement.classList.add('highlight-post');

                        // Remove highlight after 3 seconds
                        setTimeout(() => {
                            commentElement.classList.remove('highlight-post');
                        }, 3000);
                    }
                }, 500);
            }
        }
    }, [posts]);

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Validate YouTube URL
    const validateYoutubeUrl = (url) => {
        const videoId = getYouTubeVideoId(url);
        setIsValidYoutubeUrl(videoId !== null);
        return videoId !== null;
    };

    // Handle paste from clipboard
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setYoutubeUrlInput(text);
            validateYoutubeUrl(text);
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    // Handle YouTube modal OK
    const handleYoutubeOk = () => {
        if (isValidYoutubeUrl) {
            setData('youtube_url', youtubeUrlInput);
            setYoutubeModalOpen(false);
        }
    };

    // Handle YouTube modal cancel
    const handleYoutubeCancel = () => {
        setYoutubeUrlInput('');
        setIsValidYoutubeUrl(false);
        setYoutubeModalOpen(false);
    };

    // Remove YouTube URL
    const removeYoutubeUrl = () => {
        setData('youtube_url', '');
        setYoutubeUrlInput('');
        setIsValidYoutubeUrl(false);
    };

    // Refresh AOS when posts change
    useEffect(() => {
        AOS.refresh();
    }, [posts]);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Check max 5 images
        const currentCount = data.images.length;
        const newCount = currentCount + files.length;

        if (newCount > 5) {
            setToast({
                show: true,
                message: `Maksimal 5 gambar. Anda sudah memiliki ${currentCount} gambar, hanya bisa menambah ${5 - currentCount} lagi.`,
                type: 'error'
            });
            return;
        }

        try {
            setIsCompressing(true);

            // Compression options
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/jpeg',
            };

            const compressedFiles = [];
            const previews = [];

            // Compress each image
            for (const file of files) {
                const compressedBlob = await imageCompression(file, options);

                // Get original filename without extension and add .jpg
                const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
                const newFilename = `${originalName}.jpg`; // Add .jpg since we compress to JPEG

                // Convert blob to File with proper filename
                const compressedFile = new File(
                    [compressedBlob],
                    newFilename,
                    { type: 'image/jpeg', lastModified: Date.now() }
                );

                compressedFiles.push(compressedFile);

                // Create preview
                const preview = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(compressedFile);
                });
                previews.push(preview);
            }

            // Update state with new images
            setData('images', [...data.images, ...compressedFiles]);
            setImagePreviews([...imagePreviews, ...previews]);

        } catch (error) {
            console.error('Error compressing image:', error);
            setToast({
                show: true,
                message: 'Gagal mengkompress gambar. Silakan coba lagi.',
                type: 'error'
            });
        } finally {
            setIsCompressing(false);
            // Reset input
            e.target.value = '';
        }
    };

    const removeImage = (index) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setData('images', newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create FormData for file uploads
        const formData = new FormData();
        formData.append('content', data.content || '');

        // Append YouTube URL if exists
        if (data.youtube_url) {
            formData.append('youtube_url', data.youtube_url);
        }

        // Append each image with array notation
        data.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });

        router.post(route('post.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreviews([]);
                // Reset YouTube modal state
                setYoutubeUrlInput('');
                setIsValidYoutubeUrl(false);

                // Reload first page to show new post
                router.get(route('post.index'),
                    { page: 1 },
                    {
                        preserveState: true,
                        preserveScroll: false,
                        only: ['posts', 'pagination'],
                        onSuccess: (page) => {
                            setPosts(page.props.posts);
                            setCurrentPage(page.props.pagination.current_page);
                            setHasMore(page.props.pagination.has_more);
                            // Scroll to top to see new post
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }
                );
            },
            onError: (errors) => {
                console.error('Upload errors:', errors);
            }
        });
    };

    const toggleLike = (postId) => {
        // Trigger animation
        setLikeAnimations(prev => ({ ...prev, [postId]: true }));
        setTimeout(() => {
            setLikeAnimations(prev => ({ ...prev, [postId]: false }));
        }, 1000);

        // Optimistic update
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    isLiked: !p.isLiked,
                    likes: p.isLiked ? p.likes - 1 : p.likes + 1
                };
            }
            return p;
        }));

        router.post(route('post.like', postId), {}, {
            preserveScroll: true,
            onError: () => {
                // Revert on error
                setPosts(posts.map(p => {
                    if (p.id === postId) {
                        return {
                            ...p,
                            isLiked: !p.isLiked,
                            likes: p.isLiked ? p.likes + 1 : p.likes - 1
                        };
                    }
                    return p;
                }));
            }
        });
    };

    const toggleComments = (postId) => {
        const newShowComments = {
            ...showComments,
            [postId]: !showComments[postId]
        };
        setShowComments(newShowComments);

        // Scroll to comment input when opening
        if (!showComments[postId]) {
            setTimeout(() => {
                commentInputRefs.current[postId]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                commentInputRefs.current[postId]?.focus();
            }, 100);
        }
    };

    const addComment = (postId) => {
        const comment = commentText[postId];
        if (!comment?.trim()) return;

        router.post(route('post.comment', postId),
            { content: comment },
            {
                preserveScroll: true,
                only: ['posts', 'pagination'],
                onSuccess: (page) => {
                    // Update posts from server response to get real comment IDs
                    const updatedPosts = page.props.posts;
                    setPosts(prevPosts => {
                        return prevPosts.map(p => {
                            const updatedPost = updatedPosts.find(up => up.id === p.id);
                            return updatedPost || p;
                        });
                    });

                    setCommentText(prev => ({ ...prev, [postId]: '' }));
                }
            }
        );
    };

    const deleteComment = (commentId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Hapus Komentar',
            message: 'Apakah Anda yakin ingin menghapus komentar ini?',
            onConfirm: () => {
                router.delete(route('post.comment.delete', commentId), {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Update local state - remove comment
                        setPosts(posts.map(p => ({
                            ...p,
                            comments: p.comments.filter(c => c.id !== commentId)
                        })));
                    }
                });
            }
        });
    };

    const deletePost = (postId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Hapus Postingan',
            message: 'Apakah Anda yakin ingin menghapus postingan ini? Tindakan ini tidak dapat dibatalkan.',
            onConfirm: () => {
                router.delete(route('post.delete', postId), {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Update local state - remove post
                        setPosts(posts.filter(p => p.id !== postId));
                    }
                });
            }
        });
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const loadMore = () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;

        router.get(route('post.index'),
            { page: nextPage },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['posts', 'pagination'],
                onSuccess: (page) => {
                    const newPosts = page.props.posts;
                    const newPagination = page.props.pagination;

                    setPosts(prev => [...prev, ...newPosts]);
                    setCurrentPage(newPagination.current_page);
                    setHasMore(newPagination.has_more);
                    setIsLoadingMore(false);
                },
                onError: () => {
                    setIsLoadingMore(false);
                }
            }
        );
    };

    // Infinite scroll detection
    useEffect(() => {
        const handleScroll = () => {
            if (isLoadingMore || !hasMore) return;

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            // Load more when user is 300px from bottom
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoadingMore, hasMore, currentPage]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Social Feed</h2>}
        >
            <Head title="Post" />

            <div className="pt-4 pb-32 bg-gray-100 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                    {/* Create Post Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="flex items-start space-x-3 mb-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden"
                                        style={!auth.user.avatar_url ? { background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))` } : {}}>
                                        {auth.user.avatar_url ? (
                                            <img src={auth.user.avatar_url} alt={auth.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            getInitials(auth.user.name)
                                        )}
                                    </div>
                                    <textarea
                                        rows="3"
                                        className="flex-1 px-4 py-3 border-0 bg-gray-100 dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:text-gray-100 resize-none"
                                        placeholder="Apa yang Anda pikirkan?"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                    />
                                </div>

                                {/* YouTube Thumbnail Preview */}
                                {data.youtube_url && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                YouTube Video
                                            </span>
                                        </div>
                                        <div className="relative group">
                                            <img
                                                src={`https://img.youtube.com/vi/${getYouTubeVideoId(data.youtube_url)}/maxresdefault.jpg`}
                                                alt="YouTube Thumbnail"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeYoutubeUrl}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            {/* Play icon overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-90">
                                                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Image Preview Grid */}
                                {imagePreviews.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {imagePreviews.length}/5 gambar
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-2">
                                        {/* Photo Upload Button */}
                                        <label
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${isCompressing || data.youtube_url
                                                ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                                                : 'hover:opacity-90'
                                                }`}
                                            style={{
                                                background: (isCompressing || data.youtube_url) ? undefined : 'linear-gradient(to right, var(--color-primary), var(--color-primary-light))'
                                            }}
                                        >
                                            <svg className={`w-5 h-5 ${(isCompressing || data.youtube_url) ? 'text-gray-600 dark:text-gray-300' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className={`text-sm font-medium ${(isCompressing || data.youtube_url) ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}>
                                                {isCompressing ? 'Mengkompress...' : 'Foto'}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={isCompressing || data.images.length >= 5 || data.youtube_url}
                                            />
                                        </label>

                                        {/* YouTube Button */}
                                        <button
                                            type="button"
                                            onClick={() => setYoutubeModalOpen(true)}
                                            disabled={data.images.length > 0}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${data.images.length > 0
                                                ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                                                : 'bg-red-500 hover:bg-red-600'
                                                }`}
                                        >
                                            <svg className={`w-5 h-5 ${data.images.length > 0 ? 'text-gray-600 dark:text-gray-300' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                            </svg>
                                            <span className={`text-sm font-medium ${data.images.length > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}>
                                                YouTube
                                            </span>
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={(!data.content?.trim() && !data.images.length && !data.youtube_url) || processing || isCompressing}
                                        className="px-6 py-2 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            background: `linear-gradient(to right, var(--color-primary), var(--color-primary-light))`
                                        }}
                                    >
                                        {processing ? 'Memposting...' : isCompressing ? 'Mengkompress...' : 'Posting'}
                                    </button>
                                </div>

                                {/* YouTube Modal Dialog */}
                                <Dialog open={youtubeModalOpen} onClose={handleYoutubeCancel} className="relative z-50">
                                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                                    <div className="fixed inset-0 flex items-center justify-center p-4">
                                        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                                            <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                                Tambah Video YouTube
                                            </Dialog.Title>

                                            <div className="space-y-4">
                                                {/* URL Input */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        YouTube URL
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="url"
                                                            value={youtubeUrlInput}
                                                            onChange={(e) => {
                                                                setYoutubeUrlInput(e.target.value);
                                                                validateYoutubeUrl(e.target.value);
                                                            }}
                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handlePaste}
                                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                                        >
                                                            Paste
                                                        </button>
                                                    </div>
                                                    {youtubeUrlInput && (
                                                        <p className={`text-xs mt-1 ${isValidYoutubeUrl ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {isValidYoutubeUrl ? '✓ URL valid' : '✗ URL tidak valid'}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Thumbnail Preview */}
                                                {isValidYoutubeUrl && youtubeUrlInput && (
                                                    <div className="relative">
                                                        <img
                                                            src={`https://img.youtube.com/vi/${getYouTubeVideoId(youtubeUrlInput)}/maxresdefault.jpg`}
                                                            alt="YouTube Preview"
                                                            className="w-full h-40 object-cover rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-90">
                                                                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M8 5v14l11-7z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 mt-6">
                                                <button
                                                    type="button"
                                                    onClick={handleYoutubeCancel}
                                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleYoutubeOk}
                                                    disabled={!isValidYoutubeUrl}
                                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        </Dialog.Panel>
                                    </div>
                                </Dialog>
                            </form>
                        </div>
                    </div>

                    {/* Posts Feed */}
                    {posts.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">Belum ada postingan</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Jadilah yang pertama membuat postingan!</p>
                        </div>
                    ) : (
                        posts.map((post, index) => (
                            <div
                                key={post.id}
                                id={`post-${post.id}`}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all"
                                data-aos="fade-up"
                                data-aos-delay={index < 3 ? index * 100 : 0}
                            >
                                {/* Post Header */}
                                <div className="p-4 flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
                                        style={!post.user.avatar_url ? { background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))` } : {}}>
                                        {post.user.avatar_url ? (
                                            <img src={post.user.avatar_url} alt={post.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            getInitials(post.user.name)
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{post.user.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{post.timestamp}</p>
                                    </div>
                                    {post.canDelete && (
                                        <button
                                            onClick={() => deletePost(post.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="Hapus postingan"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Post Content */}
                                {post.content && (
                                    <div className="px-4 pb-3">
                                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
                                    </div>
                                )}

                                {/* Post Images or YouTube Video */}
                                {post.youtube_url ? (
                                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                        <iframe
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(post.youtube_url)}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : post.images && Array.isArray(post.images) && post.images.length > 0 ? (
                                    <ImageCarousel
                                        images={Array.isArray(post.images) ? post.images : (typeof post.images === 'string' ? JSON.parse(post.images) : [])}
                                        onImageClick={(imageUrl, index) => {
                                            const allImages = Array.isArray(post.images) ? post.images : (typeof post.images === 'string' ? JSON.parse(post.images) : []);
                                            setViewerImage({
                                                isOpen: true,
                                                images: allImages,
                                                currentIndex: index
                                            });
                                        }}
                                    />
                                ) : null}

                                {/* Like & Comment Counts */}
                                <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>{post.likes} suka</span>
                                    <span>{post.comments.length} komentar</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around">
                                    <button
                                        onClick={() => toggleLike(post.id)}
                                        className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${post.isLiked
                                            ? 'text-red-500'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <svg className={`w-6 h-6 transition-transform ${post.isLiked ? 'scale-110' : ''}`} fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span className="font-medium">Suka</span>

                                        {/* Floating Heart Animation */}
                                        {likeAnimations[post.id] && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <svg
                                                    className="w-12 h-12 text-red-500 animate-float-heart"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                    style={{
                                                        animation: 'floatHeart 1s ease-out forwards'
                                                    }}
                                                >
                                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => toggleComments(post.id)}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span className="font-medium">Komentar</span>
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {showComments[post.id] && (
                                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                                        {/* Comments List */}
                                        <div className="space-y-3 mt-3">
                                            {post.comments.map(comment => (
                                                <div
                                                    key={comment.id}
                                                    id={`comment-${comment.id}`}
                                                    className="flex space-x-2 transition-all"
                                                >
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                                                        style={!comment.user.avatar_url ? { background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))` } : {}}>
                                                        {comment.user.avatar_url ? (
                                                            <img src={comment.user.avatar_url} alt={comment.user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            getInitials(comment.user.name)
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
                                                            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{comment.user.name}</p>
                                                            <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-3 mt-1 px-3">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{comment.timestamp}</p>
                                                            {comment.canDelete && (
                                                                <button
                                                                    onClick={() => deleteComment(comment.id)}
                                                                    className="text-xs text-red-500 hover:text-red-700"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Comment */}
                                        <div className="flex items-center space-x-2 mt-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                                                style={!auth.user.avatar_url ? { background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))` } : {}}>
                                                {auth.user.avatar_url ? (
                                                    <img src={auth.user.avatar_url} alt={auth.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    getInitials(auth.user.name)
                                                )}
                                            </div>
                                            <MentionInput
                                                value={commentText[post.id] || ''}
                                                onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        addComment(post.id);
                                                    }
                                                }}
                                                placeholder="Tulis komentar... (gunakan @ untuk mention)"
                                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:ring-2 focus:ring-purple-500 dark:text-gray-100 border-0"
                                                postId={post.id}
                                            />
                                            <button
                                                onClick={() => addComment(post.id)}
                                                disabled={!commentText[post.id]?.trim()}
                                                className="p-2 rounded-full transition-all disabled:opacity-50"
                                                style={{ color: 'var(--color-primary)' }}
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {/* Loading Indicator */}
                    {isLoadingMore && (
                        <div className="flex justify-center py-8">
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Memuat postingan...</span>
                            </div>
                        </div>
                    )}

                    {/* End of Posts */}
                    {!hasMore && posts.length > 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>Tidak ada postingan lagi</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type="danger"
            />

            <ImageViewer
                isOpen={viewerImage.isOpen}
                onClose={() => setViewerImage({ ...viewerImage, isOpen: false })}
                images={viewerImage.images}
                currentIndex={viewerImage.currentIndex}
            />

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />

            <BottomNav />
        </AuthenticatedLayout>
    );
}
