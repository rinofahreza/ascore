import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import ConfirmDialog from '@/Components/ConfirmDialog';
import ImageViewer from '@/Components/ImageViewer';
import ImageCarousel from '@/Components/ImageCarousel';
import { Head, useForm, router, Link } from '@inertiajs/react';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import imageCompression from 'browser-image-compression';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Swal from 'sweetalert2';

export default function Post({ auth, posts: initialPosts, pagination }) {
    const { data, setData, post, processing, reset } = useForm({
        content: '',
        images: [],
        youtube_url: '',
        link_url: '',
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isCompressing, setIsCompressing] = useState(false);
    const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
    const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
    const [isValidYoutubeUrl, setIsValidYoutubeUrl] = useState(false);
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkUrlInput, setLinkUrlInput] = useState('');
    const [isValidLinkUrl, setIsValidLinkUrl] = useState(false);
    const [showComments, setShowComments] = useState({});
    const [expandedPosts, setExpandedPosts] = useState({});
    const [commentText, setCommentText] = useState({});
    const [viewerImage, setViewerImage] = useState({ isOpen: false, images: [], currentIndex: 0 });
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

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Fetch notifications and unread count
    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
            const response = await axios.get(`/notifications?limit=6&t=${Date.now()}`);
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Poll for unread count every minute
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const toggleNotifications = () => {
        if (!showNotifications) {
            fetchNotifications();
            fetchUnreadCount(); // Refresh count too
        }
        setShowNotifications(!showNotifications);
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.read_at) {
            try {
                await axios.post(`/notifications/read/${notification.id}`);
                setNotifications(prev => prev.map(n =>
                    n.id === notification.id ? { ...n, read_at: new Date() } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
        setShowNotifications(false);

        // Navigate
        if (notification.data.post_id) {
            const commentId = notification.data.comment_id;
            const url = commentId
                ? `/post/${notification.data.post_id}?comment=${commentId}`
                : `/post/${notification.data.post_id}`;
            router.visit(url);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Mock Stories Data
    const stories = [
        { id: 'create', name: 'Share Story', isUser: true },
        { id: 1, name: 'Jone', image: 'https://i.pravatar.cc/150?u=1' },
        { id: 2, name: 'Smith', image: 'https://i.pravatar.cc/150?u=2' },
        { id: 3, name: 'Kriston', image: 'https://i.pravatar.cc/150?u=3' },
        { id: 4, name: 'Ryan', image: 'https://i.pravatar.cc/150?u=4' },
        { id: 5, name: 'Anna', image: 'https://i.pravatar.cc/150?u=5' },
    ];

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const validateYoutubeUrl = (url) => {
        const videoId = getYouTubeVideoId(url);
        setIsValidYoutubeUrl(videoId !== null);
        return videoId !== null;
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setYoutubeUrlInput(text);
            validateYoutubeUrl(text);
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    const handleYoutubeOk = () => {
        if (isValidYoutubeUrl) {
            setData('youtube_url', youtubeUrlInput);
            setYoutubeModalOpen(false);
        }
    };

    const handleYoutubeCancel = () => {
        setYoutubeUrlInput('');
        setIsValidYoutubeUrl(false);
        setYoutubeModalOpen(false);
    };

    const removeYoutubeUrl = () => {
        setData('youtube_url', '');
        setYoutubeUrlInput('');
        setIsValidYoutubeUrl(false);
    };

    const validateLinkUrl = (url) => {
        try {
            new URL(url);
            setIsValidLinkUrl(true);
            return true;
        } catch {
            setIsValidLinkUrl(false);
            return false;
        }
    };

    const handleLinkOk = () => {
        if (isValidLinkUrl) {
            setData('link_url', linkUrlInput);
            setLinkModalOpen(false);
        }
    };

    const handleLinkCancel = () => {
        setLinkUrlInput('');
        setIsValidLinkUrl(false);
        setLinkModalOpen(false);
    };

    const removeLinkUrl = () => {
        setData('link_url', '');
        setLinkUrlInput('');
        setIsValidLinkUrl(false);
    };

    useEffect(() => {
        AOS.refresh();
    }, [posts]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsCompressing(true);
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/jpeg' };

            const compressedBlob = await imageCompression(file, options);
            const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });

            const reader = new FileReader();
            const preview = await new Promise(resolve => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(compressedFile);
            });

            setData('images', [compressedFile]);
            setImagePreviews([preview]);
        } catch (error) {
            console.error('Error compressing image:', error);
            Swal.fire('Error', 'Gagal memproses gambar.', 'error');
        } finally {
            setIsCompressing(false);
            e.target.value = '';
        }
    };

    const removeImage = (index) => {
        setData('images', []);
        setImagePreviews([]);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', data.content || '');
        if (data.youtube_url) formData.append('youtube_url', data.youtube_url);
        if (data.link_url) formData.append('link_url', data.link_url);
        data.images.forEach((image, index) => formData.append(`images[${index}]`, image));

        router.post(route('post.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreviews([]);
                setYoutubeUrlInput('');
                setIsValidYoutubeUrl(false);
                setLinkUrlInput('');
                setIsValidLinkUrl(false);
                router.get(route('post.index'), { page: 1 }, {
                    preserveState: true,
                    preserveScroll: false,
                    only: ['posts', 'pagination'],
                    onSuccess: (page) => {
                        setPosts(page.props.posts);
                        setCurrentPage(page.props.pagination.current_page);
                        setHasMore(page.props.pagination.has_more);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            },
            onError: (errors) => console.error('Upload errors:', errors)
        });
    };

    const toggleLike = (postId) => {
        setLikeAnimations(prev => ({ ...prev, [postId]: true }));
        setTimeout(() => setLikeAnimations(prev => ({ ...prev, [postId]: false })), 1000);

        setPosts(posts.map(p => {
            if (p.id === postId) {
                return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
            }
            return p;
        }));

        router.post(route('post.like', postId), {}, {
            preserveScroll: true,
            onError: () => {
                setPosts(posts.map(p => {
                    if (p.id === postId) {
                        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes + 1 : p.likes - 1 };
                    }
                    return p;
                }));
            }
        });
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
        if (!showComments[postId]) {
            setTimeout(() => {
                commentInputRefs.current[postId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                commentInputRefs.current[postId]?.focus();
            }, 100);
        }
    };

    const addComment = (postId) => {
        const comment = commentText[postId];
        if (!comment?.trim()) return;

        router.post(route('post.comment', postId), { content: comment }, {
            preserveScroll: true,
            only: ['posts', 'pagination'],
            onSuccess: (page) => {
                const updatedPosts = page.props.posts;
                setPosts(prevPosts => prevPosts.map(p => updatedPosts.find(up => up.id === p.id) || p));
                setCommentText(prev => ({ ...prev, [postId]: '' }));
            }
        });
    };

    const deleteComment = (commentId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Hapus Komentar',
            message: 'Hapus komentar ini?',
            onConfirm: () => {
                router.delete(route('post.comment.delete', commentId), {
                    preserveScroll: true,
                    onSuccess: () => {
                        setPosts(posts.map(p => ({ ...p, comments: p.comments.filter(c => c.id !== commentId) })));
                    }
                });
            }
        });
    };

    const deletePost = (postId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Hapus Postingan',
            message: 'Hapus postingan ini?',
            onConfirm: () => {
                router.delete(route('post.delete', postId), {
                    preserveScroll: true,
                    onSuccess: () => setPosts(posts.filter(p => p.id !== postId))
                });
            }
        });
    };

    const toggleSave = (postId) => {
        router.post(route('post.save', postId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setPosts(posts.map(p => {
                    if (p.id === postId) {
                        return {
                            ...p,
                            is_saved: !p.is_saved,
                            saved_count: p.is_saved ? Math.max(0, (p.saved_count || 0) - 1) : (p.saved_count || 0) + 1
                        };
                    }
                    return p;
                }));
            }
        });
    };

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const loadMore = () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        const nextPage = currentPage + 1;

        router.get(route('post.index'), { page: nextPage }, {
            preserveState: true,
            preserveScroll: true,
            only: ['posts', 'pagination'],
            onSuccess: (page) => {
                setPosts(prev => [...prev, ...page.props.posts]);
                setCurrentPage(page.props.pagination.current_page);
                setHasMore(page.props.pagination.has_more);
                setIsLoadingMore(false);
            },
            onError: () => setIsLoadingMore(false)
        });
    };

    useEffect(() => {
        const handleScroll = () => {
            if (isLoadingMore || !hasMore) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                loadMore();
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoadingMore, hasMore, currentPage]);

    return (
        <AuthenticatedLayout user={auth.user} header={null} hideNav={true}>
            <Head title="Social Mate" />

            <div className="bg-white dark:bg-gray-900 min-h-screen pb-24">
                {/* Sticky Header */}
                <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-200 safe-area-top pt-2">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                        <h1 className="text-xl font-bold font-sans tracking-wide">
                            <span className="text-gray-800 dark:text-white">SOCIAL</span>
                            <span className="text-cyan-500 ml-1">MATE</span>
                        </h1>
                        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                            <button className="hover:text-cyan-500 transition"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>

                            {/* Notification Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={toggleNotifications}
                                    className="hover:text-cyan-500 transition relative p-1"
                                >
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </button>

                                {/* Dropdown Menu */}
                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotifications(false)}></div>
                                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in-up">
                                            <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750">
                                                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Notifikasi</h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllAsRead} className="text-xs text-cyan-500 hover:text-cyan-600 font-medium">
                                                        Tandai semua dibaca
                                                    </button>
                                                )}
                                            </div>

                                            <div className="max-h-80 overflow-y-auto">
                                                {loadingNotifications ? (
                                                    <div className="p-4 text-center text-gray-400 text-sm">Memuat...</div>
                                                ) : notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-500 text-sm">
                                                        <p>Belum ada notifikasi baru</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(notification => (
                                                        <div
                                                            key={notification.id}
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className={`p-3 border-b border-gray-50 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${!notification.read_at ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                                                                    {getInitials(notification.data.actor_name || 'System')}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-gray-800 dark:text-gray-200 leading-snug">
                                                                        <span className="font-bold">{notification.data.actor_name}</span>
                                                                        {notification.type === 'like' ? ' menyukai postingan Anda' :
                                                                            notification.type === 'comment' ? ' mengomentari postingan Anda' : ' berinteraksi dengan Anda'}
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                                        {new Date(notification.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                                {!notification.read_at && (
                                                                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1"></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <div className="p-2 text-center border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                                                <Link href={route('notifikasi')} className="text-xs text-cyan-500 hover:text-cyan-600 font-medium block w-full">
                                                    Lihat Semua Notifikasi
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Link href={route('post.index', { saved: true })} className="hover:text-cyan-500 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
                    {/* Create Post Section */}

                    <div className="bg-blue-50/50 dark:bg-gray-800 rounded-2xl p-4 border border-blue-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                {auth.user.avatar_url ? (
                                    <img src={auth.user.avatar_url} className="w-full h-full object-cover" alt="User" />
                                ) : (
                                    <div className="w-full h-full bg-cyan-500 flex items-center justify-center text-white font-bold">{getInitials(auth.user.name)}</div>
                                )}
                            </div>
                            <textarea
                                placeholder="What's on your head?"
                                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 resize-none h-auto min-h-[40px] text-base"
                                rows="2"
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                            />
                        </div>

                        {/* Image/Video Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="mb-3 relative rounded-xl overflow-hidden group">
                                <img src={imagePreviews[0]} className="w-full max-h-96 object-cover" />
                                <button
                                    onClick={() => removeImage(0)}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        )}
                        {data.youtube_url && (
                            <div className="mb-3 relative rounded-lg overflow-hidden">
                                <img src={`https://img.youtube.com/vi/${getYouTubeVideoId(data.youtube_url)}/maxresdefault.jpg`} className="w-full h-32 object-cover opacity-70" />
                                <div className="absolute inset-0 flex items-center justify-center"><div className="bg-red-600 rounded-full p-2"><svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div></div>
                                <button onClick={removeYoutubeUrl} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                            </div>
                        )}
                        {data.link_url && (
                            <div className="mb-3 relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-600 flex items-center gap-3">
                                <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l-1.172-1.172a4 4 0 015.656 0l5 5a4 4 0 005.656-5.656l-5-5a4 4 0 00-5.656 0l-1.172 1.172a4 4 0 105.656 5.656L15 17" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Terlampir</h4>
                                    <p className="text-xs text-blue-500 truncate">{data.link_url}</p>
                                </div>
                                <button onClick={removeLinkUrl} className="bg-red-500 text-white rounded-full p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                            </div>
                        )}


                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                            <div className="flex gap-4">
                                {/* Image Button */}
                                <label className={`flex items-center gap-2 text-sm font-medium transition ${data.youtube_url || data.link_url ? 'text-gray-300 cursor-not-allowed' : 'text-cyan-500 cursor-pointer hover:text-cyan-600'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Image
                                    <input type="file" accept="image/*" multiple={false} className="hidden" onChange={handleImageUpload} disabled={isCompressing || !!data.youtube_url || !!data.link_url} />
                                </label>

                                {/* Video Button */}
                                <button
                                    type="button"
                                    onClick={() => setYoutubeModalOpen(true)}
                                    disabled={data.images.length > 0 || !!data.link_url}
                                    className={`flex items-center gap-2 text-sm font-medium transition ${data.images.length > 0 || data.link_url ? 'text-gray-300 cursor-not-allowed' : 'text-blue-500 hover:text-blue-600'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    Videos
                                </button>

                                {/* Attach Button */}
                                <button
                                    type="button"
                                    onClick={() => setLinkModalOpen(true)}
                                    disabled={data.images.length > 0 || !!data.youtube_url}
                                    className={`flex items-center gap-2 text-sm font-medium transition ${data.images.length > 0 || data.youtube_url ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-600'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    Attach
                                </button>
                            </div>
                            {(data.content || data.images.length > 0 || data.youtube_url || data.link_url) && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={processing || isCompressing}
                                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition shadow-md disabled:opacity-50"
                                >
                                    {processing ? 'Posting...' : 'Post'}
                                </button>
                            )}
                        </div>
                    </div>


                    {/* Stories Section */}
                    {/* <div className="pl-4 pb-4 overflow-x-auto no-scrollbar">
                    <div className="flex gap-4">
                        {stories.map((story) => (
                            <div key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                                <div className={`w-16 h-16 rounded-full p-0.5 ${story.id === 'create' ? 'border border-dashed border-cyan-500' : 'border-2 border-cyan-500'}`}>
                                    <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100">
                                        {story.id === 'create' ? (
                                            <div className="w-full h-full flex items-center justify-center bg-cyan-50">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                            </div>
                                        ) : (
                                            <img src={story.image} className="w-full h-full object-cover" alt={story.name} />
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{story.name}</span>
                            </div>
                        ))}
                    </div>
                </div> */}


                    {/* Feed Feed */}
                    <div className="space-y-5">
                        {posts.map((post, index) => (
                            <div key={post.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden" data-aos="fade-up">
                                {/* Card Header */}
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                        {post.user.avatar_url ? (
                                            <img src={post.user.avatar_url} className="w-full h-full object-cover" alt={post.user.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold">{getInitials(post.user.name)}</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{post.user.name}</h3>
                                        <p className="text-xs text-gray-500">{post.timestamp}</p>
                                    </div>
                                    {post.canDelete && (
                                        <button onClick={() => deletePost(post.id)} className="text-gray-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="px-4 pb-2">
                                    <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                                        {(expandedPosts[post.id] || !post.content || post.content.length <= 200
                                            ? post.content
                                            : `${post.content.substring(0, 200)}...`
                                        ).split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                                            part.match(/^https?:\/\//) ? (
                                                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                                                    {part}
                                                </a>
                                            ) : (
                                                part
                                            )
                                        )}
                                        {post.content && post.content.length > 200 && (
                                            <button
                                                onClick={() => setExpandedPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                                className="text-blue-500 hover:text-blue-600 font-medium ml-1 hover:underline text-xs"
                                            >
                                                {expandedPosts[post.id] ? 'Sembunyikan' : 'Baca Selengkapnya'}
                                            </button>
                                        )}
                                    </p>
                                </div>

                                {/* Media */}
                                {post.youtube_url ? (
                                    <div className="w-full aspect-video">
                                        <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYouTubeVideoId(post.youtube_url)}`} frameBorder="0" allowFullScreen></iframe>
                                    </div>
                                ) : post.images && post.images.length > 0 && (
                                    <div className="w-full mt-2 cursor-pointer" onClick={() => setViewerImage({ isOpen: true, images: post.images, currentIndex: 0 })}>
                                        <img
                                            src={post.images[0]}
                                            alt="Post Image"
                                            className="w-full max-h-[500px] object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                {post.link_url && (
                                    <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="block mt-2 mx-4 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden group hover:border-blue-200 transition">
                                        <div className="p-3 flex items-center gap-3">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-blue-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l-1.172-1.172a4 4 0 015.656 0l5 5a4 4 0 005.656-5.656l-5-5a4 4 0 00-5.656 0l-1.172 1.172a4 4 0 105.656 5.656L15 17" /></svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Link Terlampir</p>
                                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate group-hover:underline">{post.link_url}</p>
                                            </div>
                                            <div className="text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </div>
                                        </div>
                                    </a>
                                )}

                                {/* Actions */}
                                <div className="p-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-700 mt-2">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => toggleLike(post.id)}
                                            className={`flex items-center gap-1.5 text-sm font-medium transition ${post.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${post.isLiked ? 'fill-current' : 'none'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                            {post.likes}
                                        </button>
                                        <button
                                            onClick={() => toggleComments(post.id)}
                                            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-cyan-500 transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                            {post.comments ? post.comments.length : 0}
                                        </button>
                                        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-cyan-500 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                        </button>
                                    </div>
                                    <button onClick={() => toggleSave(post.id)} className={`flex items-center gap-1.5 transition ${post.is_saved ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${post.is_saved ? 'fill-current' : 'none'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                        <span className="text-sm font-medium">{post.saved_count > 0 ? post.saved_count : ''}</span>
                                    </button>
                                </div>

                                {/* Comment Section (Collapsible) */}
                                {showComments[post.id] && (
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in-down">
                                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                            {post.comments.map(comment => (
                                                <div key={comment.id} id={`comment-${comment.id}`} className="flex gap-2 text-sm">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                                        {comment.user.avatar_url ? (
                                                            <img src={comment.user.avatar_url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-xs">{getInitials(comment.user.name)}</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-r-xl rounded-bl-xl shadow-sm">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-xs">{comment.user.name}</span>
                                                            <span className="text-[10px] text-gray-400">{comment.timestamp}</span>
                                                        </div>
                                                        <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                                                        {comment.canDelete && (
                                                            <button onClick={() => deleteComment(comment.id)} className="text-[10px] text-red-400 hover:text-red-500 mt-1">Hapus</button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                ref={el => commentInputRefs.current[post.id] = el}
                                                type="text"
                                                placeholder="Tulis komentar..."
                                                className="flex-1 rounded-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-cyan-500 focus:border-cyan-500"
                                                value={commentText[post.id] || ''}
                                                onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                                            />
                                            <button onClick={() => addComment(post.id)} className="text-cyan-500 hover:text-cyan-600 font-medium text-sm p-2">Kirim</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                Belum ada postingan.
                            </div>
                        )}

                        {isLoadingMore && <div className="text-center py-4 text-gray-400 text-sm">Memuat postingan lainnya...</div>}
                    </div>
                </div>
            </div>

            <BottomNav />
            <ConfirmDialog {...confirmDialog} onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} />
            <ImageViewer isOpen={viewerImage.isOpen} images={viewerImage.images} initialIndex={viewerImage.currentIndex} onClose={() => setViewerImage(prev => ({ ...prev, isOpen: false }))} />

            {/* YouTube Custom Modal for New Design */}
            <Dialog open={youtubeModalOpen} onClose={handleYoutubeCancel} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                        <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white mb-4">Link YouTube</Dialog.Title>
                        <input type="text" value={youtubeUrlInput} onChange={e => { setYoutubeUrlInput(e.target.value); validateYoutubeUrl(e.target.value); }} className="w-full rounded-lg border-gray-300 mb-4" placeholder="https://youtube.com/..." />
                        {isValidYoutubeUrl && <div className="mb-4 text-green-500 text-sm">URL Valid</div>}
                        <div className="flex justify-end gap-2">
                            <button onClick={handleYoutubeCancel} className="px-4 py-2 text-gray-500">Batal</button>
                            <button onClick={handleYoutubeOk} disabled={!isValidYoutubeUrl} className="px-4 py-2 bg-cyan-500 text-white rounded-lg disabled:opacity-50">Simpan</button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>

            {/* Link Custom Modal */}
            <Dialog open={linkModalOpen} onClose={handleLinkCancel} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                        <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sematkan Link</Dialog.Title>
                        <input type="text" value={linkUrlInput} onChange={e => { setLinkUrlInput(e.target.value); validateLinkUrl(e.target.value); }} className="w-full rounded-lg border-gray-300 mb-4" placeholder="https://example.com" />
                        {isValidLinkUrl && <div className="mb-4 text-green-500 text-sm">URL Valid</div>}
                        <div className="flex justify-end gap-2">
                            <button onClick={handleLinkCancel} className="px-4 py-2 text-gray-500">Batal</button>
                            <button onClick={handleLinkOk} disabled={!isValidLinkUrl} className="px-4 py-2 bg-cyan-500 text-white rounded-lg disabled:opacity-50">Simpan</button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </AuthenticatedLayout >
    );
}
