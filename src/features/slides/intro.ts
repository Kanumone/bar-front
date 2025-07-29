import { Episode, type EpisodeConfig } from "./common";

const introConfig: EpisodeConfig[] = [
  {
    slideIndex: 1,
    filename: "frame-36.jpg",
    originX: 0,
    positionX: 0,
    actions: [{
      type: "message",
      characterName: "Алексей",
      text: "Ты дома. Это твоя комната. Вроде ничего необычного: чай, уроки, лень. Но на столе — коробка. Почта. Отправитель не указан.",
    }],
  },
  {
    slideIndex: 2,
    filename: "frame-28.jpg",
    originX: 0,
    positionX: 0,
  },
  {
    slideIndex: 3,
    filename: "frame-27.jpg",
    originX: 0.7,
    positionX: 0.7,
  },
  {
    slideIndex: 4,
    filename: "frame-29.jpg",
    actions: [{
      type: "thoughts",
      characterName: "Алексей",
      text: "Да ладно. Это точно дед. Только он мог прислать что-то без объяснений. И с интригой.",
    }],
  },
  {
    slideIndex: 5,
    filename: "frame-25.jpg",
    actions: [{
      type: "thoughts",
      characterName: "Алексей",
      text: "В коробке — всё по-дедовски: аккуратно, но неформально. Карта выглядит как будто её уже кто-то прошёл. Дневник — почти пустой. Кассета — с подписью: \"Старт. Не трогай, если не готов.\"",
    }],
  },
  {
    slideIndex: 5,
    filename: "frame-31.jpg",
  },
  {
    slideIndex: 6,
    filename: "frame-30.jpg",
    actions: [{
      type: "thoughts",
      characterName: "Алексей",
      text: "Типичный дед. \"Не трогай\" — значит, включай немедленно.",
    },
    {
      type: "button",
      characterName: "Алексей",
      button: {
        text: "▶ «Включить кассету»",
        action: () => {
          console.log("Включить кассету");
        },
      },
    },
    ],
  },
  {
    slideIndex: 7,
    filename: "frame-25.jpg",
    originX: 0.3,
    positionX: 0.3,
    actions: [
      {
        type: "message",
        characterName: "Кассета",
        text: "О! Ну ты и правда открыл это? Так и знал, что хватит смелости. Алексей, поздравляю — теперь ты в игре. И, да… выхода нет. Ха-ха. Шучу. Наверное.",
      },
      {
        type: "message",
        characterName: "Кассета",
        text: "Смотри внимательно. Всё кажется странным и непонятным? Так и должно быть. Прошлое и будущее — они, как плохие фотографии: всегда смазаны и никогда не знаешь, что там вообще изображено.",
      },
      {
        type: "message",
        characterName: "Кассета",
        text: "Хочешь узнать, что происходит? Собрать всё воедино ? Тогда вперёд — в путь. И, может быть, узнаешь, кем ты на самом деле станешь.",
      },
      {
        type: "message",
        characterName: "Кассета",
        text: "Внутри моя карта. Старая. Выглядит как новая, хотя ждешь, что будет похоже, её пожевала собака, а потом она лежала сто лет под диваном. На ней Города, в них есть  Солнечная. Запомни её. Она важная. Серьёзно, даже слишком важная.",
      },
      {
        type: "message",
        characterName: "Кассета",
        text: "Смотри сюда: “Солнечная, Иркутск”, 	Солнечная, Казань., “Солнечная, Урал”, “Солнечная, Москва”",
      },
    ],
  },
  {
    slideIndex: 8,
    filename: "frame-31.jpg",
    actions: [{
      type: "thoughts",
      characterName: "Алексей",
      text: "Дед, ну ты даёшь. Это что, твоя старая шутка или реальная головоломка?",
    }]
  },
  {
    slideIndex: 9,
    filename: "frame-25.jpg",
    originX: 0.3,
    positionX: 0.3,
    actions: [
      {
        type: "message",
        characterName: "Кассета",
        text: "Да, таких улиц много. Но одна из них — правильная. Начни с неё. Не торопись. Смотри по сторонам.",
      },
      {
        type: "message",
        characterName: "Кассета",
        text: "Понять страну, это как слушать старый радиоприёмник: шум, помехи, странные голоса. Но если настроиться, можно услышать кое-что по-настоящему важное.",
      },
    ],
  },
  {
    slideIndex: 10,
    filename: "frame-34.jpg",
    actions: [
      {
        type: "message",
        characterName: "Алексей",
        text: "«Ты ищешь не клад, Алексей. Ты ищешь меня. Я оставил подсказки на улицах Солнечных по всей стране. Ищи людей. Они подскажут путь. Там, где тепло и светло, там и правда.»",
      },
      {
        type: "choice",
        characterName: "Алексей",
        options: [
          "Похоже на квест. Только место локаций — реальные города.",
          "Ну… допустим. Раз уж посылка пришла — надо ехать. Кто я такой, чтобы спорить с дедовским сюжетом?",
          "Ладно, дед, я в игре. Только без эзотерики, договорились?",
          "Начну записывать. Будет мой личный фильм: ‘Дороги, которых не было в учебниках’.",
        ],
      },
    ],
  },
  {
    slideIndex: 11,
    filename: "frame-35.jpg",
    actions: [
      {
        type: "thoughts",
        characterName: "Алексей",
        text: "Что делать, нужно собираться",
      },
      {
        type: "button",
        characterName: "Алексей",
        button: {
          text: "▶ «Начать путь»",
          action: () => {
            console.log("Начать путь");
          },
        },
      },
    ],
  },
  // collect items
  {
    slideIndex: 13,
    filename: "Frame 12.jpg",
    actions: [
      {
        type: "message",
        text: "Процесс сбора вещей",
      },
    ],
  },
  {
    slideIndex: 15,
    filename: "Frame 122.jpg",
  },
  {
    slideIndex: 16,
    filename: "Frame 13.jpg",
    actions: [
      {
        type: "thoughts",
        text: "Всё. Что-то собрал. Что-то оставил. Может, не всё нужное. Но точно — своё.",
      },
      {
        type: "button",
        button: {
          text: "▶ «К вокзалу»",
          action: () => {
            console.log("К вокзалу");
          },
        },
      },
    ],
  },
  // exit to train
  {
    slideIndex: 17,
    filename: "Frame 16.jpg",

  },
  {
    slideIndex: 18,
    filename: "Frame 17.jpg",
    actions: [
      {
        type: "thoughts",
        characterName: "Алексей",
        text: "«Тааак, что-то пришло...»",
      },
      {
        type: "button",
        characterName: "Алексей",
        button: {
          text: "► «Открыть уведомления»",
          action: () => {
            console.log("Открыть уведомления");
          },
        },
      },
    ],
  },
  {
    slideIndex: 19,
    filename: "Frame 18.jpg",

  },
  {
    slideIndex: 20,
    filename: "Frame 19.jpg",

  },
  {
    slideIndex: 21,
    filename: "Frame 20.jpg",

  },
  {
    slideIndex: 22,
    filename: "Frame 17.jpg",
  },
  {
    slideIndex: 23,
    filename: "Frame 21.jpg",
    actions: [
      {
        type: "thoughts",
        characterName: "Алексей",
        text: "«У неё стиль — всё сказать шуткой...»",
      },
      {
        type: "choice",
        characterName: "Алексей",
        options: [
          "«Ты тоже. Только сову не пугай.»",
          "«Уставший гном благодарит за поддержку.»",
          "[Стикер 🐻 + ❤️]",
        ],
      },
    ],
  },
  {
    slideIndex: 23,
    filename: "Frame 23.jpg",
    actions: [
      {
        type: "message",
        characterName: "Алексей",
        text: "Коридор",
      },
    ],
  },
  {
    slideIndex: 24,
    filename: "Frame 24.jpg",
    actions: [
      {
        type: "speech",
        characterName: "Мама",
        text: "«Всё. Поехал. Варежки не взял, спорим?...»",
      },
      {
        type: "thoughts",
        characterName: "Алексей",
        text: "«Она не обнимает на прощание. Просто даёт инструкции.»",
      },
      {
        type: "choice",
        characterName: "Алексей",
        options: [
          "«Хм. Ну конечно...»",
          "«Варежки... Да...»",
          "[Молча кивает]",
          "«Варежки... ага...»",
        ],
      },
      {
        type: "button",
        characterName: "Алексей",
        button: {
          text: "► На вокзал",
          action: () => {
            console.log("На вокзал");
          },
        },
      },
    ],
  },
];

export function getIntroSlides(): Episode[] {
  const episodes: Episode[] = [];
  // Применяем конфигурации к эпизодам
  introConfig.forEach((config) => {
    const episode = new Episode(config.slideIndex, config.filename, "intro", config.actions, config.originX, config.originY, config.positionX, config.positionY);
    episodes.push(episode);
  });

  return episodes;
}
