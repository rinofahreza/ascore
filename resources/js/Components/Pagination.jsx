import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (links.length <= 3) return null;

    return (
        <div className="flex flex-wrap justify-center sm:justify-end gap-1">
            {links.map((link, key) => (
                link.url === null ? (
                    <div
                        key={key}
                        className="mb-1 px-4 py-2 text-sm text-gray-500 border rounded cursor-not-allowed bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        href={link.url}
                        className={`mb-1 px-4 py-2 text-sm border rounded hover:bg-white focus:text-indigo-500 focus:border-indigo-500 hover:shadow-sm dark:border-gray-600 dark:hover:bg-gray-700
                            ${link.active
                                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-600'
                                : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            ))}
        </div>
    );
}
