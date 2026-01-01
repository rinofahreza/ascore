import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function MentionInput({
    value,
    onChange,
    onKeyPress,
    placeholder = "Tulis komentar...",
    className = "",
    postId
}) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionQuery, setMentionQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef(null);

    // Detect @ mention
    useEffect(() => {
        const text = value || '';
        const beforeCursor = text.substring(0, cursorPosition);
        const match = beforeCursor.match(/@(\w*)$/);

        if (match) {
            const query = match[1];
            setMentionQuery(query);

            // Show suggestions immediately when @ is typed
            searchUsers(query);
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    }, [value, cursorPosition]);

    const searchUsers = async (query) => {
        try {
            const response = await axios.get(route('post.search-users'), {
                params: { q: query }
            });
            setSuggestions(response.data);
            setShowSuggestions(response.data.length > 0);
            setSelectedIndex(0);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const insertMention = (user) => {
        const text = value || '';
        const beforeCursor = text.substring(0, cursorPosition);
        const afterCursor = text.substring(cursorPosition);

        // Replace @query with @username
        const beforeMention = beforeCursor.replace(/@\w*$/, `@${user.name} `);
        const newText = beforeMention + afterCursor;
        const newCursorPos = beforeMention.length;

        onChange({ target: { value: newText } });
        setShowSuggestions(false);
        setSuggestions([]);

        // Set cursor position after mention
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        } else if (e.key === 'Enter' && suggestions.length > 0) {
            e.preventDefault();
            insertMention(suggestions[selectedIndex]);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleChange = (e) => {
        onChange(e);
        setCursorPosition(e.target.selectionStart);
    };

    const handleClick = (e) => {
        setCursorPosition(e.target.selectionStart);
    };

    return (
        <div className="relative flex-1">
            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                className={`w-full ${className}`}
                value={value}
                onChange={handleChange}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                onKeyPress={onKeyPress}
            />

            {/* Mention Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto z-10">
                    {suggestions.map((user, index) => (
                        <button
                            key={user.id}
                            type="button"
                            onClick={() => insertMention(user)}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))` }}
                                >
                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <span className="text-gray-900 dark:text-gray-100">{user.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
