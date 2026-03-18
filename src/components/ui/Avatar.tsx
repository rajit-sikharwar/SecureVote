import { cn } from '@/lib/cn';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  colorBg?: string;
}

export function Avatar({ src, alt, fallback, size = 'md', className, colorBg }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-20 w-20 text-2xl',
  };

  const hasImage = Boolean(src);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-brand-100 text-brand-700 font-semibold",
        sizes[size],
        className
      )}
      style={!hasImage && colorBg ? { backgroundColor: colorBg, color: '#fff' } : undefined}
    >
      {hasImage ? (
        <img
          src={src!}
          alt={alt || fallback}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{fallback.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
