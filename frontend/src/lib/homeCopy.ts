import type { InterfaceLanguage } from './settingsCopy'
import type { RewardKind } from '../mocks/battlepass'

interface HomeCopy {
  composerLabel: string
  composerPlaceholder: string
  voiceInput: string
  buildRoute: string
  heroImage: string
  heroTitle: string
  heroDescription: string
  weather: string
  countriesCount: (count: number) => string
  countriesOpened: string
  questsCompleted: (done: number, total: number) => string
  countryFocus: string
  weeklyLesson: (title: string, lesson: number, total: number) => string
  lockedWeekly: string
  continueGame: string
  savings: (destination?: string) => string
  savingsAmount: (current: number, target: number) => string
  chooseDestination: string
  priceDrop: (percent: number) => string
  watchingPrices: string
  studying: (country: string) => string
  allQuestions: string
  quizUnavailable: (country: string) => string
  questionOfDay: string
  questionsFinished: (country: string) => string
  allQuestionsAnswered: (count: number) => string
  tryAgain: string
  correctAnswer: (points: number) => string
  incorrectAnswer: string
  nextQuestion: string
  finishQuiz: string
  passWithoutDeadline: string
  premiumActive: string
  unlockPremium: string
  level: string
  levelsOutOf: (total: number) => string
  quizProgress: (current: number, total: number) => string
  pointsToLevel: (points: number, threshold: number, level: number) => string
  passComplete: (points: number) => string
  passProgress: string
  pointsExplanation: string
  pointsShort: string
  nextLevel: string
  previousLevels: string
  followingLevels: string
  freeTrack: string
  premiumTrack: string
  rewardReceived: string
  subscriptionRequired: string
  notUnlocked: string
  rewardKinds: Record<RewardKind, string>
  destinationsHeading: string
  seeAll: string
  tripPrompt: (destination: string, country: string) => string
}

function russianCountryCount(count: number) {
  const remainder100 = count % 100
  const remainder10 = count % 10
  const unit = remainder100 >= 11 && remainder100 <= 14
    ? 'стран'
    : remainder10 === 1
      ? 'страна'
      : remainder10 >= 2 && remainder10 <= 4
        ? 'страны'
        : 'стран'
  return `${count} ${unit}`
}

function rubleAmount(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

const homeCopy: Record<InterfaceLanguage, HomeCopy> = {
  ru: {
    composerLabel: 'Опишите поездку, которую хотите спланировать',
    composerPlaceholder: 'Грузия, 5 дней, 80 тысяч',
    voiceInput: 'Голосовой ввод',
    buildRoute: 'Построить маршрут',
    heroImage: 'Панорама города на воде',
    heroTitle: 'Куда отправимся?',
    heroDescription: 'Опишите поездку словами. Crista соберёт маршрут, посчитает бюджет и откроет страну на вашей карте мира.',
    weather: 'Москва, облачно',
    countriesCount: russianCountryCount,
    countriesOpened: 'Открыто из 195',
    questsCompleted: (_done: number, total: number) => `Квестов закрыто из ${total}`,
    countryFocus: 'Фокус страны',
    weeklyLesson: (title: string, lesson: number, total: number) => `${title}, урок ${lesson} из ${total}`,
    lockedWeekly: 'Откройте страну, чтобы получить задания недели',
    continueGame: 'Продолжить в Игре',
    savings: (destination?: string) => `Копилка: ${destination ?? 'цель не выбрана'}`,
    savingsAmount: (current: number, target: number) => `${rubleAmount(current, 'ru-RU')} из ${rubleAmount(target, 'ru-RU')}`,
    chooseDestination: 'Выберите направление в разделе Игра',
    priceDrop: (percent: number) => `Билеты подешевели на ${percent}% за неделю.`,
    watchingPrices: 'Следим за ценой билетов и сообщим о падении.',
    studying: (country: string) => `Изучаем: ${country}`,
    allQuestions: 'Все вопросы',
    quizUnavailable: (country: string) => `Вопросы появятся, когда ${country} будет открыта`,
    questionOfDay: 'Вопрос дня',
    questionsFinished: (country: string) => `Вопросы по стране ${country} закончились`,
    allQuestionsAnswered: (count: number) => `Вы ответили на все ${count}. Новые появятся завтра.`,
    tryAgain: 'Пройти заново',
    correctAnswer: (points: number) => `Верно, плюс ${points} очков`,
    incorrectAnswer: 'Не угадали, но теперь знаете',
    nextQuestion: 'Следующий вопрос',
    finishQuiz: 'Завершить',
    rewardKinds: {
      stamp: 'Штамп', frame: 'Рамка паспорта', 'streak-freeze': 'Заморозка стрика',
      quest: 'Квесты', storage: 'Галерея', discount: 'Скидка', title: 'Звание',
    },
    passWithoutDeadline: 'Без сроков',
    premiumActive: 'Премиум активен',
    unlockPremium: 'Открыть премиум-дорожку',
    level: 'Уровень',
    levelsOutOf: (total: number) => `из ${total}`,
    quizProgress: (current: number, total: number) => `${current} из ${total}`,
    pointsToLevel: (points: number, threshold: number, level: number) => `${points} из ${threshold} очков до уровня ${level}`,
    passComplete: (points: number) => `${points} очков, пропуск пройден полностью`,
    passProgress: 'Прогресс пропуска',
    pointsExplanation: 'Очки дают точки квестов, верные ответы дня и полностью закрытые города.',
    pointsShort: 'очк.',
    nextLevel: 'Следующий уровень',
    previousLevels: 'Предыдущие уровни',
    followingLevels: 'Следующие уровни',
    freeTrack: 'Бесплатная дорожка',
    premiumTrack: 'Премиум-дорожка',
    rewardReceived: 'Получено',
    subscriptionRequired: 'Нужна подписка',
    notUnlocked: 'Не открыто',
    destinationsHeading: 'Куда едут сейчас',
    seeAll: 'Смотреть все',
    tripPrompt: (destination: string, country: string) => `Хочу поехать в ${destination}, ${country}`,
  },
  en: {
    composerLabel: 'Describe the trip you want to plan',
    composerPlaceholder: 'Georgia, 5 days, 80,000 RUB',
    voiceInput: 'Voice input',
    buildRoute: 'Build itinerary',
    heroImage: 'Panoramic view of a city on the water',
    heroTitle: 'Where shall we go?',
    heroDescription: 'Describe your trip. Crista will build an itinerary, estimate the budget, and unlock the country on your world map.',
    weather: 'Moscow, cloudy',
    countriesCount: (count: number) => `${count} ${count === 1 ? 'country' : 'countries'}`,
    countriesOpened: 'Unlocked out of 195',
    questsCompleted: (_done: number, total: number) => `Quests completed out of ${total}`,
    countryFocus: 'Country focus',
    weeklyLesson: (title: string, lesson: number, total: number) => `${title}, lesson ${lesson} of ${total}`,
    lockedWeekly: 'Unlock a country to get its weekly challenges',
    continueGame: 'Continue playing',
    savings: (destination?: string) => `Savings goal: ${destination ?? 'none selected'}`,
    savingsAmount: (current: number, target: number) => `${rubleAmount(current, 'en-US')} of ${rubleAmount(target, 'en-US')}`,
    chooseDestination: 'Choose a destination in the Game section',
    priceDrop: (percent: number) => `Ticket prices are down ${percent}% this week.`,
    watchingPrices: 'We are tracking ticket prices and will let you know if they drop.',
    studying: (country: string) => `Learning about: ${country}`,
    allQuestions: 'All questions',
    quizUnavailable: (country: string) => `Questions will appear when ${country} is unlocked`,
    questionOfDay: 'Question of the day',
    questionsFinished: (country: string) => `You have finished the questions for ${country}`,
    allQuestionsAnswered: (count: number) => `You answered all ${count}. New questions arrive tomorrow.`,
    tryAgain: 'Try again',
    correctAnswer: (points: number) => `Correct — ${points} points earned`,
    incorrectAnswer: 'Not quite, but now you know',
    nextQuestion: 'Next question',
    finishQuiz: 'Finish',
    rewardKinds: {
      stamp: 'Stamp', frame: 'Passport frame', 'streak-freeze': 'Streak freeze',
      quest: 'Quests', storage: 'Gallery', discount: 'Discount', title: 'Title',
    },
    passWithoutDeadline: 'No expiration',
    premiumActive: 'Premium active',
    unlockPremium: 'Unlock the Premium track',
    level: 'Level',
    levelsOutOf: (total: number) => `of ${total}`,
    quizProgress: (current: number, total: number) => `${current} of ${total}`,
    pointsToLevel: (points: number, threshold: number, level: number) => `${points} of ${threshold} points to level ${level}`,
    passComplete: (points: number) => `${points} points — pass complete`,
    passProgress: 'Pass progress',
    pointsExplanation: 'Earn points from quest stops, correct daily answers, and completing cities.',
    pointsShort: 'pts',
    nextLevel: 'Next level',
    previousLevels: 'Previous levels',
    followingLevels: 'Next levels',
    freeTrack: 'Free track',
    premiumTrack: 'Premium track',
    rewardReceived: 'Claimed',
    subscriptionRequired: 'Subscription required',
    notUnlocked: 'Locked',
    destinationsHeading: 'Popular destinations',
    seeAll: 'See all',
    tripPrompt: (destination: string, country: string) => `I want to travel to ${destination}, ${country}`,
  },
}

export function getHomeCopy(language: InterfaceLanguage) {
  return homeCopy[language]
}
