/**
 * Ежедневные вопросы про страну. По продуктовому документу это ядро
 * ежедневного трека: короткое задание, которое держит стрик и даёт очки
 * в общий зачёт по стране.
 */

export interface QuizQuestion {
  id: string
  countryIso: string
  question: string
  questionEn: string
  options: string[]
  optionsEn: string[]
  /** Индекс верного варианта */
  correct: number
  /** Объяснение показывается после ответа, независимо от результата */
  explanation: string
  explanationEn: string
  points: number
}

export const quizQuestions: QuizQuestion[] = [
  // Россия
  {
    id: 'ru-q1',
    countryIso: 'RU',
    question: 'Сколько часовых поясов охватывает Россия?',
    questionEn: 'How many time zones does Russia span?',
    options: ['9', '11', '13'],
    optionsEn: ['9', '11', '13'],
    correct: 1,
    explanation:
      'Одиннадцать: от Калининграда до Камчатки. Когда в Москве полдень, на Чукотке уже девять вечера.',
    explanationEn:
      'Eleven, from Kaliningrad to Kamchatka. When it is noon in Moscow, it is already 9 p.m. in Chukotka.',
    points: 10,
  },
  {
    id: 'ru-q2',
    countryIso: 'RU',
    question: 'Что подают в петербургской пышечной вместе с пышкой?',
    questionEn: 'What is traditionally served with a pyshka at a St. Petersburg pyshki café?',
    options: ['Чай с лимоном', 'Кофе с молоком из бака', 'Компот'],
    optionsEn: ['Tea with lemon', 'Coffee with milk from a large urn', 'Fruit compote'],
    correct: 1,
    explanation:
      'Кофе с молоком, разлитый из большого бака. В классических пышечных его готовят так с советских времён.',
    explanationEn:
      'Coffee with milk poured from a large urn. Traditional pyshki cafés have served it this way since the Soviet era.',
    points: 10,
  },
  {
    id: 'ru-q3',
    countryIso: 'RU',
    question: 'Во сколько разводят Дворцовый мост в навигацию?',
    questionEn: 'At what time is the Palace Bridge raised during navigation season?',
    options: ['В 23:40', 'В 01:10', 'В 03:00'],
    optionsEn: ['11:40 p.m.', '1:10 a.m.', '3:00 a.m.'],
    correct: 1,
    explanation:
      'Первое разведение в 01:10, второе в 02:15. Между ними мост ненадолго сводят.',
    explanationEn:
      'The first raising is at 1:10 a.m. and the second at 2:15 a.m. The bridge is briefly lowered between them.',
    points: 15,
  },
  {
    id: 'ru-q4',
    countryIso: 'RU',
    question: 'Какое озеро самое глубокое в мире?',
    questionEn: 'What is the deepest lake in the world?',
    options: ['Байкал', 'Ладожское', 'Каспийское'],
    optionsEn: ['Lake Baikal', 'Lake Ladoga', 'The Caspian Sea'],
    correct: 0,
    explanation: 'Байкал, 1642 метра. В нём около двадцати процентов всей пресной воды планеты.',
    explanationEn: 'Lake Baikal is 1,642 metres deep and contains about 20% of the planet’s unfrozen fresh water.',
    points: 10,
  },

  // Грузия
  {
    id: 'ge-q1',
    countryIso: 'GE',
    question: 'В чём традиционно выдерживают грузинское вино?',
    questionEn: 'What is traditionally used to age Georgian wine?',
    options: ['В дубовых бочках', 'В глиняных квеври под землёй', 'В стальных чанах'],
    optionsEn: ['Oak barrels', 'Clay qvevri buried underground', 'Steel tanks'],
    correct: 1,
    explanation:
      'В квеври: глиняные сосуды закапывают в землю, где держится ровная температура. Технологии больше восьми тысяч лет.',
    explanationEn:
      'In qvevri: clay vessels are buried underground, where the temperature stays even. The technique is more than 8,000 years old.',
    points: 15,
  },
  {
    id: 'ge-q2',
    countryIso: 'GE',
    question: 'Как правильно есть хинкали?',
    questionEn: 'What is the traditional way to eat khinkali?',
    options: ['Ножом и вилкой', 'Руками за хвостик, не протыкая тесто', 'Разрезать пополам'],
    optionsEn: ['With a knife and fork', 'By hand, holding the knob without piercing the dough', 'Cut in half'],
    correct: 1,
    explanation:
      'Берут за хвостик, надкусывают сбоку и выпивают бульон. Хвостики оставляют на тарелке, по ним считают съеденное.',
    explanationEn:
      'Hold one by its knob, bite the side, and sip the broth. The knobs are left on the plate and often used to count how many were eaten.',
    points: 10,
  },
  {
    id: 'ge-q3',
    countryIso: 'GE',
    question: 'Кто такой тамада на грузинском застолье?',
    questionEn: 'What does a tamada do at a Georgian feast?',
    options: ['Повар', 'Ведущий, который управляет тостами', 'Музыкант'],
    optionsEn: ['A cook', 'A toastmaster who leads the toasts', 'A musician'],
    correct: 1,
    explanation:
      'Тамада ведёт супру: задаёт порядок тостов и следит за темпом. Роль почётная, её не дают случайному гостю.',
    explanationEn:
      'The tamada leads the supra, setting the order and pace of the toasts. It is an honoured role, not assigned to just any guest.',
    points: 10,
  },

  // Турция
  {
    id: 'tr-q1',
    countryIso: 'TR',
    question: 'Айя-София за свою историю была:',
    questionEn: 'Over the course of its history, Hagia Sophia has been:',
    options: ['Только собором', 'Собором, мечетью и музеем', 'Только мечетью'],
    optionsEn: ['Only a cathedral', 'A cathedral, a mosque, and a museum', 'Only a mosque'],
    correct: 1,
    explanation:
      'Построена как христианский собор в 537 году, после 1453 года стала мечетью, в XX веке была музеем.',
    explanationEn:
      'Built as a Christian cathedral in 537, it became a mosque after 1453 and served as a museum during the 20th century.',
    points: 15,
  },
  {
    id: 'tr-q2',
    countryIso: 'TR',
    question: 'Что такое балык-экмек?',
    questionEn: 'What is balık ekmek?',
    options: ['Рыба в хлебе', 'Сладость из орехов', 'Чай с бергамотом'],
    optionsEn: ['Fish in bread', 'A nut-based sweet', 'Bergamot tea'],
    correct: 0,
    explanation:
      'Жареная скумбрия в хлебе с луком и зеленью. Готовят прямо на лодках у Галатского моста.',
    explanationEn:
      'Grilled mackerel in bread with onion and greens, traditionally sold from boats near Galata Bridge.',
    points: 10,
  },
  {
    id: 'tr-q3',
    countryIso: 'TR',
    question: 'Насколько принято торговаться на Гранд-базаре?',
    questionEn: 'How much bargaining is customary at the Grand Bazaar?',
    options: ['Торг неуместен', 'Можно сбить до трети цены', 'Цену снижают вдвое и больше'],
    optionsEn: ['Bargaining is inappropriate', 'You can negotiate down to a third of the price', 'Prices are often negotiated down by half or more'],
    correct: 2,
    explanation:
      'Первая названная цена обычно сильно завышена. Спокойный торг вдвое считается нормальной частью покупки.',
    explanationEn:
      'The first quoted price is often much higher. Calmly negotiating it down by half is considered a normal part of the purchase.',
    points: 10,
  },
]

export function questionsForCountry(iso: string): QuizQuestion[] {
  return quizQuestions.filter((q) => q.countryIso === iso)
}

export function quizContent(question: QuizQuestion, language: 'ru' | 'en') {
  if (language === 'ru') {
    return {
      question: question.question,
      options: question.options,
      explanation: question.explanation,
    }
  }

  return {
    question: question.questionEn,
    options: question.optionsEn,
    explanation: question.explanationEn,
  }
}
