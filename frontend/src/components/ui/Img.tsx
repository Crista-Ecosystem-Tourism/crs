import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  /** Классы для контейнера-заглушки, если снимок не загрузился. */
  fallbackClassName?: string
}

/**
 * Фотография с честной заглушкой. Битая ссылка не должна ронять композицию
 * альт-текстом поверх соседнего элемента.
 */
export function Img({ src, alt, className, fallbackClassName, ...props }: ImgProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-violet-700 to-ink-850 text-text-muted',
          className,
          fallbackClassName
        )}
      >
        <ImageOff className="h-1/3 max-h-6 w-1/3 max-w-6" aria-hidden="true" />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  )
}
