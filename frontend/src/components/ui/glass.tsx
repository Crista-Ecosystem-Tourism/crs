import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Img } from '@/components/ui/Img'

/**
 * Crista Design System — стеклянные поверхности и словарь композиции.
 * См. DESIGN.md. Стекло здесь не украшение: это способ положить интерфейс
 * поверх фотографии, не закрывая её.
 */

/* ---------------------------------------------------------------- GlassPanel */

const glassPanelVariants = cva(
  'relative isolate before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:to-transparent',
  {
    variants: {
      variant: {
        /** Поверх тёмного фона приложения. */
        panel: 'glass before:via-white/25',
        /** Прямо поверх снимка: сильнее размытие, ярче кромка. */
        photo: 'glass-on-photo before:via-white/40',
        /** Внутри другой панели: стекло в стекло не вкладывается. */
        flat: 'bg-panel border border-hairline before:via-white/10',
      },
      radius: {
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
      },
    },
    defaultVariants: { variant: 'panel', radius: 'lg' },
  }
)

export interface GlassPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassPanelVariants> {
  asChild?: boolean
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant, radius, ...props }, ref) => (
    <div ref={ref} className={cn(glassPanelVariants({ variant, radius }), className)} {...props} />
  )
)
GlassPanel.displayName = 'GlassPanel'

/* --------------------------------------------------------------- IconButton */

const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full transition duration-base ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        glass: 'bg-panel-2 text-text hover:bg-panel-3 active:bg-panel-3',
        solid: 'bg-primary text-ink-950 hover:bg-primary-hover',
        ghost: 'text-text-secondary hover:bg-panel-2 hover:text-text',
      },
      size: {
        sm: 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4',
        md: 'h-10 w-10 [&_svg]:h-[18px] [&_svg]:w-[18px]',
        lg: 'h-12 w-12 [&_svg]:h-5 [&_svg]:w-5',
      },
    },
    defaultVariants: { variant: 'glass', size: 'md' },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Обязателен: кнопка без текста должна называть своё действие. */
  label: string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, label, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  )
)
IconButton.displayName = 'IconButton'

/* --------------------------------------------------------------------- Chip */

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-sans font-medium transition duration-fast ease-standard [&_svg]:h-3.5 [&_svg]:w-3.5',
  {
    variants: {
      variant: {
        default: 'bg-panel-2 text-text-secondary border border-hairline',
        active: 'bg-primary/15 text-primary border border-primary/30',
        accent: 'bg-accent/15 text-accent-soft border border-accent/25',
      },
      size: {
        sm: 'h-6 px-2.5 text-[11px]',
        md: 'h-8 px-3.5 text-xs',
      },
      interactive: {
        true: 'cursor-pointer hover:bg-panel-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        false: '',
      },
    },
    defaultVariants: { variant: 'default', size: 'md', interactive: false },
  }
)

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

export function Chip({ className, variant, size, interactive, ...props }: ChipProps) {
  return <span className={cn(chipVariants({ variant, size, interactive }), className)} {...props} />
}

/* ---------------------------------------------------------------- StatTile */

interface StatTileProps {
  icon: React.ReactNode
  value: string
  label: string
  className?: string
}

/** Мини-карточка «погода / дни / бюджет». Число ведёт, подпись поддерживает. */
export function StatTile({ icon, value, label, className }: StatTileProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-panel-2 text-primary [&_svg]:h-[18px] [&_svg]:w-[18px]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-sans text-lg font-semibold leading-tight text-text">
          {value}
        </span>
        <span className="block font-sans text-[11px] leading-tight text-text-muted">
          {label}
        </span>
      </span>
    </div>
  )
}

/* ----------------------------------------------------------------- ListRow */

interface ListRowProps {
  imageUrl?: string
  imageAlt?: string
  title: string
  subtitle?: string
  meta?: React.ReactNode
  action?: React.ReactNode
  onClick?: () => void
  className?: string
}

/**
 * Строка правой колонки: миниатюра 56x56, заголовок, подпись, локация, действие.
 * Повторяющийся паттерн из референсов («Must-See Destinations»).
 */
export function ListRow({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  meta,
  action,
  onClick,
  className,
}: ListRowProps) {
  const interactive = Boolean(onClick)
  return (
    <div
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        'group flex items-center gap-3.5 rounded-lg p-2.5 transition duration-base ease-standard',
        interactive &&
          'cursor-pointer hover:bg-panel-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
    >
      {imageUrl && (
        <Img
          src={imageUrl}
          alt={imageAlt ?? title}
          className="h-14 w-14 shrink-0 rounded-md object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm font-semibold leading-snug text-text">{title}</p>
        {subtitle && (
          <p className="truncate font-sans text-xs leading-snug text-text-secondary">{subtitle}</p>
        )}
        {meta && (
          <p className="mt-1 flex items-center gap-1 truncate font-sans text-[11px] text-text-muted [&_svg]:h-3 [&_svg]:w-3">
            {meta}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

/* ------------------------------------------------------------ SectionHeading */

interface SectionHeadingProps {
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function SectionHeading({ children, action, className }: SectionHeadingProps) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4', className)}>
      <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-text sm:text-[28px]">
        {children}
      </h2>
      {action}
    </div>
  )
}

/* --------------------------------------------------------------- DisplayTitle */

interface DisplayTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2'
  size?: 'lg' | 'xl'
}

/** Название города или страны. Всегда serif: это подпись Crista. */
export function DisplayTitle({
  as: Tag = 'h1',
  size = 'lg',
  className,
  ...props
}: DisplayTitleProps) {
  return (
    <Tag
      className={cn(
        'font-display font-semibold tracking-tight text-text [text-wrap:balance]',
        size === 'xl'
          ? 'text-[clamp(2.75rem,6vw,5rem)] leading-[1.02]'
          : 'text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05]',
        className
      )}
      {...props}
    />
  )
}
