import { ArrowLeft, ImagePlus } from 'lucide-react'

type PlaceByPhotoPanelProps = {
  onBack: () => void
}

export function PlaceByPhotoPanel({ onBack }: PlaceByPhotoPanelProps) {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="flex-shrink-0 p-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <ImagePlus className="w-5 h-5 text-primary shrink-0" />
            <h1 className="text-xl font-bold text-text truncate">Место по фото</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-6 ring-1 ring-accent/25">
            <ImagePlus className="w-8 h-8 text-accent" />
          </div>
          <p className="text-text-secondary leading-relaxed mb-3">
            Загружайте снимок — мы подберём место или похожие точки на карте. Этот режим пока готовится.
          </p>
          <p className="text-text-muted text-sm">Раздел появится в одном из следующих обновлений.</p>
        </div>
      </div>
    </div>
  )
}
