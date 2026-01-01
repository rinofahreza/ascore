import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';

export default function AvatarUploadModal({ isOpen, onClose, currentAvatarUrl }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) return;

        setUploading(true);

        const formData = new FormData();
        formData.append('avatar', selectedImage);

        try {
            await axios.post(route('profile.avatar.update'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Reload page to show new avatar
            router.reload();
            onClose();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your avatar?')) return;

        try {
            await axios.delete(route('profile.avatar.delete'));
            router.reload();
            onClose();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete avatar');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Update Profile Photo
                </h3>

                {/* Preview */}
                <div className="flex justify-center mb-4">
                    <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : currentAvatarUrl ? (
                            <img src={currentAvatarUrl} alt="Current" className="w-full h-full object-cover" />
                        ) : (
                            <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Buttons */}
                <div className="space-y-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                        Choose Photo
                    </button>

                    {selectedImage && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    )}

                    {currentAvatarUrl && (
                        <button
                            onClick={handleDelete}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Delete Avatar
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                    >
                        Cancel
                    </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                    Max file size: 5MB. Formats: JPG, PNG
                </p>
            </div>
        </div>
    );
}
