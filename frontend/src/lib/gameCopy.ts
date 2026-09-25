import type { InterfaceLanguage } from './settingsCopy'
import type { QuestCategory, QuestPoint } from '../mocks/game'

interface GameCopy {
  back: string
  backToWorldMap: string
  firstTrip: string
  pilotTag: string
  passportLoading: string
  passportUnavailable: string
  retryPassport: string
  passportSource: string
  stamps: (count: number) => string
  savedRoutes: (routes: string) => string
  noSavedRoutes: string
  suitcaseSource: string
  tripsAndGoals: (trips: number, goals: number) => string
  suitcaseLoading: string
  suitcaseUnavailable: (error: string) => string
  suitcaseLoadFailed: string
  retrySuitcase: string
  noTrips: string
  openSuitcase: string
  liveModeNote: string
  worldCoverage: string
  backToMap: string
  openCountriesCount: (count: number) => string
  questsCount: (done: number, total: number) => string
  worldMap: string
  worldMapHint: string
  openInProgress: string
  blankSpots: string
  countryFocus: string
  completedPercent: (percent: number) => string
  focusComplete: string
  percentToPremium: (percent: number) => string
  weeklyTrack: string
  lessonProgress: (lesson: number, total: number, percent: number) => string
  courseLocked: string
  categoryProgress: (country: string) => string
  savings: string
  amountOfTarget: (target: string) => string
  ticketDown: (percent: number) => string
  ticketUp: (percent: number) => string
  weeklySavings: (amount: string) => string
  passport: string
  closedCountries: (count: number) => string
  resetProgress: string
  pilotCitiesNote: string
  closed: string
  regions: string
  regionUnlockHint: string
  visited: string
  blankSpotLegend: string
  questionOfDay: string
  questPoints: string
  categoryProgressTitle: string
  regionUnlockNote: string
  unopenedCountry: (country: string) => string
  openCountryHint: string
  countryClosed: string
  cityCount: (count: number) => string
  countryClosedFully: string
  questCategories: string
  categoryNames: Record<QuestCategory, string>
  noRegions: (country: string) => string
  worldMapBlankSpot: string
  passportOwner: string
  document: string
  countriesLabel: string
  stampsLabel: string
  countrySeals: string
  visitMarks: string
  page: (number: number) => string
  share: string
  emptyPage: string
  firstStampHint: string
  passportDisclaimer: string
  pilotLabel: string
  cityPilotNames: Record<'st-petersburg' | 'sochi', string>
  pilotNodeNames: Record<string, string>
  pilotNodeStates: { completed: string; unlocked: string; locked: string }
  pilotComplete: string
  pilotContentLanguageNote: string
  source: string
  openSource: string
  truthOrMyth: string
  timeline: string
  correctXp: (xp: number) => string
  tryAgain: string
  saveAnswerFailed: string
  questUnavailable: string
  moscowCity: string
  moscowNodeNames: Record<string, string>
  moscowDistrictNames: Record<string, string>
  moscowRouteLabel: string
  moscowRouteSummary: (tier: number, done: number, required: number, todayDone: number, todayGoal: number, goalReached: boolean) => string
  streakDays: (count: number) => string
  routeNodes: string
  moscowPathUnavailable: (error: string) => string
  moscowPathLoadFailed: string
  routeFallbackLabel: string
  pointNumber: (position: number) => string
  nodeStatus: { completed: string; beginAbove: string; openQuest: string; locked: string }
  finalRound: string
  bossCompleted: string
  bossQuestionCount: (count: number) => string
  bossLocked: string
  guide: string
  contentLanguageNote: string
  moscowQuest: {
    locked: string
    unavailable: (error: string) => string
    retry: string
    point: (position: number) => string
    savedStamp: (stamp: string) => string
    source: string
    dailyGoal: (done: number, goal: number, reached: boolean) => string
    energyEmpty: string
    answerAwarded: (xp: number) => string
    answerAlreadyCompleted: string
    answerIncorrect: string
    saveFailed: string
  }
  moscowBoss: {
    unavailable: (error: string) => string
    retry: string
    completed: (stamp: string) => string
    question: (number: number) => string
    submit: string
    energyEmpty: string
    sources: string
    review: string
    answerCorrect: string
    answerIncorrect: string
    allCorrect: string
    incorrectSummary: (count: number) => string
    saveFailed: string
  }
  moscowSandbox: {
    contentLanguageNote: string
    unavailable: (error: string) => string
    retry: string
    eyebrow: string
    title: string
    description: string
    lessonCheck: string
    sourceFallback: string
    cityContext: (version: string) => string
    storyAria: string
    wikiAria: string
    wikiEyebrow: (version: string) => string
    license: (name: string) => string
    mechanic: string
    answerSaveFailed: string
    photoAria: string
    photoDisclaimer: string
    hotspot: (number: number) => string
    recoveryAria: string
    recoveryEyebrow: string
    recoveryTitle: string
    recoveryDescription: string
    recoveryDone: string
    recoveryButton: string
    recoveryAwarded: (amount: number) => string
    recoveryFailed: string
    priceAria: string
    yourEstimate: string
    yourBid: string
    checkPrice: string
    priceClose: string
    priceTryAgain: string
    wordAria: string
    reorderWords: string
    wordsOrder: string
    moveWordUp: (word: string) => string
    moveWordDown: (word: string) => string
    checkPhrase: string
    phraseCorrect: string
    orderIncorrect: string
    timelineAria: string
    reorder: string
    eventsOrder: string
    moveItemUp: (item: string) => string
    moveItemDown: (item: string) => string
    checkTimeline: string
    timelineCorrect: string
    itemCorrect: string
    itemIncorrect: string
    matchingAria: string
    matchingInput: string
    yearFor: (place: string) => string
    chooseYear: string
    checkPairs: string
    pairsCorrect: string
    pairsIncorrect: string
    correct: string
    checkAgain: string
    truthMythAria: string
    swipeButtons: string
    statement: (current: number, total: number) => string
    myth: string
    truth: string
    nextStatement: string
    accurate: string
    almost: string
  }
  onboarding: {
    steps: [string, string, string, string]
    signInHeading: string
    signInBody: string
    loading: string
    unavailable: (error: string) => string
    retry: string
    correctAward: (xp: number) => string
    alreadyStamped: string
    incorrect: string
    answerFailed: string
    goal: (done: number, goal: number, reached: boolean) => string
    stepsAria: string
    completed: (stamp: string) => string
    contentLanguageNote: string
    intro: (name: string) => string
    selectRussia: string
    arrivalHeading: string
    arrivalBody: (scene: string) => string
    arrivalAction: string
    factAction: string
    energyEmpty: string
    sourceFallback: string
  }
}

const copy: Record<InterfaceLanguage, GameCopy> = {
  ru: {
    back: 'Назад', backToWorldMap: 'К карте мира', firstTrip: 'Первое путешествие', pilotTag: 'Россия · пилот',
    passportLoading: 'Загружаем игровой паспорт…', passportUnavailable: 'Игровой паспорт временно недоступен.',
    retryPassport: 'Повторить загрузку паспорта', passportSource: 'Тревел-паспорт · серверные данные',
    stamps: (count) => `${count} штампов`, savedRoutes: (routes) => `Сохранённые маршруты: ${routes}`,
    noSavedRoutes: 'Сохранённых маршрутов пока нет.', suitcaseSource: 'Мой чемодан · данные Suitcase',
    tripsAndGoals: (trips, goals) => `${trips} активных поездок · ${goals} целей`,
    suitcaseLoading: 'Загружаем поездки и цели…', suitcaseUnavailable: (error) => `Данные чемодана временно недоступны: ${error}`,
    suitcaseLoadFailed: 'Не удалось загрузить данные «Моего чемодана».',
    retrySuitcase: 'Повторить загрузку чемодана', noTrips: 'Поездок пока нет.', openSuitcase: 'Открыть чемодан',
    liveModeNote: 'У маршрута десять проверяемых сервером точек. После них открывается финальный круг из трёх вопросов и городской штамп. Карта мира, ежедневные квизы и ручное закрытие точек пока доступны только в демонстрационном режиме.',
    worldCoverage: 'Охват мира', backToMap: 'Назад', openCountriesCount: (count) => `${count} из 195 стран`,
    questsCount: (done, total) => `${done} из ${total} квестов`, worldMap: 'Карта мира',
    worldMapHint: 'Нажмите на открытую страну, чтобы попасть в её регионы и квесты',
    openInProgress: 'Открыто, идёт прогресс', blankSpots: 'Белые пятна', countryFocus: 'Фокус страны',
    completedPercent: (percent) => `${percent}% закрыто`, focusComplete: 'Фокус закрыт',
    percentToPremium: (percent) => `До премиум-слоя ${percent}%`, weeklyTrack: 'Еженедельный трек',
    lessonProgress: (lesson, total, percent) => `Урок ${lesson} из ${total}, пройдено ${percent}%`,
    courseLocked: 'Курс по стране появится после её открытия', categoryProgress: (country) => `Категории по стране ${country}`,
    savings: 'Копилка', amountOfTarget: (target) => `из ${target}`,
    ticketDown: (percent) => `Билет подешевел на ${percent}%`, ticketUp: (percent) => `Билет подорожал на ${percent}%`,
    weeklySavings: (amount) => `Рекомендуем откладывать ${amount} ₽ в неделю`, passport: 'Тревел-паспорт',
    closedCountries: (count) => `Закрыто стран: ${count}`, resetProgress: 'Сбросить прогресс',
    pilotCitiesNote: 'Пилотные города фазы 0: Москва, Санкт-Петербург и Сочи. Прогресс сохраняется в браузере.',
    closed: 'Закрыта', regions: 'Регионы', regionUnlockHint: 'Регион раскрывается, когда вы закрываете в нём первую точку',
    visited: 'Вы здесь были', blankSpotLegend: 'Белое пятно', questionOfDay: 'Вопрос дня', questPoints: 'Точки квестов',
    categoryProgressTitle: 'Прогресс по категориям', regionUnlockNote: 'Города, где вы закрыли хотя бы одну точку, раскрывают свой регион на карте страны.',
    unopenedCountry: (country) => `${country} ещё белое пятно на вашей карте`,
    openCountryHint: 'Постройте маршрут в эту страну в разделе Маршрут, и здесь появятся регионы, города и точки квестов.',
    countryClosed: 'Страна закрыта полностью', countryClosedFully: 'Страна закрыта полностью', cityCount: russianCityCount,
    questCategories: 'Категории', noRegions: (country) => `Регионы для страны ${country} пока не размечены`,
    categoryNames: { sights: 'Достопримечательности', food: 'Кухня', traditions: 'Традиции' },
    worldMapBlankSpot: 'Белое пятно: маршрут сюда ещё не строили',
    passportOwner: 'Владелец', document: 'Документ', countriesLabel: 'Стран', stampsLabel: 'Штампов',
    countrySeals: 'Печати за закрытые страны', visitMarks: 'Отметки о посещении', page: (number) => `Страница ${number}`,
    share: 'Поделиться', emptyPage: 'Страница пока чистая', firstStampHint: 'Закройте все квесты города, чтобы получить первый штамп.',
    passportDisclaimer: 'Штамп за город выдаётся при закрытии всех его квестов, за страну — при закрытии всех городов. Это документ Crista, не связанный с государственными паспортами.',
    pilotLabel: 'Контентный пилот · серверный путь', cityPilotNames: { 'st-petersburg': 'Санкт-Петербург', sochi: 'Сочи' },
    pilotNodeNames: {
      'spb-hermitage': 'Эрмитаж', 'spb-peterhof': 'Петергоф', 'spb-collection': 'Коллекция Эрмитажа',
      'spb-fountains': 'Фонтаны Петергофа', 'spb-peterhof-history': 'Первое упоминание Петергофа',
      'sochi-national-park': 'Сочинский национальный парк', 'sochi-dendrarium': 'Дендрарий', 'sochi-forest': 'Горные леса',
      'sochi-mzymta': 'Река Мзымта', 'sochi-park-area': 'Площадь национального парка',
    }, pilotNodeStates: { completed: 'Пройдено', unlocked: 'Открыто', locked: 'Закрыто' },
    pilotComplete: 'Маршрут завершён. Все факты сохранены с первоисточниками.',
    pilotContentLanguageNote: 'Тексты фактов и вопросов пока доступны только на русском — это проверенное серверное издание.',
    source: 'Источник', openSource: 'открыть', truthOrMyth: 'Правда или миф', timeline: 'Временная шкала',
    correctXp: (xp) => `Верно! +${xp} XP`, tryAgain: 'Почти! Попробуйте ещё раз.', saveAnswerFailed: 'Не удалось сохранить ответ. Попробуйте ещё раз.',
    questUnavailable: 'Квест пока недоступен.',
    moscowCity: 'Москва',
    moscowNodeNames: {
      'moscow-red-square': 'Красная площадь', 'moscow-spasskaya-tower': 'Спасская башня',
      'moscow-tsar-bell': 'Царь-колокол', 'moscow-annunciation-cathedral': 'Благовещенский собор',
      'moscow-gum': 'ГУМ', 'moscow-zaryadye': 'Парк «Зарядье»', 'moscow-tretyakov-gallery': 'Третьяковская галерея',
      'moscow-bolshoi-theatre': 'Большой театр', 'moscow-metro': 'Московское метро', 'moscow-vdnh': 'ВДНХ',
    },
    moscowDistrictNames: {
      'moscow-kremlin': 'Московский Кремль', 'moscow-kitaigorod': 'Китай-город',
      'moscow-zamoskvorechye': 'Замоскворечье', 'moscow-teatralny': 'Театральный район', 'moscow-vdnh': 'ВДНХ',
    },
    moscowRouteLabel: 'Маршрут города',
    moscowRouteSummary: (tier, done, required, todayDone, todayGoal, reached) => `Маршрут, уровень ${tier}: ${done}/${required} точек. Сегодня: ${todayDone}/${todayGoal}${reached ? ' · цель выполнена' : ''}.`,
    streakDays: (count) => `${count} дн.`, routeNodes: 'Точки маршрута по Москве',
    moscowPathUnavailable: (error) => `Маршрут Москвы пока недоступен: ${error}.`, moscowPathLoadFailed: 'не удалось загрузить маршрут', routeFallbackLabel: 'Маршрут Москвы',
    pointNumber: (position) => `Точка ${position}`,
    nodeStatus: { completed: 'Пройдено', beginAbove: 'Начните выше', openQuest: 'Открыто — пройти квест', locked: 'Откроется после предыдущей точки' },
    finalRound: 'Москва · финальный круг', bossCompleted: 'Городской штамп получен · sandbox открыт',
    bossQuestionCount: (count) => `${count} ${count === 1 ? 'вопрос' : count >= 2 && count <= 4 ? 'вопроса' : 'вопросов'} · получить городской штамп`,
    bossLocked: 'Откроется после всех точек маршрута',
    guide: 'проводник', contentLanguageNote: 'Текст урока и вопросы пока доступны только на русском языке — это проверенное серверное издание.',
    moscowQuest: {
      locked: 'Эта точка Москвы откроется после предыдущего задания. Правило проверяет сервер, а не браузер.',
      unavailable: (error) => `Следующий квест пока недоступен: ${error}.`, retry: 'попробуйте обновить страницу',
      point: (position) => `Москва · точка ${position}`, savedStamp: (stamp) => `${stamp} уже в паспорте. Откройте маршрут Москвы, чтобы продолжить путь.`,
      source: 'Источник', dailyGoal: (done, goal, reached) => `Цель на сегодня: ${done}/${goal} точек${reached ? ' — выполнена' : ''}.`,
      energyEmpty: 'Энергия закончилась — она восстановится завтра.', answerAwarded: (xp) => `Верно! +${xp} XP`,
      answerAlreadyCompleted: 'Верно — этот штамп уже в паспорте.', answerIncorrect: 'Почти! Одна энергия потрачена — попробуйте ещё раз.',
      saveFailed: 'Ответ не сохранился. Попробуйте ещё раз.',
    },
    moscowBoss: {
      unavailable: (error) => `Финальный круг Москвы пока недоступен: ${error}.`, retry: 'попробуйте обновить страницу',
      completed: (stamp) => `${stamp} уже в паспорте. Песочница Москвы открыта.`, question: (number) => `Вопрос ${number}`,
      submit: 'Проверить три ответа', energyEmpty: 'Энергия закончилась — она восстановится завтра.', sources: 'Источники', review: 'Разбор ответов',
      answerCorrect: 'Верно.', answerIncorrect: 'Неверно.', allCorrect: 'Городской штамп получен. Москва открыта для свободного исследования.',
      incorrectSummary: (count) => `Есть неточности: ${count}. Энергия списана только за неверные ответы.`,
      saveFailed: 'Ответы не сохранились. Попробуйте ещё раз.',
    },
    moscowSandbox: {
      contentLanguageNote: 'Интерактивные упражнения и статья Wiki пока на русском. История и повторение фактов доступны на английском, если сервер вернул опубликованный перевод.',
      unavailable: (error) => `Песочница Москвы пока недоступна: ${error}.`, retry: 'попробуйте обновить страницу',
      eyebrow: 'Свободное исследование', title: 'Песочница Москвы',
      description: 'Городской круг завершён. Возвращайся к фактам, проверяй себя вопросами и открывай первоисточники без новых наград и списания энергии.',
      lessonCheck: 'Проверь себя', sourceFallback: 'Открыть источник', cityContext: (version) => `Общий контекст города · Wiki ${version}`,
      storyAria: 'Story о Красной площади', wikiAria: 'Статья Crista Wiki о Москве', wikiEyebrow: (version) => `Crista Wiki · версия фактов ${version}`,
      license: (name) => `Лицензия: ${name}`, mechanic: 'Игровая механика', answerSaveFailed: 'Ответ не сохранился. Попробуйте ещё раз.',
      photoAria: 'Упражнение фото-сканер', photoDisclaimer: 'Это не распознавание и не загрузка ваших фотографий: выберите область на подготовленном учебном снимке.',
      hotspot: (number) => `Отметить область ${number} на фотографии`,
      recoveryAria: 'Восстановление энергии', recoveryEyebrow: 'Повторение', recoveryTitle: 'Верни одну энергию',
      recoveryDescription: 'Сначала правильно реши любое упражнение выше. Восстановление доступно раз в день и не поднимает энергию выше пяти.',
      recoveryDone: 'Уже восстановлено', recoveryButton: 'Восстановить +1',
      recoveryAwarded: (amount) => `+${amount} энергия за повторение. Возвращайся завтра за следующим восстановлением.`,
      recoveryFailed: 'Не удалось восстановить энергию.',
      priceAria: 'Упражнение угадать цену', yourEstimate: 'Ваша оценка:', yourBid: 'Ваша ставка', checkPrice: 'Проверить цену',
      priceClose: 'Близко к ответу.', priceTryAgain: 'Почти.', wordAria: 'Упражнение собрать фразу', reorderWords: 'перестановка слов', wordsOrder: 'Порядок слов',
      moveWordUp: (word) => `Поднять слово ${word}`, moveWordDown: (word) => `Опустить слово ${word}`, checkPhrase: 'Проверить фразу',
      phraseCorrect: 'Фраза собрана.', orderIncorrect: 'Порядок пока неточный.', timelineAria: 'Упражнение на хронологию', reorder: 'перестановка',
      eventsOrder: 'Порядок событий', moveItemUp: (item) => `Поднять ${item}`, moveItemDown: (item) => `Опустить ${item}`,
      checkTimeline: 'Проверить хронологию', timelineCorrect: 'Хронология собрана.', itemCorrect: 'На месте', itemIncorrect: 'Не на месте',
      matchingAria: 'Упражнение на сопоставление', matchingInput: 'касание или клавиатура', yearFor: (place) => `Год для ${place}`,
      chooseYear: 'Выбрать год', checkPairs: 'Проверить пары', pairsCorrect: 'Все пары собраны.', pairsIncorrect: 'Есть неточные пары.',
      correct: 'Верно.', checkAgain: 'Проверь ещё раз', truthMythAria: 'Упражнение правда или миф', swipeButtons: 'свайп или кнопки',
      statement: (current, total) => `Утверждение ${current}/${total}`, myth: '← Миф', truth: 'Правда →', nextStatement: 'Следующее утверждение',
      accurate: 'Точно!', almost: 'Почти.',
    },
    onboarding: {
      steps: ['Встреча', 'Москва', 'История', 'Квест'],
      signInHeading: 'Первое путешествие ждёт', signInBody: 'Войдите в аккаунт, чтобы пройти Москву с Крисом и сохранить XP со штампом.',
      loading: 'Загружаем маршрут Криса…', unavailable: (error) => `Игровой маршрут пока недоступен: ${error}.`, retry: 'попробуйте обновить страницу',
      correctAward: (xp) => `Верно! +${xp} XP`, alreadyStamped: 'Верно — этот штамп уже в паспорте.', incorrect: 'Почти! Одна энергия потрачена — попробуйте ещё раз.',
      answerFailed: 'Ответ не сохранился. Попробуйте ещё раз.', goal: (done, goal, reached) => `Цель на сегодня: ${done}/${goal} точек${reached ? ' — выполнена' : ''}.`,
      stepsAria: 'Шаги первого путешествия', completed: (stamp) => `${stamp} уже в паспорте. Москва открыта для следующих квестов.`,
      contentLanguageNote: 'Текст истории и вопросы сейчас доступны только на русском языке — показан оригинал.',
      intro: (name) => `${name} покажет, как за две минуты открыть новую часть мира. Начнём с России.`,
      selectRussia: 'Выбрать Россию', arrivalHeading: 'Москва на горизонте',
      arrivalBody: (scene) => `Первая остановка — ${scene}. Здесь начинается путь, который сохранится в твоём паспорте.`,
      arrivalAction: 'Узнать историю места', factAction: 'Пройти мини-квест', energyEmpty: 'Энергия закончилась — она восстановится завтра.', sourceFallback: 'Правительство Москвы',
    },
  },
  en: {
    back: 'Back', backToWorldMap: 'Back to world map', firstTrip: 'Your first trip', pilotTag: 'Russia · pilot',
    passportLoading: 'Loading game passport…', passportUnavailable: 'Game passport is temporarily unavailable.',
    retryPassport: 'Retry loading passport', passportSource: 'Travel passport · server data',
    stamps: (count) => `${count} stamps`, savedRoutes: (routes) => `Saved itineraries: ${routes}`,
    noSavedRoutes: 'No saved itineraries yet.', suitcaseSource: 'My suitcase · Suitcase data',
    tripsAndGoals: (trips, goals) => `${trips} active trips · ${goals} goals`,
    suitcaseLoading: 'Loading trips and goals…', suitcaseUnavailable: (error) => `Suitcase data is temporarily unavailable: ${error}`,
    suitcaseLoadFailed: 'Could not load suitcase data.',
    retrySuitcase: 'Retry loading suitcase', noTrips: 'No trips yet.', openSuitcase: 'Open suitcase',
    liveModeNote: 'This itinerary has ten stops verified by the server. Completing them unlocks a final round of three questions and a city stamp. The world map, daily quizzes, and manual stop completion are currently available in demo mode only.',
    worldCoverage: 'World coverage', backToMap: 'Back', openCountriesCount: (count) => `${count} of 195 countries`,
    questsCount: (done, total) => `${done} of ${total} quests`, worldMap: 'World map',
    worldMapHint: 'Select an unlocked country to explore its regions and quests',
    openInProgress: 'Unlocked · in progress', blankSpots: 'Undiscovered', countryFocus: 'Country focus',
    completedPercent: (percent) => `${percent}% complete`, focusComplete: 'Focus complete',
    percentToPremium: (percent) => `${percent}% to the premium tier`, weeklyTrack: 'Weekly track',
    lessonProgress: (lesson, total, percent) => `Lesson ${lesson} of ${total}, ${percent}% complete`,
    courseLocked: 'The country course will appear once it is unlocked', categoryProgress: (country) => `Progress by category for ${country}`,
    savings: 'Savings goal', amountOfTarget: (target) => `of ${target}`, 
    ticketDown: (percent) => `Ticket price down ${percent}%`, ticketUp: (percent) => `Ticket price up ${percent}%`,
    weeklySavings: (amount) => `Suggested weekly savings: RUB ${amount}`, passport: 'Travel passport',
    closedCountries: (count) => `Countries completed: ${count}`, resetProgress: 'Reset progress',
    pilotCitiesNote: 'Phase 0 pilot cities: Moscow, Saint Petersburg, and Sochi. Progress is stored in this browser.',
    closed: 'Completed', regions: 'Regions', regionUnlockHint: 'A region is revealed when you complete your first stop there',
    visited: 'Visited', blankSpotLegend: 'Undiscovered', questionOfDay: 'Question of the day', questPoints: 'Quest stops',
    categoryProgressTitle: 'Progress by category', regionUnlockNote: 'Completing at least one stop in a city reveals its region on the country map.',
    unopenedCountry: (country) => `${country} is still undiscovered on your map`,
    openCountryHint: 'Plan a trip to this country in the Itinerary section to reveal its regions, cities, and quest stops.',
    countryClosed: 'Country fully completed', countryClosedFully: 'Country fully completed', cityCount: (count) => `${count} cities`,
    questCategories: 'Categories', noRegions: (country) => `Regions for ${country} are not mapped yet`,
    categoryNames: { sights: 'Sightseeing', food: 'Food', traditions: 'Traditions' },
    worldMapBlankSpot: 'Undiscovered: no itinerary has been planned here yet',
    passportOwner: 'Holder', document: 'Document', countriesLabel: 'Countries', stampsLabel: 'Stamps',
    countrySeals: 'Seals for completed countries', visitMarks: 'Visit stamps', page: (number) => `Page ${number}`,
    share: 'Share', emptyPage: 'This page is still blank', firstStampHint: 'Complete every quest in a city to earn your first stamp.',
    passportDisclaimer: 'Earn a city stamp by completing all its quests, and a country seal by completing all its cities. This Crista document is not a government passport.',
    pilotLabel: 'Content pilot · server path', cityPilotNames: { 'st-petersburg': 'Saint Petersburg', sochi: 'Sochi' },
    pilotNodeNames: {
      'spb-hermitage': 'The Hermitage', 'spb-peterhof': 'Peterhof', 'spb-collection': 'The Hermitage collection',
      'spb-fountains': 'Peterhof fountains', 'spb-peterhof-history': 'The first mention of Peterhof',
      'sochi-national-park': 'Sochi National Park', 'sochi-dendrarium': 'Sochi Arboretum', 'sochi-forest': 'Mountain forests',
      'sochi-mzymta': 'Mzymta River', 'sochi-park-area': 'National park area',
    },
    pilotNodeStates: { completed: 'Completed', unlocked: 'Open', locked: 'Locked' },
    pilotComplete: 'Route complete. All facts include their original sources.',
    pilotContentLanguageNote: 'Fact and question text is currently available only in Russian, the verified server edition.',
    source: 'Source', openSource: 'open', truthOrMyth: 'True or false', timeline: 'Timeline',
    correctXp: (xp) => `Correct! +${xp} XP`, tryAgain: 'Not quite. Try again.', saveAnswerFailed: 'Could not save your answer. Please try again.',
    questUnavailable: 'This quest is temporarily unavailable.',
    moscowCity: 'Moscow',
    moscowNodeNames: {
      'moscow-red-square': 'Red Square', 'moscow-spasskaya-tower': 'Spasskaya Tower',
      'moscow-tsar-bell': 'Tsar Bell', 'moscow-annunciation-cathedral': 'Annunciation Cathedral',
      'moscow-gum': 'GUM Department Store', 'moscow-zaryadye': 'Zaryadye Park', 'moscow-tretyakov-gallery': 'Tretyakov Gallery',
      'moscow-bolshoi-theatre': 'Bolshoi Theatre', 'moscow-metro': 'Moscow Metro', 'moscow-vdnh': 'VDNKh',
    },
    moscowDistrictNames: {
      'moscow-kremlin': 'Moscow Kremlin', 'moscow-kitaigorod': 'Kitay-Gorod',
      'moscow-zamoskvorechye': 'Zamoskvorechye', 'moscow-teatralny': 'Theatre District', 'moscow-vdnh': 'VDNKh',
    },
    moscowRouteLabel: 'City route',
    moscowRouteSummary: (tier, done, required, todayDone, todayGoal, reached) => `Route tier ${tier}: ${done}/${required} stops. Today: ${todayDone}/${todayGoal}${reached ? ' · goal reached' : ''}.`,
    streakDays: (count) => `${count} days`, routeNodes: 'Moscow route stops',
    moscowPathUnavailable: (error) => `Moscow route is currently unavailable: ${error}.`, moscowPathLoadFailed: 'Could not load the route', routeFallbackLabel: 'Moscow route',
    pointNumber: (position) => `Stop ${position}`,
    nodeStatus: { completed: 'Completed', beginAbove: 'Start above', openQuest: 'Open — play quest', locked: 'Unlocks after the previous stop' },
    finalRound: 'Moscow · final round', bossCompleted: 'City stamp earned · sandbox unlocked',
    bossQuestionCount: (count) => `${count} ${count === 1 ? 'question' : 'questions'} · earn city stamp`,
    bossLocked: 'Unlocks after all route stops',
    guide: 'your guide', contentLanguageNote: 'Lesson text and questions are currently available only in Russian, the verified server edition.',
    moscowQuest: {
      locked: 'This Moscow stop unlocks after the previous quest. The server enforces this requirement.',
      unavailable: (error) => `The next quest is currently unavailable: ${error}.`, retry: 'try refreshing the page',
      point: (position) => `Moscow · stop ${position}`, savedStamp: (stamp) => `${stamp} is already in your passport. Open the Moscow route to continue.`,
      source: 'Source', dailyGoal: (done, goal, reached) => `Today’s goal: ${done}/${goal} stops${reached ? ' — complete' : ''}.`,
      energyEmpty: 'No energy left — it will recharge tomorrow.', answerAwarded: (xp) => `Correct! +${xp} XP`,
      answerAlreadyCompleted: 'Correct — this stamp is already in your passport.', answerIncorrect: 'Not quite! One energy used — try again.',
      saveFailed: 'Your answer could not be saved. Please try again.',
    },
    moscowBoss: {
      unavailable: (error) => `The Moscow final round is currently unavailable: ${error}.`, retry: 'try refreshing the page',
      completed: (stamp) => `${stamp} is already in your passport. The Moscow sandbox is open.`, question: (number) => `Question ${number}`,
      submit: 'Check all three answers', energyEmpty: 'No energy left — it will recharge tomorrow.', sources: 'Sources', review: 'Answer review',
      answerCorrect: 'Correct.', answerIncorrect: 'Incorrect.', allCorrect: 'City stamp earned. Moscow is open for free exploration.',
      incorrectSummary: (count) => `${count} answer(s) need another look. Energy was deducted only for incorrect answers.`,
      saveFailed: 'Your answers could not be saved. Please try again.',
    },
    moscowSandbox: {
      contentLanguageNote: 'The Moscow Wiki article is currently in Russian; the game, story and lesson content use published English editions.',
      unavailable: (error) => `The Moscow sandbox is currently unavailable: ${error}.`, retry: 'try refreshing the page',
      eyebrow: 'Free exploration', title: 'Moscow sandbox',
      description: 'You completed the city loop. Revisit facts, test yourself, and open primary sources without earning extra rewards or spending energy.',
      lessonCheck: 'Test yourself', sourceFallback: 'Open source', cityContext: (version) => `City overview · Wiki ${version}`,
      storyAria: 'Red Square story', wikiAria: 'Crista Wiki article about Moscow', wikiEyebrow: (version) => `Crista Wiki · fact version ${version}`,
      license: (name) => `License: ${name}`, mechanic: 'Game mechanic', answerSaveFailed: 'Your answer could not be saved. Please try again.',
      photoAria: 'Photo scanner exercise', photoDisclaimer: 'This does not recognize or upload your photos. Select an area in the prepared practice image.',
      hotspot: (number) => `Select area ${number} in the photo`,
      recoveryAria: 'Energy recovery', recoveryEyebrow: 'Practice recovery', recoveryTitle: 'Restore one energy point',
      recoveryDescription: 'Answer any exercise above correctly first. Recovery is available once a day and cannot raise energy above five.',
      recoveryDone: 'Already restored today', recoveryButton: 'Restore +1',
      recoveryAwarded: (amount) => `+${amount} energy for practicing. Come back tomorrow for another recovery.`,
      recoveryFailed: 'Could not restore energy.',
      priceAria: 'Guess the price exercise', yourEstimate: 'Your estimate:', yourBid: 'Your bid', checkPrice: 'Check price',
      priceClose: 'Close to the answer.', priceTryAgain: 'Not quite.', wordAria: 'Build a phrase exercise', reorderWords: 'reorder words', wordsOrder: 'Word order',
      moveWordUp: (word) => `Move ${word} up`, moveWordDown: (word) => `Move ${word} down`, checkPhrase: 'Check phrase',
      phraseCorrect: 'Phrase assembled.', orderIncorrect: 'The order is not quite right.', timelineAria: 'Timeline exercise', reorder: 'reorder',
      eventsOrder: 'Event order', moveItemUp: (item) => `Move ${item} up`, moveItemDown: (item) => `Move ${item} down`,
      checkTimeline: 'Check timeline', timelineCorrect: 'Timeline assembled.', itemCorrect: 'In the right place', itemIncorrect: 'Out of place',
      matchingAria: 'Matching exercise', matchingInput: 'tap or keyboard', yearFor: (place) => `Year for ${place}`,
      chooseYear: 'Choose a year', checkPairs: 'Check pairs', pairsCorrect: 'All pairs matched.', pairsIncorrect: 'Some pairs need another look.',
      correct: 'Correct.', checkAgain: 'Try again', truthMythAria: 'True or myth exercise', swipeButtons: 'swipe or use buttons',
      statement: (current, total) => `Statement ${current}/${total}`, myth: '← Myth', truth: 'Truth →', nextStatement: 'Next statement',
      accurate: 'That’s right!', almost: 'Not quite.',
    },
    onboarding: {
      steps: ['Meet Chris', 'Moscow', 'A story', 'Quest'],
      signInHeading: 'Your first trip is waiting', signInBody: 'Sign in to explore Moscow with Chris and save your XP and stamp.',
      loading: 'Loading Chris’s route…', unavailable: (error) => `The game route is currently unavailable: ${error}.`, retry: 'try refreshing the page',
      correctAward: (xp) => `Correct! +${xp} XP`, alreadyStamped: 'Correct — this stamp is already in your passport.', incorrect: 'Not quite! One energy used — try again.',
      answerFailed: 'Your answer could not be saved. Please try again.', goal: (done, goal, reached) => `Today’s goal: ${done}/${goal} stops${reached ? ' — complete' : ''}.`,
      stepsAria: 'First trip steps', completed: (stamp) => `${stamp} is already in your passport. Moscow is open for more quests.`,
      contentLanguageNote: 'The story text and questions are currently available only in Russian; the original is shown.',
      intro: (name) => `${name} will show you how to unlock a new part of the world in two minutes. Let’s start with Russia.`,
      selectRussia: 'Choose Russia', arrivalHeading: 'Moscow ahead',
      arrivalBody: (scene) => `Your first stop is ${scene}. This is where a journey saved to your passport begins.`,
      arrivalAction: 'Discover this place', factAction: 'Play the mini quest', energyEmpty: 'No energy left — it will recharge tomorrow.', sourceFallback: 'Moscow Government',
    },
  },
}

const questCopyEn: Record<string, [string, string]> = {
  'msk-1': ['Red Square', 'Reach Lobnoye Mesto and take a geotagged photo'],
  'msk-2': ['Saint Basil’s Cathedral', 'Find the chapel that gave the cathedral its popular name'],
  'msk-3': ['Tretyakov Gallery', 'Find the Vrubel room'],
  'msk-4': ['Pokrovka pishki', 'Try this local pastry on a weekday before noon'],
  'msk-5': ['VDNKh', 'Walk around the Friendship of Nations fountain'],
  'spb-1': ['The Hermitage', 'Find the Peacock Clock in the Pavilion Hall'],
  'spb-2': ['Church of the Savior on Spilled Blood', 'Look closely at the mosaic above the west entrance'],
  'spb-3': ['Palace Bridge opening', 'Arrive at 1:10 a.m. and capture the bridge opening'],
  'spb-4': ['Bolshaya Konyushennaya pirozhki café', 'Try a pirozhok and coffee the Leningrad way'],
  'spb-5': ['Peter and Paul Fortress', 'Wait for the noon cannon shot'],
  'spb-6': ['Nevsky Prospekt', 'Walk from the Admiralty to Vosstaniya Square'],
  'sochi-1': ['Olympic Park', 'Find the Olympic flame cauldron'],
  'sochi-2': ['Rosa Khutor', 'Take the lift up to 2,320 metres'],
  'sochi-3': ['Tea plantations', 'Try Krasnodar tea where it is grown'],
  'sochi-4': ['Sochi Arboretum', 'Ride the cable car above the park'],
  'tb-1': ['Abanotubani sulfur baths', 'Look beneath the brick domes in the old town'],
  'tb-2': ['Narikala Fortress', 'Take the cable car up at sunset'],
  'tb-3': ['Khinkali on Mtatsminda', 'Eat khinkali without piercing the dough'],
  'bt-1': ['Ali and Nino statue', 'Wait for the figures to pass through one another'],
  'bt-2': ['Adjarian khachapuri', 'Stir the egg yolk into the butter without burning yourself'],
  'is-1': ['Hagia Sophia', 'Find the Byzantine mosaics in the upper gallery'],
  'is-2': ['Grand Bazaar', 'Bargain and bring the price down by at least a third'],
  'is-3': ['Balık ekmek by Galata Bridge', 'Try a fish sandwich served straight from a boat'],
  'be-1': ['Grand Place', 'Walk around the square and find the bakers’ guild house'],
  'be-2': ['Manneken Pis', 'Catch him in costume: his outfit changes more than a hundred times a year'],
  'be-3': ['Street waffles', 'Choose a Liège waffle, not a Brussels one, and eat it without cutlery'],
  'be-4': ['Belfry of Bruges', 'Climb 366 steps and listen for the carillon'],
  'be-5': ['Bruges canals', 'Take a canal trip and count the bridges'],
  'be-6': ['Belgian chocolate', 'Try pralines where they were invented'],
}

function russianCityCount(count: number) {
  const lastTwo = count % 100
  const last = count % 10
  const unit = lastTwo >= 11 && lastTwo <= 14
    ? 'городов'
    : last === 1
      ? 'город'
      : last >= 2 && last <= 4
        ? 'города'
        : 'городов'
  return `${count} ${unit}`
}

export function getGameCopy(language: InterfaceLanguage) {
  return copy[language]
}

export function getQuestCopy(quest: QuestPoint, language: InterfaceLanguage) {
  if (language === 'ru') return { title: quest.title, hint: quest.hint }
  const translated = questCopyEn[quest.id]
  return translated ? { title: translated[0], hint: translated[1] } : { title: quest.title, hint: quest.hint }
}
