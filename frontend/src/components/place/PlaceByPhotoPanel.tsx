import { useRef, useState } from 'react'
import { ArrowLeft, ImagePlus, Upload, X, MapPin, Sparkles, Loader2 } from 'lucide-react'
import { GlassPanel, Chip, IconButton, DisplayTitle } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { Img } from '@/components/ui/Img'
import { useApp } from '@/context/AppContext'

interface PlaceByPhotoPanelProps {
  onBack: () => void
}

interface Guess {
  name: string
  place: string
  confidence: number
  image: string
}

/** Разбор снимка имитируется: бэкенда нет, но поток и состояния настоящие */
const mockGuesses: Guess[] = [
  {
    name: 'Дворцовый мост',
    place: 'Нева, Санкт-Петербург',
    confidence: 92,
    image: 'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=400&q=80',
  },
  {
    name: 'Собор Василия Блаженного',
    place: 'Красная площадь, Москва',
    confidence: 61,
    image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400&q=80',
  },
]

export function PlaceByPhotoPanel({ onBack }: PlaceByPhotoPanelProps) {
  const { newChat, sendMessage } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setState('analyzing')
    setTimeout(() => setState('done'), 1400)
  }

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setState('idle')
    if (inputRef.current) inputRef.current.value = ''
  }

  const plan = (guess: Guess) => {
    newChat()
    setTimeout(() => sendMessage(`Расскажи про место: ${guess.name}, ${guess.place}`), 100)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[900px] items-center gap-3 px-5 pb-2 pt-6 sm:px-6">
          <IconButton label="Назад" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
            <ArrowLeft />
          </IconButton>
          <h1 className="font-display text-2xl font-semibold text-text">Место по фото</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[900px] px-5 pb-8 pt-4 sm:px-6">
        <p className="mb-6 max-w-[68ch] font-accent text-lg leading-relaxed text-text-secondary">
          Загрузите снимок, и Crista подскажет, что на нём изображено и где это находится.
        </p>

        {!preview ? (
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              handleFile(e.dataTransfer.files[0])
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors ${
              dragging
                ? 'border-primary/60 bg-primary/[0.06]'
                : 'border-hairline-2 hover:border-hairline-3 hover:bg-panel'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="font-sans text-sm font-semibold text-text">
              Перетащите снимок или выберите файл
            </span>
            <span className="mt-1 font-sans text-xs text-text-muted">
              JPG, PNG или HEIC, до 12 МБ
            </span>
            <Button variant="secondary" className="mt-5" asChild>
              <span>
                <Upload />
                Выбрать файл
              </span>
            </Button>
          </label>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <GlassPanel className="relative overflow-hidden p-0">
              <img src={preview} alt="Загруженный снимок" className="w-full object-contain" />
              <span className="absolute right-3 top-3">
                <IconButton label="Убрать снимок" onClick={reset}>
                  <X />
                </IconButton>
              </span>
            </GlassPanel>

            <div className="space-y-4">
              {state === 'analyzing' ? (
                <GlassPanel className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                  <p className="font-sans text-sm text-text-secondary">Разбираем снимок</p>
                  <p className="font-sans text-xs text-text-muted">
                    Сравниваем с базой мест и ориентиров
                  </p>
                </GlassPanel>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h2 className="font-sans text-sm font-semibold text-text">Похоже на это</h2>
                  </div>

                  {mockGuesses.map((g) => (
                    <GlassPanel key={g.name} className="p-4">
                      <div className="flex items-start gap-3">
                        <Img
                          src={g.image}
                          alt={g.name}
                          className="h-14 w-14 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-lg font-semibold text-text">
                            {g.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 truncate font-sans text-xs text-text-muted">
                            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                            {g.place}
                          </p>
                          <Chip size="sm" className="mt-2 tabular">
                            Совпадение {g.confidence}%
                          </Chip>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => plan(g)}
                      >
                        Узнать подробнее
                      </Button>
                    </GlassPanel>
                  ))}

                  <p className="font-sans text-xs leading-relaxed text-text-muted">
                    Разбор снимка здесь имитирован: подключение к модели распознавания
                    появится вместе с бэкендом.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {!preview && (
          <GlassPanel className="mt-6 p-5">
            <DisplayTitle as="h2" className="!text-2xl">Зачем это нужно</DisplayTitle>
            <p className="mt-2 max-w-[60ch] font-sans text-sm leading-relaxed text-text-secondary">
              Увидели красивый кадр в чужой ленте и не знаете, где это снято. Загрузите его сюда,
              и Crista найдёт место, добавит его на карту и предложит маршрут.
            </p>
          </GlassPanel>
        )}
      </div>
    </div>
  )
}
