import { ChatMessage, Place } from '@/types'
import { getPlacesByCity, getCityName } from './places'

// Initial welcome message
export const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Привет! 👋 Я ваш персональный AI-помощник по путешествиям от **Crista Online**.

Я помогу спланировать идеальную поездку:
• Подберу лучшие места для посещения
• Вы оцените их звёздами и составите свою паутинку маршрута
• Подскажу где вкусно поесть и что посмотреть

🗺️ **Сейчас доступны: Сочи и Санкт-Петербург**
Скоро добавим больше направлений!

**Напишите куда хотите поехать**, например:
"Сочи на 5 дней" или "Выходные в Петербурге"`,
  createdAt: new Date().toISOString(),
}

// Generate AI response based on user message
export function generateAIResponse(userMessage: string): { message: ChatMessage; places: Place[] } {
  const lowerMessage = userMessage.toLowerCase()
  
  // Check if user is planning a trip
  const cityMatch = lowerMessage.match(/(краснодар|москв[ау]|петербург|питер|сочи|казань)/i)
  const daysMatch = lowerMessage.match(/(\d+)\s*(дн|день|дня)/i)
  
  if (cityMatch) {
    const city = cityMatch[1]
    const days = daysMatch ? parseInt(daysMatch[1]) : 3
    const places = getPlacesByCity(city)
    const cityName = getCityName(city)
    
    const response: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `Отличный выбор! 🎉 **${cityName}** — прекрасное место для путешествия!

Я подобрал для вас **${places.length} интересных мест** на ${days} ${getDaysWord(days)}. Вот самые популярные:`,
      createdAt: new Date().toISOString(),
      places,
      cityName,
    }
    
    return { message: response, places }
  }
  
  // Response for restaurant query
  if (lowerMessage.includes('ресторан') || lowerMessage.includes('поесть') || lowerMessage.includes('еда') || lowerMessage.includes('кафе')) {
    const restaurants = getPlacesByCity('краснодар').filter(p => p.type === 'restaurant')
    
    const response: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `Отличный вопрос! 🍽️ Вот мои рекомендации по ресторанам:`,
      createdAt: new Date().toISOString(),
      places: restaurants,
    }
    
    return { message: response, places: restaurants }
  }

  // Response for nature/parks
  if (lowerMessage.includes('парк') || lowerMessage.includes('природ') || lowerMessage.includes('гулять')) {
    const parks = getPlacesByCity('краснодар').filter(p => p.type === 'nature')
    
    const response: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `Люблю природу! 🌳 Вот лучшие парки и места для прогулок:`,
      createdAt: new Date().toISOString(),
      places: parks,
    }
    
    return { message: response, places: parks }
  }
  
  // Default response
  const defaultResponse: ChatMessage = {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: `Отлично! Расскажите подробнее о вашей поездке:

• **Куда** хотите поехать? (город)
• **На сколько** дней планируете поездку?
• **Что интересует**: культура, природа, еда, развлечения?

Например: "Хочу в Сочи на 5 дней, интересует природа и море"`,
    createdAt: new Date().toISOString(),
  }
  
  return { message: defaultResponse, places: [] }
}

// Helper function for Russian days word
function getDaysWord(days: number): string {
  if (days === 1) return 'день'
  if (days >= 2 && days <= 4) return 'дня'
  return 'дней'
}

// Create user message
export function createUserMessage(content: string): ChatMessage {
  return {
    id: `user-${Date.now()}`,
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
  }
}
