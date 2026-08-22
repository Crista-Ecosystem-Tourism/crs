import { GlassPanel } from '@/components/ui/glass'
import { Img } from '@/components/ui/Img'
import { isBlockEmpty, type ArticleBlock } from '@/types/wiki'

/** Отрисовка блочной статьи. Пустые блоки не показываем читателю. */
export function ArticleBlocks({ blocks }: { blocks: ArticleBlock[] }) {
  const visible = blocks.filter((b) => !isBlockEmpty(b))
  if (visible.length === 0) return null

  return (
    <div className="space-y-6">
      {visible.map((block) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={block.id} className="font-display text-2xl font-semibold text-text">
                {block.text}
              </h2>
            )

          case 'paragraph':
            return (
              <p
                key={block.id}
                className="max-w-[68ch] font-sans leading-relaxed text-text-secondary"
              >
                {block.text}
              </p>
            )

          case 'image':
            return (
              <figure key={block.id}>
                <div className="overflow-hidden rounded-lg">
                  <Img src={block.src} alt={block.alt} className="w-full object-cover" />
                </div>
                {block.caption && (
                  <figcaption className="mt-2 font-sans text-xs text-text-muted">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )

          case 'gallery':
            return (
              <div key={block.id} className="grid gap-3 sm:grid-cols-3">
                {block.items.map((item, i) => (
                  <div key={item.src + i} className="aspect-[4/3] overflow-hidden rounded-md">
                    <Img
                      src={item.src}
                      alt={item.alt}
                      className="h-full w-full object-cover transition-transform duration-[700ms] ease-out hover:scale-[1.06]"
                    />
                  </div>
                ))}
              </div>
            )

          case 'video':
            return (
              <figure key={block.id}>
                <div className="overflow-hidden rounded-lg bg-ink-950">
                  <video src={block.src} controls className="w-full" />
                </div>
                {block.caption && (
                  <figcaption className="mt-2 font-sans text-xs text-text-muted">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )

          case 'quote':
            return (
              <blockquote
                key={block.id}
                className="border-l-2 border-primary/50 pl-5"
              >
                <p className="max-w-[62ch] font-accent text-xl leading-relaxed text-text">
                  {block.text}
                </p>
                {block.author && (
                  <footer className="mt-2 font-sans text-xs text-text-muted">
                    {block.author}
                  </footer>
                )}
              </blockquote>
            )

          case 'list':
            return (
              <ul key={block.id} className="max-w-[68ch] space-y-2">
                {block.items
                  .filter((i) => i.trim())
                  .map((item, i) => (
                    <li key={i} className="flex items-start gap-3 font-sans text-sm leading-relaxed text-text-secondary">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
              </ul>
            )

          case 'inset':
            return (
              <GlassPanel key={block.id} variant="flat" className="p-5">
                {block.title && (
                  <p className="mb-3 font-sans text-xs uppercase tracking-wide text-text-muted">
                    {block.title}
                  </p>
                )}
                <dl className="space-y-1.5">
                  {block.lines
                    .filter((l) => l.trim())
                    .map((line, i) => {
                      // «слово - перевод» разводим в две колонки, иначе строка целиком
                      const parts = line.split(/\s+[-–]\s+/)
                      if (parts.length >= 2) {
                        return (
                          <div key={i} className="flex flex-wrap gap-x-3 font-mono text-sm">
                            <dt className="text-text">{parts[0]}</dt>
                            <dd className="text-text-secondary">{parts.slice(1).join(' - ')}</dd>
                          </div>
                        )
                      }
                      return (
                        <div key={i} className="font-mono text-sm text-text-secondary">
                          {line}
                        </div>
                      )
                    })}
                </dl>
              </GlassPanel>
            )
        }
      })}
    </div>
  )
}
