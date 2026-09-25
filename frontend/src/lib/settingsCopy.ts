export type InterfaceLanguage = 'ru' | 'en'

const navigationCopy = {
  ru: {
    explore: 'Изучение мира', wiki: 'Crista Wiki', routes: 'AI-маршруты', passport: 'Паспорт',
    switchToEnglish: 'Переключить на английский', switchToRussian: 'Переключить на русский',
    lightTheme: 'Светлая тема', darkTheme: 'Тёмная тема', premium: 'Премиум', freePlan: 'Бесплатный план',
    accountSettings: 'Настройки аккаунта', support: 'Поддержка', logout: 'Выйти', closeMenu: 'Закрыть меню',
    newChat: 'Новый чат', signIn: 'Войти в аккаунт', profile: (name: string) => `Профиль: ${name}`,
  },
  en: {
    explore: 'Explore the world', wiki: 'Crista Wiki', routes: 'AI itineraries', passport: 'Passport',
    switchToEnglish: 'Switch to English', switchToRussian: 'Switch to Russian',
    lightTheme: 'Light theme', darkTheme: 'Dark theme', premium: 'Premium', freePlan: 'Free plan',
    accountSettings: 'Account settings', support: 'Support', logout: 'Sign out', closeMenu: 'Close menu',
    newChat: 'New chat', signIn: 'Sign in', profile: (name: string) => `Profile: ${name}`,
  },
} satisfies Record<InterfaceLanguage, Record<string, unknown>>

const profileCopy = {
  ru: {
    back: 'Назад', title: 'Профиль', share: 'Поделиться профилем', settings: 'Настройки',
    premium: 'Премиум', free: 'Бесплатный план', countriesClosed: 'стран закрыто', citiesClosed: 'городов закрыто',
    premiumCta: 'Оформить премиум',
    distance: 'пройдено', days: 'дней в пути', savedTrips: 'сохранённых поездок', routes: 'маршрутов',
    stamps: 'штампов', goals: 'целей', chats: 'чатов', passport: 'Тревел-паспорт',
    achievements: 'Достижения', trips: 'Мои путешествия', loading: 'Загрузка…', passportLoading: 'Загружаем паспорт…',
    passportUnavailable: 'Игровой паспорт временно недоступен.', achievementsUnavailable: 'Достижения временно недоступны вместе с игровым паспортом.',
    noCities: 'Пока нет опубликованных городов.', tripsUnavailable: 'Поездки временно недоступны.',
    noTrips: 'Здесь появятся сохранённые поездки.', openSuitcase: 'Открыть чемодан', retry: 'Повторить',
    settingsLink: 'Настройки аккаунта', support: 'Поддержка', blankSpot: 'белое пятно', quests: 'квестов',
    locked: 'Ещё не открыто', explorer: 'Исследователь', explorerDescription: 'Пять маршрутов сохранено',
    traveller: 'Путешественник', countryComplete: 'Одна страна закрыта полностью', cityComplete: 'Один город закрыт полностью',
    collector: 'Коллекционер', collectorDescription: 'Пять штампов в паспорте', consistency: 'Постоянство',
    consistencyDescription: 'Десять квестов закрыто', profileShareTitle: (name: string) => `Профиль ${name}`,
    profileShareText: (name: string) => `Профиль ${name} в Crista`,
    stampCount: (count: number) => `${count} ${count === 1 ? 'штамп' : count >= 2 && count <= 4 ? 'штампа' : 'штампов'}`,
    tripCount: (count: number) => `${count} ${count === 1 ? 'поездка' : count >= 2 && count <= 4 ? 'поездки' : 'поездок'}`,
    distanceValue: (km: number) => `${km} км`,
  },
  en: {
    back: 'Back', title: 'Profile', share: 'Share profile', settings: 'Settings',
    premium: 'Premium', free: 'Free plan', countriesClosed: 'countries completed', citiesClosed: 'cities completed',
    premiumCta: 'Get Premium',
    distance: 'distance traveled', days: 'days traveling', savedTrips: 'saved trips', routes: 'routes',
    stamps: 'stamps', goals: 'goals', chats: 'chats', passport: 'Travel passport',
    achievements: 'Achievements', trips: 'My trips', loading: 'Loading…', passportLoading: 'Loading passport…',
    passportUnavailable: 'Game passport is temporarily unavailable.', achievementsUnavailable: 'Achievements are temporarily unavailable with the game passport.',
    noCities: 'No published cities yet.', tripsUnavailable: 'Trips are temporarily unavailable.',
    noTrips: 'Your saved trips will appear here.', openSuitcase: 'Open trips', retry: 'Retry',
    settingsLink: 'Account settings', support: 'Support', blankSpot: 'undiscovered', quests: 'quests',
    locked: 'Not unlocked yet', explorer: 'Explorer', explorerDescription: 'Save five itineraries',
    traveller: 'Traveler', countryComplete: 'Complete one country', cityComplete: 'Complete one city',
    collector: 'Collector', collectorDescription: 'Earn five passport stamps', consistency: 'Consistency',
    consistencyDescription: 'Complete ten quests', profileShareTitle: (name: string) => `${name}'s profile`,
    profileShareText: (name: string) => `${name}'s profile on Crista`,
    stampCount: (count: number) => `${count} ${count === 1 ? 'stamp' : 'stamps'}`,
    tripCount: (count: number) => `${count} ${count === 1 ? 'trip' : 'trips'}`,
    distanceValue: (km: number) => `${km} km`,
  },
}

export function getNavigationCopy(language: InterfaceLanguage) {
  return navigationCopy[language]
}

export function getProfileCopy(language: InterfaceLanguage) {
  return profileCopy[language]
}

const authCopy = {
  ru: {
    loginTitle: 'Войдите, чтобы продолжить', registerTitle: 'Создайте аккаунт',
    loginDescription: 'Войдите, чтобы сохранить маршрут и получить персональные рекомендации',
    registerDescription: 'Регистрация бесплатна и займёт несколько секунд', loginTab: 'Вход',
    registerTab: 'Регистрация', email: 'Эл. почта', password: 'Пароль', name: 'Ваше имя',
    passwordHint: 'Пароль (мин. 6 символов)', loggingIn: 'Входим…', login: 'Войти',
    creating: 'Создаём…', createAccount: 'Создать аккаунт', termsLead: 'Нажимая кнопку, вы соглашаетесь с',
    terms: 'условиями использования', requiredCredentials: 'Введите email и пароль', requiredName: 'Введите имя',
    requiredEmail: 'Введите email', shortPassword: 'Пароль минимум 6 символов', loginError: 'Ошибка входа',
    registerError: 'Ошибка регистрации',
  },
  en: {
    loginTitle: 'Sign in to continue', registerTitle: 'Create an account',
    loginDescription: 'Sign in to save your itinerary and get personalized recommendations',
    registerDescription: 'Registration is free and takes just a few seconds', loginTab: 'Sign in',
    registerTab: 'Sign up', email: 'Email', password: 'Password', name: 'Your name',
    passwordHint: 'Password (at least 6 characters)', loggingIn: 'Signing in…', login: 'Sign in',
    creating: 'Creating…', createAccount: 'Create account', termsLead: 'By continuing, you agree to the',
    terms: 'Terms of Use', requiredCredentials: 'Enter your email and password', requiredName: 'Enter your name',
    requiredEmail: 'Enter your email', shortPassword: 'Password must be at least 6 characters', loginError: 'Sign-in failed',
    registerError: 'Registration failed',
  },
} satisfies Record<InterfaceLanguage, Record<string, string>>

export function getAuthCopy(language: InterfaceLanguage) {
  return authCopy[language]
}

const settingsCopy = {
  ru: {
    back: 'Назад',
    title: 'Настройки',
    personal: 'Личные данные',
    name: 'Имя',
    email: 'Email',
    password: 'Пароль',
    appearance: 'Оформление',
    dark: 'Тёмная',
    light: 'Светлая',
    darkHint: 'Основное оформление',
    lightHint: 'Для яркого света',
    selected: 'Выбрано',
    language: 'Язык интерфейса',
    languageNote: 'Эта страница переведена; остальные разделы переводятся постепенно.',
    russian: 'Русский',
    english: 'Английский',
    privacy: 'Приватность',
    publicProfile: 'Публичный профиль',
    publicProfileDescription: 'Друзья видят ваши поездки и штампы',
    activity: 'Показывать активность',
    activityDescription: 'Прогресс по странам виден в лидерборде',
    notifications: 'Уведомления',
    emailNotifications: 'На почту',
    emailNotificationsDescription: 'Итоги поездок и падение цен по копилке',
    pushNotifications: 'Push-уведомления',
    pushNotificationsDescription: 'Вопрос дня и напоминание про стрик',
    connectedServices: 'Подключённые сервисы',
    signInAndSync: 'Вход и синхронизация',
    connect: 'Подключить',
    account: 'Аккаунт',
    logout: 'Выйти из аккаунта',
    deleteAccount: 'Удалить аккаунт',
    deleteAccountDescription: 'Прогресс и штампы будут потеряны',
    deleteAccountTitle: 'Удалить аккаунт?',
    deleteAccountWarning: 'Это действие нельзя отменить. Маршруты, прогресс и штампы будут удалены навсегда.',
    cancel: 'Отмена',
    delete: 'Удалить',
    pageLabel: 'Настройки Crista',
  },
  en: {
    back: 'Back',
    title: 'Settings',
    personal: 'Personal information',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    appearance: 'Appearance',
    dark: 'Dark',
    light: 'Light',
    darkHint: 'Default appearance',
    lightHint: 'For bright environments',
    selected: 'Selected',
    language: 'Interface language',
    languageNote: 'This page is translated; other sections are being localized.',
    russian: 'Russian',
    english: 'English',
    privacy: 'Privacy',
    publicProfile: 'Public profile',
    publicProfileDescription: 'Friends can see your trips and stamps',
    activity: 'Show activity',
    activityDescription: 'Your country progress appears on the leaderboard',
    notifications: 'Notifications',
    emailNotifications: 'Email',
    emailNotificationsDescription: 'Trip summaries and savings-pot price drops',
    pushNotifications: 'Push notifications',
    pushNotificationsDescription: 'Question of the day and streak reminders',
    connectedServices: 'Connected services',
    signInAndSync: 'Sign-in and sync',
    connect: 'Connect',
    account: 'Account',
    logout: 'Sign out',
    deleteAccount: 'Delete account',
    deleteAccountDescription: 'Your progress and stamps will be lost',
    deleteAccountTitle: 'Delete your account?',
    deleteAccountWarning: 'This action cannot be undone. Your routes, progress, and stamps will be permanently deleted.',
    cancel: 'Cancel',
    delete: 'Delete',
    pageLabel: 'Crista settings',
  },
} satisfies Record<InterfaceLanguage, Record<string, unknown>>

export function getSettingsCopy(language: InterfaceLanguage) {
  return settingsCopy[language]
}
