import React, { useState } from 'react';
import { cn } from '../../design/tokens';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: number; // px
}

export const Avatar: React.FC<AvatarProps> = ({ className, src, alt, fallback, size = 36, ...props }) => {
    const [errored, setErrored] = useState(false);
    const style = { width: size, height: size } as React.CSSProperties;
    const showImage = src && !errored;
    return (
        <div
            className={cn('ui-avatar inline-flex items-center justify-center rounded-full overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--card))]', className)}
            style={style}
            {...props}
        >
            {showImage ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={() => setErrored(true)}
                />
            ) : (
                <span className="text-sm font-medium text-[rgb(var(--muted))] select-none">
                    {fallback?.slice(0, 2) || ''}
                </span>
            )}
        </div>
    );
};
