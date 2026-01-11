import { Translations } from './types';

export const ka: Translations = {
  // Header
  header: {
    stepTitles: {
      service: 'სერვისი',
      type: 'ტიპი',
      questionnaire: 'კითხვარი',
      address: 'მისამართი',
      time: 'დრო',
      confirmation: 'დადასტურება',
      complete: 'დასრულება',
    },
  },

  // Service Selector
  serviceSelector: {
    title: 'აირჩიეთ სერვისი',
    subtitle: 'რა ტიპის სერვისი გჭირდებათ?',
    cargo: {
      title: 'ტვირთის გადაზიდვა',
      description: 'სხვადასხვა ზომის ტვირთების გადაზიდვა',
    },
    evacuator: {
      title: 'ევაკუატორი',
      description: 'ავტომობილის ტრანსპორტირება',
    },
    crane: {
      title: 'ამწე ლიფტი',
      description: 'სართულებზე ტვირთის აწევა-ჩამოწევა',
    },
  },

  // Cargo SubType Selector
  subTypeSelector: {
    title: 'აირჩიეთ ტვირთის ზომა',
    subtitle: 'აირჩიეთ თქვენი ტვირთის ზომა',
    dimensions: 'ზომები',
    weight: 'წონა',
    sizes: {
      S: { title: 'S', dimensions: '1.5 მ × 1.2 მ × 1 მ', weight: '500 კგ-მდე' },
      M: { title: 'M', dimensions: '2.5 მ × 1.5 მ × 1.5 მ', weight: '1000 კგ-მდე' },
      L: { title: 'L', dimensions: '3 მ × 1.8 მ × 1.8 მ', weight: '1500 კგ-მდე' },
      XL: { title: 'XL', dimensions: '4 მ × 2 მ × 2 მ', weight: '3000 კგ-მდე' },
      CONSTRUCTION: { title: 'სამშენებლო', dimensions: '5 მ × 2.2 მ × 2.2 მ', weight: '5000 კგ-მდე' },
    },
  },

  // Evacuator Type Selector
  evacuatorTypeSelector: {
    title: 'აირჩიეთ ავტომობილის ტიპი',
    subtitle: 'რა ტიპის ავტომობილს ტრანსპორტირებთ?',
    types: {
      SEDAN: { title: 'მსუბუქი', description: 'სედანი, ჰეჩბეკი, კუპე' },
      SUV: { title: 'ჯიპი', description: 'მაღალი გამავლობის, პიკაპი' },
      MINIBUS: { title: 'მიკროავტობუსი', description: 'Sprinter, Transit' },
      CONSTRUCTION: { title: 'სპეცტექნიკა', description: 'Bobcat, Forklift' },
      MOTO: { title: 'მოტოციკლი', description: 'სკუტერი, კვადროციკლი' },
      SPORTS: { title: 'სპორტული', description: 'დაწეული სავალი ნაწილი' },
    },
  },

  // Evacuator Questionnaire
  evacuatorQuestionnaire: {
    title: 'დამატებითი ინფორმაცია',
    wheelLocked: 'დაბლოკილია თუ არა საბურავები?',
    steeringLocked: 'დაბლოკილია თუ არა საჭე?',
    goesNeutral: 'გადადის თუ არა ნეიტრალზე?',
    yes: 'დიახ',
    no: 'არა',
    continue: 'გაგრძელება',
  },

  // Crane Lift Selector
  craneLiftSelector: {
    title: 'ამწე ლიფტის პარამეტრები',
    floorTitle: 'აირჩიეთ სართული',
    floorSubtitle: 'რომელ სართულზე უნდა ატვირთვა/ჩამოტვირთვა?',
    cargoTitle: 'აირჩიეთ ტვირთის ტიპი',
    cargoSubtitle: 'რა ტიპის ტვირთს ატვირთავთ?',
    durationTitle: 'აირჩიეთ ხანგრძლივობა',
    durationSubtitle: 'რამდენი ხანი დაგჭირდებათ?',
    floors: {
      FLOOR_1_7: '1 - 7 სართული',
      FLOOR_8_11: '8 - 11 სართული',
      FLOOR_12_20: '12 - 20 სართული',
    },
    cargoTypes: {
      FURNITURE: 'ავეჯი და პირადი ნივთები',
      CONSTRUCTION: 'სამშენებლო მასალა',
      FRAGILE: 'მყიფე ტვირთი (მინა, ვიტრაჟი)',
    },
    durations: {
      ONE_TIME: 'ერთჯერადი',
      HOURLY: 'საათობრივი',
      FULL_DAY: 'მთლიანი დღე',
    },
    floorSurcharge: 'დამატებითი',
  },

  // Location Picker
  locationPicker: {
    title: 'მისამართები',
    pickupLabel: 'აყვანის ადგილი',
    dropoffLabel: 'ჩაბარების ადგილი',
    pickupPlaceholder: 'ჩაწერეთ მისამართი...',
    dropoffPlaceholder: 'ჩაწერეთ მისამართი...',
    addressLabel: 'მისამართი',
    addressPlaceholder: 'ჩაწერეთ მისამართი...',
    distance: 'მანძილი',
    km: 'კმ',
    search: 'ძებნა',
    selectOnMap: 'აირჩიეთ რუკაზე',
    clickToSelectPickup: 'დააწკაპუნეთ რუკაზე აყვანის ადგილის ასარჩევად',
    clickToSelectDropoff: 'დააწკაპუნეთ რუკაზე ჩაბარების ადგილის ასარჩევად',
    clickToSelect: 'დააწკაპუნეთ რუკაზე მისამართის ასარჩევად',
    addressNotFound: 'მისამართი ვერ მოიძებნა',
    enterAddress: 'გთხოვთ შეიყვანოთ მისამართი',
  },

  // Date Time Picker
  dateTimePicker: {
    title: 'როდის გჭირდებათ?',
    now: 'ახლავე',
    schedule: 'დაგეგმვა',
    date: 'თარიღი',
    time: 'დრო',
    scheduledTime: 'დაგეგმილი დრო:',
  },

  // Order Form
  orderForm: {
    phoneLabel: 'ტელეფონის ნომერი',
    phonePlaceholder: '+995 5XX XXX XXX',
    phoneError: 'გთხოვთ შეიყვანოთ სწორი ნომერი (+995XXXXXXXXX ან 5XXXXXXXX)',
    phoneErrorShort: 'გთხოვთ შეიყვანოთ სწორი ნომერი',
    paymentMethod: 'გადახდის მეთოდი',
    cash: 'ნაღდი ფული',
    card: 'ბარათით',
    totalPrice: 'გადასახდელი თანხა:',
    currency: '₾',
    submit: 'შეკვეთის გაგზავნა',
    submitting: 'იგზავნება...',
  },

  // Order Confirmation
  orderConfirmation: {
    title: 'შეკვეთა მიღებულია!',
    subtitle: 'მალე დაგიკავშირდებით',
    orderDetails: 'შეკვეთის დეტალები',
    service: 'სერვისი',
    address: 'მისამართი',
    pickup: 'აყვანის ადგილი',
    dropoff: 'ჩაბარების ადგილი',
    vehicle: 'ავტომობილი',
    evacuator: 'ევაკუატორი',
    floor: 'სართული',
    cargoType: 'ტვირთის ტიპი',
    duration: 'ხანგრძლივობა',
    distance: 'მანძილი',
    scheduledTime: 'დაგეგმილი დრო',
    price: 'ფასი',
    payment: 'გადახდა',
    paymentMethod: 'გადახდის მეთოდი',
    cash: 'ნაღდი ფული',
    card: 'ბარათით',
    bankTransferReminder: 'გთხოვთ გადარიცხოთ თანხა შეკვეთის დასრულებამდე',
    tbcBank: 'თიბისი ბანკი',
    bogBank: 'საქართველოს ბანკი',
    iban: 'IBAN:',
    recipient: 'მიმღები:',
    copyIban: 'დააკოპირე',
    copied: 'დაკოპირდა!',
    whatsapp: 'WhatsApp',
    call: 'დარეკვა',
    newOrder: 'ახალი შეკვეთა',
    // Service types
    cargoService: 'ტვირთის გადაზიდვა',
    evacuatorService: 'ევაკუატორი',
    craneService: 'ამწე ლიფტი',
    // Sub types
    sizeS: 'S - პატარა',
    sizeM: 'M - საშუალო',
    sizeL: 'L - დიდი',
    sizeXL: 'XL - ძალიან დიდი',
    sizeConstruction: 'სამშენებლო',
  },

  // Order Summary
  orderSummary: {
    title: 'შეკვეთის მონაცემები',
    service: 'სერვისი',
    cargo: 'ტვირთი',
    crane: 'ამწე ლიფტი',
    evacuator: 'ევაკუატორი',
    vehicle: 'ავტომობილი',
    evacuatorType: 'ევაკუატორი',
    floor: 'სართული',
    cargoType: 'ტვირთის ტიპი',
    duration: 'ხანგრძლივობა',
    distance: 'მანძილი',
    time: 'დრო',
  },

  // Service Vehicle Labels
  serviceVehicleLabels: {
    STANDARD: 'სტანდარტული (ჯალამბარით)',
    SPIDER: 'ობობა (ჰიდრავლიკური ამწით)',
    LOWBOY: 'მძიმე პლატფორმა (Lowboy)',
    HEAVY_MANIPULATOR: 'მძიმე მანიპულატორი / ბუქსირი',
    LONG_BED: 'გრძელბაქნიანი (Long Bed)',
    MOTO_CARRIER: 'მცირე ევაკუატორი / მოტო-სამაგრებით',
  },

  // Navigation
  navigation: {
    back: 'უკან',
    home: 'თავიდან',
    continue: 'გაგრძელება',
    mainPage: 'მთავარი',
  },

  // Cookie Banner
  cookieBanner: {
    message: 'ეს ვებსაიტი იყენებს Cookie ფაილებს',
    accept: 'OK',
  },

  // Footer
  footer: {
    privacy: 'კონფიდენციალურობა',
    terms: 'პირობები',
    contact: 'კონტაქტი',
  },

  // Contact Page
  contactPage: {
    title: 'კონტაქტი',
    phone: 'ტელეფონი',
    email: 'ელ-ფოსტა',
    whatsapp: 'WhatsApp',
    available: '24/7',
  },

  // About Page
  aboutPage: {
    title: 'ჩვენს შესახებ',
    description: 'EXPRO.GE არის საქართველოში მოქმედი ტვირთის გადაზიდვის, ევაკუატორის და ამწე ლიფტის სერვისის პლატფორმა.',
    services: 'ჩვენი სერვისები',
    cargoService: 'ტვირთის გადაზიდვა - სხვადასხვა ზომის მანქანებით',
    evacuatorService: 'ევაკუატორი - ნებისმიერი ტიპის ავტომობილისთვის',
    craneService: 'ამწე ლიფტი - სართულებზე ტვირთის აწევა-ჩამოწევა',
    whyUs: 'რატომ ჩვენ?',
    fast: 'სწრაფი',
    fastDesc: 'სწრაფი რეაგირება და მომსახურება',
    reliable: 'საიმედო',
    reliableDesc: 'გამოცდილი მძღოლები და თანამედროვე ტექნიკა',
    affordable: 'ხელმისაწვდომი',
    affordableDesc: 'კონკურენტული ფასები და გამჭვირვალე პირობები',
  },

  // Privacy Page
  privacyPage: {
    title: 'კონფიდენციალურობის პოლიტიკა',
    intro: 'ეს კონფიდენციალურობის პოლიტიკა აღწერს, თუ როგორ ვაგროვებთ და ვიყენებთ თქვენს პერსონალურ მონაცემებს.',
    section1Title: '1. შეგროვებული ინფორმაცია',
    section1Content: 'ჩვენ ვაგროვებთ ინფორმაციას, რომელსაც თქვენ გვაწვდით შეკვეთის განთავსებისას: ტელეფონის ნომერი, მისამართები და შეკვეთის დეტალები.',
    section2Title: '2. ინფორმაციის გამოყენება',
    section2Content: 'თქვენი ინფორმაცია გამოიყენება მხოლოდ შეკვეთის შესრულებისა და თქვენთან დაკავშირებისთვის.',
    section3Title: '3. ინფორმაციის დაცვა',
    section3Content: 'ჩვენ ვიყენებთ ინდუსტრიის სტანდარტულ უსაფრთხოების ზომებს თქვენი მონაცემების დასაცავად.',
    section4Title: '4. კონტაქტი',
    section4Content: 'კონფიდენციალურობასთან დაკავშირებული შეკითხვებისთვის დაგვიკავშირდით: exprogeo@gmail.com',
  },

  // Terms Page
  termsPage: {
    title: 'მომსახურების პირობები',
    intro: 'EXPRO.GE-ის სერვისებით სარგებლობით თქვენ ეთანხმებით შემდეგ პირობებს:',
    section1Title: '1. სერვისის აღწერა',
    section1Content: 'EXPRO.GE გთავაზობთ ტვირთის გადაზიდვის, ევაკუატორის და ამწე ლიფტის სერვისებს თბილისსა და საქართველოს მასშტაბით.',
    section2Title: '2. ფასები და გადახდა',
    section2Content: 'ფასები მითითებულია ლარებში და შეიძლება შეიცვალოს წინასწარი შეტყობინების გარეშე. გადახდა ხდება ნაღდი ფულით ან საბანკო გადარიცხვით.',
    section3Title: '3. შეკვეთის გაუქმება',
    section3Content: 'შეკვეთის გაუქმება შესაძლებელია მძღოლის გამოგზავნამდე უფასოდ.',
    section4Title: '4. პასუხისმგებლობა',
    section4Content: 'ჩვენ ვაგებთ პასუხს ტვირთის დაზიანებაზე ტრანსპორტირების დროს, გარდა იმ შემთხვევებისა, როდესაც დაზიანება გამოწვეულია არასწორი შეფუთვით.',
    section5Title: '5. კონტაქტი',
    section5Content: 'კითხვებისთვის დაგვიკავშირდით: +995 555 23 33 44',
  },

  // Error messages
  errors: {
    orderFailed: 'შეკვეთის გაგზავნა ვერ მოხერხდა.',
    tryAgain: 'გთხოვთ სცადოთ თავიდან.',
  },
};
