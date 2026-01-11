import { Translations } from './types';

export const ru: Translations = {
  // Header
  header: {
    stepTitles: {
      service: 'Сервис',
      type: 'Тип',
      questionnaire: 'Вопросы',
      address: 'Адрес',
      time: 'Время',
      confirmation: 'Подтверждение',
      complete: 'Готово',
    },
  },

  // Service Selector
  serviceSelector: {
    title: 'Выберите сервис',
    subtitle: 'Какой тип услуги вам нужен?',
    cargo: {
      title: 'Грузоперевозки',
      description: 'Перевозка грузов различных размеров',
    },
    evacuator: {
      title: 'Эвакуатор',
      description: 'Транспортировка автомобилей',
    },
    crane: {
      title: 'Кран-подъёмник',
      description: 'Подъём/спуск грузов на этажи',
    },
  },

  // Cargo SubType Selector
  subTypeSelector: {
    title: 'Выберите размер груза',
    subtitle: 'Выберите размер вашего груза',
    dimensions: 'Размеры',
    weight: 'Вес',
    sizes: {
      S: { title: 'S', dimensions: '1.5 м × 1.2 м × 1 м', weight: 'До 500 кг' },
      M: { title: 'M', dimensions: '2.5 м × 1.5 м × 1.5 м', weight: 'До 1000 кг' },
      L: { title: 'L', dimensions: '3 м × 1.8 м × 1.8 м', weight: 'До 1500 кг' },
      XL: { title: 'XL', dimensions: '4 м × 2 м × 2 м', weight: 'До 3000 кг' },
      CONSTRUCTION: { title: 'Строительный', dimensions: '5 м × 2.2 м × 2.2 м', weight: 'До 5000 кг' },
    },
  },

  // Evacuator Type Selector
  evacuatorTypeSelector: {
    title: 'Выберите тип автомобиля',
    subtitle: 'Какой тип автомобиля вы транспортируете?',
    types: {
      SEDAN: { title: 'Легковой', description: 'Седан, хэтчбек, купе' },
      SUV: { title: 'Внедорожник', description: 'Высокий клиренс, пикап' },
      MINIBUS: { title: 'Микроавтобус', description: 'Sprinter, Transit' },
      CONSTRUCTION: { title: 'Спецтехника', description: 'Bobcat, погрузчик' },
      MOTO: { title: 'Мотоцикл', description: 'Скутер, квадроцикл' },
      SPORTS: { title: 'Спортивный', description: 'Заниженная подвеска' },
    },
  },

  // Evacuator Questionnaire
  evacuatorQuestionnaire: {
    title: 'Дополнительная информация',
    wheelLocked: 'Заблокированы ли колёса?',
    steeringLocked: 'Заблокирован ли руль?',
    goesNeutral: 'Переключается ли на нейтраль?',
    yes: 'Да',
    no: 'Нет',
    continue: 'Продолжить',
  },

  // Crane Lift Selector
  craneLiftSelector: {
    title: 'Параметры крана-подъёмника',
    floorTitle: 'Выберите этаж',
    floorSubtitle: 'На какой этаж нужен подъём/спуск?',
    cargoTitle: 'Выберите тип груза',
    cargoSubtitle: 'Какой тип груза вы поднимаете?',
    durationTitle: 'Выберите продолжительность',
    durationSubtitle: 'Сколько времени вам нужно?',
    floors: {
      FLOOR_1_7: 'Этажи 1 - 7',
      FLOOR_8_11: 'Этажи 8 - 11',
      FLOOR_12_20: 'Этажи 12 - 20',
    },
    cargoTypes: {
      FURNITURE: 'Мебель и личные вещи',
      CONSTRUCTION: 'Строительные материалы',
      FRAGILE: 'Хрупкий груз (Стекло, Витраж)',
    },
    durations: {
      ONE_TIME: 'Разовый',
      HOURLY: 'Почасовой',
      FULL_DAY: 'Полный день',
    },
    floorSurcharge: 'Доплата',
  },

  // Location Picker
  locationPicker: {
    title: 'Адреса',
    pickupLabel: 'Место погрузки',
    dropoffLabel: 'Место выгрузки',
    pickupPlaceholder: 'Введите адрес...',
    dropoffPlaceholder: 'Введите адрес...',
    addressLabel: 'Адрес',
    addressPlaceholder: 'Введите адрес...',
    distance: 'Расстояние',
    km: 'км',
    search: 'Поиск',
    selectOnMap: 'Выбрать на карте',
    clickToSelectPickup: 'Нажмите на карту, чтобы выбрать место погрузки',
    clickToSelectDropoff: 'Нажмите на карту, чтобы выбрать место выгрузки',
    clickToSelect: 'Нажмите на карту, чтобы выбрать адрес',
    addressNotFound: 'Адрес не найден',
    enterAddress: 'Пожалуйста, введите адрес',
  },

  // Date Time Picker
  dateTimePicker: {
    title: 'Когда вам нужно?',
    now: 'Сейчас',
    schedule: 'Запланировать',
    date: 'Дата',
    time: 'Время',
    scheduledTime: 'Запланированное время:',
  },

  // Order Form
  orderForm: {
    phoneLabel: 'Номер телефона',
    phonePlaceholder: '+995 5XX XXX XXX',
    phoneError: 'Пожалуйста, введите правильный номер (+995XXXXXXXXX или 5XXXXXXXX)',
    phoneErrorShort: 'Пожалуйста, введите правильный номер',
    paymentMethod: 'Способ оплаты',
    cash: 'Наличные',
    card: 'Банковский перевод',
    totalPrice: 'К оплате:',
    currency: '₾',
    submit: 'Отправить заказ',
    submitting: 'Отправка...',
  },

  // Order Confirmation
  orderConfirmation: {
    title: 'Заказ получен!',
    subtitle: 'Мы свяжемся с вами в ближайшее время',
    orderDetails: 'Детали заказа',
    service: 'Сервис',
    address: 'Адрес',
    pickup: 'Место погрузки',
    dropoff: 'Место выгрузки',
    vehicle: 'Автомобиль',
    evacuator: 'Эвакуатор',
    floor: 'Этаж',
    cargoType: 'Тип груза',
    duration: 'Продолжительность',
    distance: 'Расстояние',
    scheduledTime: 'Запланированное время',
    price: 'Цена',
    payment: 'Оплата',
    paymentMethod: 'Способ оплаты',
    cash: 'Наличные',
    card: 'Банковский перевод',
    bankTransferReminder: 'Пожалуйста, переведите сумму до завершения заказа',
    tbcBank: 'TBC Банк',
    bogBank: 'Банк Грузии',
    iban: 'IBAN:',
    recipient: 'Получатель:',
    copyIban: 'Копировать',
    copied: 'Скопировано!',
    whatsapp: 'WhatsApp',
    call: 'Позвонить',
    newOrder: 'Новый заказ',
    // Service types
    cargoService: 'Грузоперевозки',
    evacuatorService: 'Эвакуатор',
    craneService: 'Кран-подъёмник',
    // Sub types
    sizeS: 'S - Маленький',
    sizeM: 'M - Средний',
    sizeL: 'L - Большой',
    sizeXL: 'XL - Очень большой',
    sizeConstruction: 'Строительный',
  },

  // Order Summary
  orderSummary: {
    title: 'Данные заказа',
    service: 'Сервис',
    cargo: 'Груз',
    crane: 'Кран-подъёмник',
    evacuator: 'Эвакуатор',
    vehicle: 'Автомобиль',
    evacuatorType: 'Тип эвакуатора',
    floor: 'Этаж',
    cargoType: 'Тип груза',
    duration: 'Продолжительность',
    distance: 'Расстояние',
    time: 'Время',
  },

  // Service Vehicle Labels
  serviceVehicleLabels: {
    STANDARD: 'Стандартный (с лебёдкой)',
    SPIDER: 'Паук (гидравлический подъёмник)',
    LOWBOY: 'Тяжёлая платформа (Lowboy)',
    HEAVY_MANIPULATOR: 'Тяжёлый манипулятор / буксир',
    LONG_BED: 'Удлинённая платформа (Long Bed)',
    MOTO_CARRIER: 'Малый эвакуатор / мото-перевозчик',
  },

  // Navigation
  navigation: {
    back: 'Назад',
    home: 'Сначала',
    continue: 'Продолжить',
    mainPage: 'Главная',
  },

  // Cookie Banner
  cookieBanner: {
    message: 'Этот веб-сайт использует файлы Cookie',
    accept: 'OK',
  },

  // Footer
  footer: {
    privacy: 'Конфиденциальность',
    terms: 'Условия',
    contact: 'Контакты',
  },

  // Contact Page
  contactPage: {
    title: 'Контакты',
    phone: 'Телефон',
    email: 'Эл. почта',
    whatsapp: 'WhatsApp',
    available: '24/7',
  },

  // About Page
  aboutPage: {
    title: 'О нас',
    description: 'EXPRO.GE — платформа грузоперевозок, эвакуатора и крана-подъёмника, работающая в Грузии.',
    services: 'Наши услуги',
    cargoService: 'Грузоперевозки — машины различных размеров',
    evacuatorService: 'Эвакуатор — для любого типа автомобиля',
    craneService: 'Кран-подъёмник — подъём/спуск грузов на этажи',
    whyUs: 'Почему мы?',
    fast: 'Быстро',
    fastDesc: 'Быстрое реагирование и обслуживание',
    reliable: 'Надёжно',
    reliableDesc: 'Опытные водители и современная техника',
    affordable: 'Доступно',
    affordableDesc: 'Конкурентные цены и прозрачные условия',
  },

  // Privacy Page
  privacyPage: {
    title: 'Политика конфиденциальности',
    intro: 'Эта политика конфиденциальности описывает, как мы собираем и используем ваши персональные данные.',
    section1Title: '1. Собираемая информация',
    section1Content: 'Мы собираем информацию, которую вы предоставляете при оформлении заказа: номер телефона, адреса и детали заказа.',
    section2Title: '2. Использование информации',
    section2Content: 'Ваша информация используется только для выполнения заказа и связи с вами.',
    section3Title: '3. Защита данных',
    section3Content: 'Мы используем стандартные отраслевые меры безопасности для защиты ваших данных.',
    section4Title: '4. Контакты',
    section4Content: 'По вопросам конфиденциальности свяжитесь с нами: exprogeo@gmail.com',
  },

  // Terms Page
  termsPage: {
    title: 'Условия обслуживания',
    intro: 'Используя услуги EXPRO.GE, вы соглашаетесь со следующими условиями:',
    section1Title: '1. Описание услуг',
    section1Content: 'EXPRO.GE предлагает услуги грузоперевозок, эвакуатора и крана-подъёмника в Тбилиси и по всей Грузии.',
    section2Title: '2. Цены и оплата',
    section2Content: 'Цены указаны в грузинских лари и могут изменяться без предварительного уведомления. Оплата производится наличными или банковским переводом.',
    section3Title: '3. Отмена заказа',
    section3Content: 'Заказ можно отменить бесплатно до отправки водителя.',
    section4Title: '4. Ответственность',
    section4Content: 'Мы несём ответственность за повреждение груза при транспортировке, за исключением случаев, когда повреждение вызвано неправильной упаковкой.',
    section5Title: '5. Контакты',
    section5Content: 'По вопросам свяжитесь с нами: +995 555 23 33 44',
  },

  // Error messages
  errors: {
    orderFailed: 'Не удалось отправить заказ.',
    tryAgain: 'Пожалуйста, попробуйте снова.',
  },
};
