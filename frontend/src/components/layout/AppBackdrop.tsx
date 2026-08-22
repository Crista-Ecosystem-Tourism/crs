import { useEffect, useState } from 'react'

/**
 * Фон приложения: размытый снимок под всем интерфейсом.
 * Без него стеклянные панели преломляют пустоту и читаются как обычные
 * полупрозрачные блоки. Кадр меняется под выбранную страну.
 */

const backdrops: Record<string, string> = {
  RU: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=1600&q=60',
  GE: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1600&q=60',
  TR: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1600&q=60',
  BE: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600&q=60',
}

const DEFAULT_BACKDROP = backdrops.RU

interface AppBackdropProps {
  /** ISO выбранной страны: кадр подстраивается под неё */
  countryIso?: string
}

export function AppBackdrop({ countryIso }: AppBackdropProps) {
  const src = (countryIso && backdrops[countryIso]) || DEFAULT_BACKDROP
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    const img = new Image()
    img.src = src
    img.onload = () => setLoaded(true)
    return () => {
      img.onload = null
    }
  }, [src])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Снимок: сильно размыт и приглушён, работает как среда за стеклом */}
      <div
        className="absolute inset-[-8%] bg-cover bg-center transition-opacity duration-[900ms] ease-out"
        style={{
          backgroundImage: `url(${src})`,
          filter: 'blur(52px) saturate(1.08)',
          opacity: loaded ? 0.8 : 0,
        }}
      />

      {/* Плотность у краёв: сцена ярче в центре, темнее по углам */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_40%,transparent_0%,rgba(var(--scrim-rgb),0.75)_100%)]" />

      {/* Нейтральный свет вместо цветных пятен: цвет должен давать сам кадр */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.07),transparent_58%)]" />

      {/* Лёгкая подложка: основную плотность даёт стекло самого листа */}
      <div className="absolute inset-0 bg-[rgb(var(--scrim-rgb))] opacity-[0.22]" />
    </div>
  )
}
