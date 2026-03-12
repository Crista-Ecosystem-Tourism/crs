/**
 * Mapping of city names to IATA airport codes.
 * Covers cities from our vector DB + popular Russian departure cities.
 */

const IATA_MAP: Record<string, string> = {
  // === Города из нашей БД (destinations) ===
  'сочи': 'AER',
  'адлер': 'AER',
  'красная поляна': 'AER',
  'эсто-садок': 'AER',
  'хоста': 'AER',
  'лазаревское': 'AER',
  'дагомыс': 'AER',
  'санкт-петербург': 'LED',
  'петергоф': 'LED',
  'пушкин': 'LED',
  'кронштадт': 'LED',
  'ломоносов': 'LED',
  'зеленогорск': 'LED',
  'павловск': 'LED',
  'москва': 'SVO',
  'касабланка': 'CMN',
  'манчестер': 'MAN',
  'краснодар': 'KRR',
  'казань': 'KZN',

  // === Популярные города вылета РФ ===
  'новосибирск': 'OVB',
  'екатеринбург': 'SVX',
  'красноярск': 'KJA',
  'нижний новгород': 'GOJ',
  'ростов-на-дону': 'ROV',
  'владивосток': 'VVO',
  'самара': 'KUF',
  'уфа': 'UFA',
  'пермь': 'PEE',
  'воронеж': 'VOZ',
  'волгоград': 'VOG',
  'омск': 'OMS',
  'челябинск': 'CEK',
  'тюмень': 'TJM',
  'иркутск': 'IKT',
  'хабаровск': 'KHV',
  'калининград': 'KGD',
  'минеральные воды': 'MRV',
  'кисловодск': 'MRV',
  'махачкала': 'MCX',
  'астрахань': 'ASF',
  'мурманск': 'MMK',
  'архангельск': 'ARH',
  'сургут': 'SGC',
  'томск': 'TOF',
  'барнаул': 'BAX',

  // === Международные из БД ===
  'бангкок': 'BKK',
  'паттайя': 'UTP',
  'бали': 'DPS',
  'гонконг': 'HKG',
  'дубай': 'DXB',
  'стамбул': 'IST',
  'будапешт': 'BUD',
  'венеция': 'VCE',
  'рига': 'RIX',
  'таллин': 'TLL',
  'стокгольм': 'ARN',
  'минск': 'MSQ',
  'алматы': 'ALA',
  'тбилиси': 'TBS',
  'ереван': 'EVN',
  'баку': 'GYD',
  'ташкент': 'TAS',
  'бишкек': 'FRU',
  'париж': 'CDG',
  'рим': 'FCO',
  'барселона': 'BCN',
  'лондон': 'LHR',
  'берлин': 'BER',
  'прага': 'PRG',
  'вена': 'VIE',
  'амстердам': 'AMS',
  'токио': 'NRT',
  'сеул': 'ICN',
  'пекин': 'PEK',
  'шанхай': 'PVG',
  'анталья': 'AYT',
  'гоа': 'GOI',
  'мале': 'MLE',
  'пхукет': 'HKT',
  'хургада': 'HRG',
  'шарм-эль-шейх': 'SSH',
}

/** Common aliases for city names (lowercase) */
const ALIASES: Record<string, string> = {
  'питер': 'санкт-петербург',
  'спб': 'санкт-петербург',
  'петербург': 'санкт-петербург',
  'с-пб': 'санкт-петербург',
  'с.петербург': 'санкт-петербург',
  'с.-петербург': 'санкт-петербург',
  'мск': 'москва',
  'нск': 'новосибирск',
  'новосиб': 'новосибирск',
  'екб': 'екатеринбург',
  'ебург': 'екатеринбург',
  'нижний': 'нижний новгород',
  'ростов': 'ростов-на-дону',
  'владик': 'владивосток',
  'кр-р': 'краснодар',
  'крд': 'краснодар',
  'красноярск': 'красноярск',
  'крск': 'красноярск',
  'минводы': 'минеральные воды',
  'мин. воды': 'минеральные воды',
  'мин воды': 'минеральные воды',
}

function normalize(city: string): string {
  const lower = city.toLowerCase().trim()
  return ALIASES[lower] ?? lower
}

/** Get IATA code for a city name. Returns null if not found. */
export function getIATACode(cityName: string): string | null {
  if (!cityName) return null
  const normalized = normalize(cityName)
  return IATA_MAP[normalized] ?? null
}

/** Check if a city has a known IATA code. */
export function hasIATACode(cityName: string): boolean {
  return getIATACode(cityName) !== null
}

/** Get list of popular origin cities for autocomplete */
export function getPopularOriginCities(): Array<{ name: string; iata: string }> {
  return [
    { name: 'Москва', iata: 'SVO' },
    { name: 'Санкт-Петербург', iata: 'LED' },
    { name: 'Краснодар', iata: 'KRR' },
    { name: 'Екатеринбург', iata: 'SVX' },
    { name: 'Новосибирск', iata: 'OVB' },
    { name: 'Казань', iata: 'KZN' },
    { name: 'Красноярск', iata: 'KJA' },
    { name: 'Ростов-на-Дону', iata: 'ROV' },
    { name: 'Нижний Новгород', iata: 'GOJ' },
    { name: 'Самара', iata: 'KUF' },
    { name: 'Уфа', iata: 'UFA' },
    { name: 'Пермь', iata: 'PEE' },
    { name: 'Воронеж', iata: 'VOZ' },
    { name: 'Владивосток', iata: 'VVO' },
    { name: 'Сочи', iata: 'AER' },
    { name: 'Калининград', iata: 'KGD' },
    { name: 'Минеральные Воды', iata: 'MRV' },
    { name: 'Иркутск', iata: 'IKT' },
    { name: 'Хабаровск', iata: 'KHV' },
    { name: 'Тюмень', iata: 'TJM' },
  ]
}
