import { Translations } from './types';

export const en: Translations = {
  // Header
  header: {
    stepTitles: {
      service: 'Service',
      type: 'Type',
      questionnaire: 'Questions',
      address: 'Address',
      time: 'Time',
      confirmation: 'Confirm',
      complete: 'Complete',
    },
  },

  // Service Selector
  serviceSelector: {
    title: 'Choose a Service',
    subtitle: 'What type of service do you need?',
    cargo: {
      title: 'Cargo Transportation',
      description: 'Transport cargo of various sizes',
    },
    evacuator: {
      title: 'Tow Truck',
      description: 'Vehicle transportation',
    },
    crane: {
      title: 'Crane Lift',
      description: 'Lift items to/from floors',
    },
  },

  // Cargo SubType Selector
  subTypeSelector: {
    title: 'Select Cargo Size',
    subtitle: 'Choose the size of your cargo',
    dimensions: 'Dimensions',
    weight: 'Weight',
    sizes: {
      S: { title: 'S', dimensions: '1.5 m × 1.2 m × 1 m', weight: 'Up to 500 kg' },
      M: { title: 'M', dimensions: '2.5 m × 1.5 m × 1.5 m', weight: 'Up to 1000 kg' },
      L: { title: 'L', dimensions: '3 m × 1.8 m × 1.8 m', weight: 'Up to 1500 kg' },
      XL: { title: 'XL', dimensions: '4 m × 2 m × 2 m', weight: 'Up to 3000 kg' },
      CONSTRUCTION: { title: 'Construction', dimensions: '5 m × 2.2 m × 2.2 m', weight: 'Up to 5000 kg' },
    },
  },

  // Evacuator Type Selector
  evacuatorTypeSelector: {
    title: 'Select Vehicle Type',
    subtitle: 'What type of vehicle are you transporting?',
    types: {
      SEDAN: { title: 'Sedan', description: 'Sedan, hatchback, coupe' },
      SUV: { title: 'SUV', description: 'High clearance, pickup' },
      MINIBUS: { title: 'Minibus', description: 'Sprinter, Transit' },
      CONSTRUCTION: { title: 'Construction', description: 'Bobcat, Forklift' },
      MOTO: { title: 'Motorcycle', description: 'Scooter, quad bike' },
      SPORTS: { title: 'Sports Car', description: 'Lowered suspension' },
    },
  },

  // Evacuator Questionnaire
  evacuatorQuestionnaire: {
    title: 'Additional Information',
    wheelLocked: 'Are the wheels locked?',
    steeringLocked: 'Is the steering locked?',
    goesNeutral: 'Can it go into neutral?',
    yes: 'Yes',
    no: 'No',
    continue: 'Continue',
  },

  // Crane Lift Selector
  craneLiftSelector: {
    title: 'Crane Lift Settings',
    floorTitle: 'Select Floor',
    floorSubtitle: 'Which floor do you need to lift to/from?',
    cargoTitle: 'Select Cargo Type',
    cargoSubtitle: 'What type of cargo are you lifting?',
    durationTitle: 'Select Duration',
    durationSubtitle: 'How long do you need the service?',
    floors: {
      FLOOR_1_7: 'Floors 1 - 7',
      FLOOR_8_11: 'Floors 8 - 11',
      FLOOR_12_20: 'Floors 12 - 20',
    },
    cargoTypes: {
      FURNITURE: 'Furniture and personal items',
      CONSTRUCTION: 'Construction Materials',
      FRAGILE: 'Fragile Cargo (Glass, Stained Glass)',
    },
    durations: {
      ONE_TIME: 'One-time',
      HOURLY: 'Hourly',
      FULL_DAY: 'Full day',
    },
    floorSurcharge: 'Additional',
  },

  // Location Picker
  locationPicker: {
    title: 'Addresses',
    pickupLabel: 'Pickup Location',
    dropoffLabel: 'Dropoff Location',
    pickupPlaceholder: 'Enter address...',
    dropoffPlaceholder: 'Enter address...',
    addressLabel: 'Address',
    addressPlaceholder: 'Enter address...',
    distance: 'Distance',
    km: 'km',
    search: 'Search',
    selectOnMap: 'Select on map',
    clickToSelectPickup: 'Click on the map to select pickup location',
    clickToSelectDropoff: 'Click on the map to select dropoff location',
    clickToSelect: 'Click on the map to select address',
    addressNotFound: 'Address not found',
    enterAddress: 'Please enter an address',
  },

  // Date Time Picker
  dateTimePicker: {
    title: 'When do you need it?',
    now: 'Now',
    schedule: 'Schedule',
    date: 'Date',
    time: 'Time',
    scheduledTime: 'Scheduled time:',
  },

  // Order Form
  orderForm: {
    phoneLabel: 'Phone Number',
    phonePlaceholder: '+995 5XX XXX XXX',
    phoneError: 'Please enter a valid phone number (+995XXXXXXXXX or 5XXXXXXXX)',
    phoneErrorShort: 'Please enter a valid phone number',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Bank Transfer',
    totalPrice: 'Total price:',
    currency: '₾',
    submit: 'Submit Order',
    submitting: 'Submitting...',
  },

  // Order Confirmation
  orderConfirmation: {
    title: 'Order Received!',
    subtitle: 'We will contact you shortly',
    orderDetails: 'Order Details',
    service: 'Service',
    address: 'Address',
    pickup: 'Pickup Location',
    dropoff: 'Dropoff Location',
    vehicle: 'Vehicle',
    evacuator: 'Tow Truck',
    floor: 'Floor',
    cargoType: 'Cargo Type',
    duration: 'Duration',
    distance: 'Distance',
    scheduledTime: 'Scheduled Time',
    price: 'Price',
    payment: 'Payment',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Bank Transfer',
    bankTransferReminder: 'Please transfer the amount before order completion',
    tbcBank: 'TBC Bank',
    bogBank: 'Bank of Georgia',
    iban: 'IBAN:',
    recipient: 'Recipient:',
    copyIban: 'Copy',
    copied: 'Copied!',
    whatsapp: 'WhatsApp',
    call: 'Call',
    newOrder: 'New Order',
    // Service types
    cargoService: 'Cargo Transportation',
    evacuatorService: 'Tow Truck',
    craneService: 'Crane Lift',
    // Sub types
    sizeS: 'S - Small',
    sizeM: 'M - Medium',
    sizeL: 'L - Large',
    sizeXL: 'XL - Extra Large',
    sizeConstruction: 'Construction',
  },

  // Order Summary
  orderSummary: {
    title: 'Order Details',
    service: 'Service',
    cargo: 'Cargo',
    crane: 'Crane Lift',
    evacuator: 'Tow Truck',
    vehicle: 'Vehicle',
    evacuatorType: 'Tow Truck Type',
    floor: 'Floor',
    cargoType: 'Cargo Type',
    duration: 'Duration',
    distance: 'Distance',
    time: 'Time',
  },

  // Service Vehicle Labels
  serviceVehicleLabels: {
    STANDARD: 'Standard (with winch)',
    SPIDER: 'Spider (hydraulic lift)',
    LOWBOY: 'Heavy Platform (Lowboy)',
    HEAVY_MANIPULATOR: 'Heavy Manipulator / Tow',
    LONG_BED: 'Long Bed',
    MOTO_CARRIER: 'Small Evacuator / Moto Carrier',
  },

  // Navigation
  navigation: {
    back: 'Back',
    home: 'Start Over',
    continue: 'Continue',
    mainPage: 'Home',
  },

  // Cookie Banner
  cookieBanner: {
    message: 'This website uses Cookie files',
    accept: 'OK',
  },

  // Footer
  footer: {
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
  },

  // Contact Page
  contactPage: {
    title: 'Contact',
    phone: 'Phone',
    email: 'Email',
    whatsapp: 'WhatsApp',
    available: '24/7',
  },

  // About Page
  aboutPage: {
    title: 'About Us',
    description: 'EXPRO.GE is a cargo transportation, tow truck, and crane lift service platform operating in Georgia.',
    services: 'Our Services',
    cargoService: 'Cargo Transportation - vehicles of various sizes',
    evacuatorService: 'Tow Truck - for any type of vehicle',
    craneService: 'Crane Lift - lifting items to/from floors',
    whyUs: 'Why Choose Us?',
    fast: 'Fast',
    fastDesc: 'Quick response and service',
    reliable: 'Reliable',
    reliableDesc: 'Experienced drivers and modern equipment',
    affordable: 'Affordable',
    affordableDesc: 'Competitive prices and transparent terms',
  },

  // Privacy Page
  privacyPage: {
    title: 'Privacy Policy',
    intro: 'This privacy policy describes how we collect and use your personal data.',
    section1Title: '1. Information Collected',
    section1Content: 'We collect information that you provide when placing an order: phone number, addresses, and order details.',
    section2Title: '2. Use of Information',
    section2Content: 'Your information is used only for order fulfillment and contacting you.',
    section3Title: '3. Data Protection',
    section3Content: 'We use industry-standard security measures to protect your data.',
    section4Title: '4. Contact',
    section4Content: 'For privacy-related questions, contact us at: exprogeo@gmail.com',
  },

  // Terms Page
  termsPage: {
    title: 'Terms of Service',
    intro: 'By using EXPRO.GE services, you agree to the following terms:',
    section1Title: '1. Service Description',
    section1Content: 'EXPRO.GE offers cargo transportation, tow truck, and crane lift services in Tbilisi and throughout Georgia.',
    section2Title: '2. Prices and Payment',
    section2Content: 'Prices are listed in Georgian Lari and may change without prior notice. Payment is made in cash or by bank transfer.',
    section3Title: '3. Order Cancellation',
    section3Content: 'Orders can be cancelled free of charge before the driver is dispatched.',
    section4Title: '4. Liability',
    section4Content: 'We are responsible for cargo damage during transportation, except in cases where damage is caused by improper packaging.',
    section5Title: '5. Contact',
    section5Content: 'For questions, contact us at: +995 555 23 33 44',
  },

  // Error messages
  errors: {
    orderFailed: 'Failed to submit order.',
    tryAgain: 'Please try again.',
  },
};
