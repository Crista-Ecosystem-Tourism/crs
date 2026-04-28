/** Геокодирование города и страны (Nominatim). Без ключей; не злоупотреблять частыми запросами. */

export type GeocodeResult = { lat: number; lng: number }

export async function geocodeCityCountry(city: string, country: string): Promise<GeocodeResult | null> {
  const q = `${city.trim()}, ${country.trim()}`
  if (!city.trim() || !country.trim()) return null

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'ru',
        'User-Agent': 'CristaOnline/1.0 (https://crista.online; suitcase web)',
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as Array<{ lat: string; lon: string }>
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}
