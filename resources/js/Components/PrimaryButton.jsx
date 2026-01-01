export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${disabled && 'opacity-25'
                } ` + className
            }
            style={{
                backgroundColor: 'var(--color-primary)',
                ...(disabled ? {} : {
                    // Note: Pseudo-classes like :hover, :active, :focus in inline styles are not directly supported by React.
                    // The onMouseEnter/onMouseLeave handlers are used for hover effects.
                    // For focus ring, we set the CSS variable for Tailwind's ring color.
                    ':hover': { backgroundColor: 'var(--color-primary-hover)' },
                    ':active': { backgroundColor: 'var(--color-primary-hover)' },
                    '--tw-ring-color': 'var(--color-primary)'
                })
            }}
            onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
            onMouseLeave={(e) => !disabled && (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
