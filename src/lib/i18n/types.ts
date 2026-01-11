export type Language = 'ka' | 'en' | 'ru';

export interface Translations {
  // Header
  header: {
    stepTitles: {
      service: string;
      type: string;
      questionnaire: string;
      address: string;
      time: string;
      confirmation: string;
      complete: string;
    };
  };

  // Service Selector
  serviceSelector: {
    title: string;
    subtitle: string;
    cargo: {
      title: string;
      description: string;
    };
    evacuator: {
      title: string;
      description: string;
    };
    crane: {
      title: string;
      description: string;
    };
  };

  // Cargo SubType Selector
  subTypeSelector: {
    title: string;
    subtitle: string;
    dimensions: string;
    weight: string;
    sizes: {
      S: { title: string; dimensions: string; weight: string };
      M: { title: string; dimensions: string; weight: string };
      L: { title: string; dimensions: string; weight: string };
      XL: { title: string; dimensions: string; weight: string };
      CONSTRUCTION: { title: string; dimensions: string; weight: string };
    };
  };

  // Evacuator Type Selector
  evacuatorTypeSelector: {
    title: string;
    subtitle: string;
    types: {
      SEDAN: { title: string; description: string };
      SUV: { title: string; description: string };
      MINIBUS: { title: string; description: string };
      CONSTRUCTION: { title: string; description: string };
      MOTO: { title: string; description: string };
      SPORTS: { title: string; description: string };
    };
  };

  // Evacuator Questionnaire
  evacuatorQuestionnaire: {
    title: string;
    wheelLocked: string;
    steeringLocked: string;
    goesNeutral: string;
    yes: string;
    no: string;
    continue: string;
  };

  // Crane Lift Selector
  craneLiftSelector: {
    title: string;
    floorTitle: string;
    floorSubtitle: string;
    cargoTitle: string;
    cargoSubtitle: string;
    durationTitle: string;
    durationSubtitle: string;
    floors: {
      FLOOR_1_7: string;
      FLOOR_8_11: string;
      FLOOR_12_20: string;
    };
    cargoTypes: {
      FURNITURE: string;
      CONSTRUCTION: string;
      FRAGILE: string;
    };
    durations: {
      ONE_TIME: string;
      HOURLY: string;
      FULL_DAY: string;
    };
    floorSurcharge: string;
  };

  // Location Picker
  locationPicker: {
    title: string;
    pickupLabel: string;
    dropoffLabel: string;
    pickupPlaceholder: string;
    dropoffPlaceholder: string;
    addressLabel: string;
    addressPlaceholder: string;
    distance: string;
    km: string;
    search: string;
    selectOnMap: string;
    clickToSelectPickup: string;
    clickToSelectDropoff: string;
    clickToSelect: string;
    addressNotFound: string;
    enterAddress: string;
  };

  // Date Time Picker
  dateTimePicker: {
    title: string;
    now: string;
    schedule: string;
    date: string;
    time: string;
    scheduledTime: string;
  };

  // Order Form
  orderForm: {
    phoneLabel: string;
    phonePlaceholder: string;
    phoneError: string;
    phoneErrorShort: string;
    paymentMethod: string;
    cash: string;
    card: string;
    totalPrice: string;
    currency: string;
    submit: string;
    submitting: string;
  };

  // Order Confirmation
  orderConfirmation: {
    title: string;
    subtitle: string;
    orderDetails: string;
    service: string;
    address: string;
    pickup: string;
    dropoff: string;
    vehicle: string;
    evacuator: string;
    floor: string;
    cargoType: string;
    duration: string;
    distance: string;
    scheduledTime: string;
    price: string;
    payment: string;
    paymentMethod: string;
    cash: string;
    card: string;
    bankTransferReminder: string;
    tbcBank: string;
    bogBank: string;
    iban: string;
    recipient: string;
    copyIban: string;
    copied: string;
    whatsapp: string;
    call: string;
    newOrder: string;
    // Service types
    cargoService: string;
    evacuatorService: string;
    craneService: string;
    // Sub types
    sizeS: string;
    sizeM: string;
    sizeL: string;
    sizeXL: string;
    sizeConstruction: string;
  };

  // Order Summary (in step 6)
  orderSummary: {
    title: string;
    service: string;
    cargo: string;
    crane: string;
    evacuator: string;
    vehicle: string;
    evacuatorType: string;
    floor: string;
    cargoType: string;
    duration: string;
    distance: string;
    time: string;
  };

  // Service Vehicle Labels
  serviceVehicleLabels: {
    STANDARD: string;
    SPIDER: string;
    LOWBOY: string;
    HEAVY_MANIPULATOR: string;
    LONG_BED: string;
    MOTO_CARRIER: string;
  };

  // Navigation
  navigation: {
    back: string;
    home: string;
    continue: string;
    mainPage: string;
  };

  // Cookie Banner
  cookieBanner: {
    message: string;
    accept: string;
  };

  // Footer
  footer: {
    privacy: string;
    terms: string;
    contact: string;
  };

  // Contact Page
  contactPage: {
    title: string;
    phone: string;
    email: string;
    whatsapp: string;
    available: string;
  };

  // About Page
  aboutPage: {
    title: string;
    description: string;
    services: string;
    cargoService: string;
    evacuatorService: string;
    craneService: string;
    whyUs: string;
    fast: string;
    fastDesc: string;
    reliable: string;
    reliableDesc: string;
    affordable: string;
    affordableDesc: string;
  };

  // Privacy Page
  privacyPage: {
    title: string;
    intro: string;
    section1Title: string;
    section1Content: string;
    section2Title: string;
    section2Content: string;
    section3Title: string;
    section3Content: string;
    section4Title: string;
    section4Content: string;
  };

  // Terms Page
  termsPage: {
    title: string;
    intro: string;
    section1Title: string;
    section1Content: string;
    section2Title: string;
    section2Content: string;
    section3Title: string;
    section3Content: string;
    section4Title: string;
    section4Content: string;
    section5Title: string;
    section5Content: string;
  };

  // Error messages
  errors: {
    orderFailed: string;
    tryAgain: string;
  };
}
