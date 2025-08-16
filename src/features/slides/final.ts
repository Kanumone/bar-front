import { Episode, type EpisodeConfig } from "./common";

// Эпилог — финальные слайды
const finalSlides: EpisodeConfig[] = [
  // Screen_1 — Перрон, который держит
  {
    slideIndex: 1,
    filename: "Screen_1.jpg",
    backgroundSound: "station-ambient.mp3",
    actions: [
      {
        type: "message",
        text: "Тёплый свет платформы, пар из-под состава, табло шуршит. Мама и сестра ждут у жёлтой полосы."
      },
      { type: "speech", characterName: "Станция", text: "Поезд прибыл на путь." },
      {
        type: "message",
        text: "Поезд «выдыхает», дверь шипит. Алексей выходит, на мгновение останавливается — и идёт к ним."
      }
    ],
  },

  // Screen_2 — встреча
  {
    slideIndex: 2,
    filename: "Screen_2.jpg",
    backgroundSound: "platform-voices-ambient.mp3",
    actions: [
      { type: "message", text: "Мама крепко обнимает — без слов." },
      { type: "speech", characterName: "Сестра", text: "Ты пахнешь дымом и ветром." },
      { type: "speech", characterName: "Отец", text: "Наш дед всегда был такой. Я скучал, сын, как же ты повзрослел." },
      {
        type: "choice",
        text: "Как он здоровается?",
        options: [
          "Я дома.",
          "Поезд привёз меня целиком.",
          "Заметили? Я стал тише — но не исчез."
        ],
        outcomes: {
          0: { actions: [{ type: "speech", characterName: "Алексей", text: "Я дома." }] },
          1: { actions: [{ type: "speech", characterName: "Алексей", text: "Поезд привёз меня целиком." }] },
          2: { actions: [{ type: "speech", characterName: "Алексей", text: "Заметили? Я стал тише — но не исчез." }] }
        }
      },
      { type: "speech", characterName: "Алексей", text: "Я слышал, как молчит вода и как дышит земля. Расскажу за чаем." ,},
      { type: "speech", characterName: "Алексей", text: "Солнечные улицы — правда везде. И люди — лучше любых карт.", },
      { type: "thoughts", characterName: "Алексей", text: "Дом — это место, где делишься тем, что услышал в пути.", },
      {
        type: "message",
        text: "Мама поправляет ремень на рюкзаке; сестра незаметно перекладывает в карман Алексея маленькую записку: «ты есть — и этого достаточно»."
      }
    ]
  },

  // Screen_3 — Ночная запись — Кассета для D.
  {
    slideIndex: 3,
    filename: "Screen_3.jpg",
    backgroundSound: "night-kitchen-ambient.mp3",
    actions: [
      { type: "message", text: "Кухня ночью: лампа, пар от кружки, кассетный магнитофон, чистая плёнка." },
      { type: "speech", characterName: "Алексей", text: "Спасибо, что отправил меня, дед. Ты знал: я найду не то, что искал, а то, что нужно." },
      {
        type: "choice",
        text: "Фраза‑запечатывание",
        options: [
          "Сохраняю названия, даты и тишину.",
          "Слышу. Возвращаюсь. Спасибо за дорогу.",
          "Дальше ищу не адреса, а людей."
        ],
        outcomes: {
          0: { actions: [{ type: "message", text: "Алексей медленно нажимает REC и шепчет: ‘Сохраняю названия, даты и тишину.’" }] },
          1: { actions: [{ type: "message", text: "Алексей нажимает REC: ‘Слышу. Возвращаюсь. Спасибо за дорогу.’" }] },
          2: { actions: [{ type: "message", text: "Алексей записывает: ‘Дальше ищу не адреса, а людей.’" }] }
        }
      },
      {
        type: "button",
        button: {
          text: "Записать кассету",
          action: () => {},
        }
      },
      { type: "message", text: "На корпусе кассеты — подпись от руки: ‘Солнечные. Благодарность’." }
    ]
  },

  // Screen_4 — Монтаж — Солнечные улицы
  {
    slideIndex: 4,
    filename: "Screen_4.jpg",
    backgroundSound: "montage-music.mp3",
    actions: [
      { type: "message", text: "Монтаж: письма и конверты. Надпись: ‘Для D. / Тем, кто слушает. — А.’" },
      {
        type: "multi-choice",
        options: [
          "Отметить на карте Солнечную в Новосибирске",
          "Отметить на карте Солнечную в Казани",
          "Отметить на карте Солнечную в Иркутске"
        ],
        submitMode: "button",
        submitButtonText: "Сохранить",
        postActionsOrder: "bySelection"
      },
      {
        type: "choice",
        text: "Добавить к одному конверту сувенир",
        options: ["Птичка (Иркутск)", "Болтик-камертон (Екб)"],
        outcomes: {
          0: { actions: [{ type: "message", text: "Вы добавили птичку из Иркутска." }] },
          1: { actions: [{ type: "message", text: "Вы добавили болтик-камертон из Екб." }] }
        }
      }
    ]
  },

  // Screen_5 — Взгляд в будущее — Перрон снова
  {
    slideIndex: 5,
    filename: "Screen_5.jpg",
    backgroundSound: "early-morning-station.mp3",
    actions: [
      { type: "message", text: "Пустынная платформа, пар прозрачнее, табло медленно обновляет строки." },
      { type: "thoughts", characterName: "Алексей", text: "Когда-нибудь я снова отправлюсь в путь. Чтобы найти тебя, дед. Но главное — теперь я знаю, кто я." },
      {
        type: "choice",
        text: "Каким будет следующий шаг?",
        options: [
          "Взять билет до ближайших гор — тихий кивок Уралу.",
          "Оставить у табло листок: ‘Ищу людей, умеющих слушать’.",
          "Просто стоять и слушать перрон."
        ],
        outcomes: {
          0: { actions: [{ type: "message", text: "Билет в кармане. Небольшая карта с пометкой: Урал." }] },
          1: { actions: [{ type: "message", text: "Листок на табло: ‘Ищу людей, умеющих слушать’. Ты оставил знак для тех, кто идёт тем же путём." }] },
          2: { actions: [{ type: "message", text: "Ты просто слушаешь: рельсы, дыхание платформы, расстояние между поездами." }] }
        }
      }
    ]
  },

  // Screen_6 — Завершающий кадр
  {
    slideIndex: 6,
    filename: "Screen_6.jpg",
    backgroundSound: "train-departure-mix.mp3",
    actions: [
      { type: "message", text: "Поезд трогается. Камера поднимается выше: рельсы уходят к горизонту, восход над туманом." },
      { type: "message", text: "На краю света — тонкий золотой клинок рассвета." },
      { type: "message", text: "Конец одной дороги — это начало другой." },
      {
        type: "button",
        button: {
          text: "Продолжить",
          action: () => {},
        }
      }
    ]
  }
];

export const getFinalSlides = (): Episode[] => {
  const episodes: Episode[] = [];
  finalSlides.forEach((config) => {
    const episode = new Episode({ ...config, scene: "final-slides" });
    episodes.push(episode);
  });
  return episodes;
};



