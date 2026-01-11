# EXPRO.GE Project Summary

> Georgian cargo, evacuator, and crane lift booking platform
> Last updated: January 2026

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Services Offered](#services-offered)
4. [Project Structure](#project-structure)
5. [Components](#components)
6. [Pages & Routing](#pages--routing)
7. [API Routes](#api-routes)
8. [Database Structure (Firestore)](#database-structure-firestore)
9. [Pricing Logic](#pricing-logic)
10. [Environment Variables](#environment-variables)
11. [Contact Information](#contact-information)
12. [Completed Features](#completed-features)
13. [Pending / Potential Improvements](#pending--potential-improvements)

---

## Project Overview

EXPRO.GE is a Georgian-language service booking platform for:
- **Cargo transportation** (different truck sizes)
- **Evacuator services** (tow trucks for vehicles)
- **Crane lift services** (furniture/construction material lifting to floors)

The platform allows customers to:
1. Select a service type
2. Choose service specifications (size/vehicle type/floor)
3. Set pickup and dropoff locations (with Google Maps integration)
4. Schedule or request immediate service
5. Choose payment method (cash or bank transfer)
6. Submit order (saved to Firebase, notification sent via Telegram)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14.2.35 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4.1 |
| Database | Firebase/Firestore |
| Maps | Google Maps API (@react-google-maps/api) |
| Icons | Lucide React |
| Date Handling | date-fns |
| Notifications | Telegram Bot API |
| Font | Noto Sans Georgian |

---

## Services Offered

### 1. Cargo Transportation (ტვირთის გადაზიდვა)
Different truck sizes based on cargo dimensions and weight:

| Size | Dimensions | Max Weight | Base Price |
|------|------------|------------|------------|
| S | 1.5m x 1.2m x 1m | 500 kg | 35₾ |
| M | 2.5m x 1.5m x 1.5m | 1000 kg | 50₾ |
| L | 3m x 1.8m x 1.8m | 1500 kg | 60₾ |
| XL | 4m x 2m x 2m | 3000 kg | 120₾ |
| Construction | 5m x 2.2m x 2.2m | 5000 kg | 120₾ |

### 2. Evacuator (ევაკუატორი)
Vehicle transportation with smart questionnaire to determine needed service:

**Customer Vehicle Types:**
- SEDAN (მსუბუქი) - Sedan, hatchback, coupe
- SUV (ჯიპი) - High clearance, pickup
- MINIBUS (მიკროავტობუსი) - Sprinter, Transit
- CONSTRUCTION (სპეცტექნიკა) - Bobcat, Forklift
- MOTO (მოტოციკლი) - Scooter, quad bike
- SPORTS (სპორტული) - Lowered suspension

**Service Vehicle Types (what evacuator is dispatched):**
| Type | Description | Base Price |
|------|-------------|------------|
| STANDARD | With winch | 80₾ |
| SPIDER | Hydraulic lift | 130₾ |
| LOWBOY | Heavy platform | 350₾ |
| HEAVY_MANIPULATOR | Heavy manipulator/tow | 200₾ |
| LONG_BED | Long bed | 100₾ |
| MOTO_CARRIER | Small with moto mounts | 60₾ |

**Questionnaire Logic:**
For SEDAN and SUV types, the system asks:
1. Are wheels locked?
2. Is steering locked?
3. Can it go into neutral?

Based on answers, it determines if STANDARD or SPIDER evacuator is needed.

### 3. Crane Lift (ამწე ლიფტი)
External crane for lifting items to/from building floors:

**Floor Options:**
| Floor Range | Surcharge |
|-------------|-----------|
| 1-7 floors | 0₾ |
| 8-11 floors | +50₾ |
| 12-20 floors | +100₾ |

**Cargo Types:**
- FURNITURE - Furniture and personal items
- CONSTRUCTION - Construction materials/debris
- FRAGILE - Fragile items (glass/stained glass)

**Duration Types:**
| Type | Customer Price | Driver Price |
|------|----------------|--------------|
| ONE_TIME (ერთჯერადი) | 100₾ | 80₾ |
| HOURLY (საათობრივი) | 150₾ | 120₾ |
| FULL_DAY (მთლიანი დღე) | 500₾ | 400₾ |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main booking page (home)
│   ├── layout.tsx            # Root layout with Georgian font
│   ├── globals.css           # Global styles
│   ├── about/page.tsx        # About page
│   ├── contact/page.tsx      # Contact info page
│   ├── privacy/page.tsx      # Privacy policy
│   ├── terms/page.tsx        # Terms of service
│   ├── api/
│   │   └── telegram/
│   │       ├── route.ts      # Telegram notification API
│   │       └── test/route.ts # Telegram test endpoint
│   └── admin/
│       ├── layout.tsx        # Admin layout with auth check
│       ├── page.tsx          # Admin dashboard
│       ├── login/page.tsx    # Admin login
│       ├── orders/
│       │   ├── page.tsx      # Orders list
│       │   └── [id]/page.tsx # Order details
│       ├── drivers/page.tsx  # Drivers management
│       └── pricing/page.tsx  # Pricing management
├── components/
│   ├── ServiceSelector.tsx       # Service type selection (cargo/evacuator/crane)
│   ├── SubTypeSelector.tsx       # Cargo size selection
│   ├── EvacuatorTypeSelector.tsx # Vehicle type for evacuator
│   ├── EvacuatorQuestionnaire.tsx # Smart questions to determine evacuator type
│   ├── CraneLiftSelector.tsx     # Multi-step crane configuration
│   ├── LocationPicker.tsx        # Dual pickup/dropoff with Google Maps
│   ├── SingleLocationPicker.tsx  # Single location (for crane)
│   ├── DateTimePicker.tsx        # Schedule date/time selection
│   ├── OrderForm.tsx             # Phone, payment, price display, submit
│   ├── OrderConfirmation.tsx     # Success screen with bank details
│   ├── PaymentMethod.tsx         # Payment method selector
│   ├── GoogleMapsProvider.tsx    # Google Maps API context
│   └── CookieBanner.tsx          # Cookie consent banner
├── hooks/
│   └── usePricing.ts         # Real-time pricing from Firestore
└── lib/
    ├── types.ts              # TypeScript interfaces & enums
    ├── constants.ts          # Default pricing constants
    ├── firebase.ts           # Firebase/Firestore initialization
    ├── pricing.ts            # Static pricing calculation
    └── utils.ts              # Utility functions
```

---

## Components

### ServiceSelector
Three large cards for selecting service type:
- Blue gradient: Cargo
- Orange gradient: Evacuator
- Green gradient: Crane Lift

### SubTypeSelector (Cargo)
Grid of 5 size options (S, M, L, XL, Construction) showing dimensions and weight capacity.

### EvacuatorTypeSelector
Grid of 6 vehicle types (Sedan, SUV, Minibus, Construction, Moto, Sports).

### EvacuatorQuestionnaire
Smart questionnaire for SEDAN/SUV vehicles:
- Determines if wheels/steering are locked
- Determines if vehicle can go into neutral
- Outputs required service vehicle type (STANDARD vs SPIDER)

### CraneLiftSelector
3-step multi-part selector:
1. Floor selection (1-7, 8-11, 12-20)
2. Cargo type (furniture, construction, fragile)
3. Duration (one-time, hourly, full-day)

### LocationPicker
- Google Places Autocomplete for addresses
- Geocoding to get coordinates
- Directions API for route distance calculation
- Displays pickup (green) and dropoff (red) markers

### SingleLocationPicker
Simplified version for crane service (only needs one address).

### OrderForm
- Georgian phone number input (+995)
- Payment method toggle (Cash/Card)
- Price display
- Submit button

### OrderConfirmation
Success screen showing:
- Order details summary
- Bank transfer information (if card selected):
  - TBC Bank: GE10TB7248945061100092
  - BOG Bank: GE83BG0000000160844522
  - Recipient: EXPRO LLC

---

## Pages & Routing

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Main booking flow (multi-step wizard) |
| `/about` | About the company |
| `/contact` | Contact information |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### Admin Panel
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with stats (pending, in-progress, completed orders) |
| `/admin/login` | Password authentication |
| `/admin/orders` | Orders list with filters and search |
| `/admin/orders/[id]` | Individual order details with status management |
| `/admin/drivers` | Drivers management (not fully implemented) |
| `/admin/pricing` | Dynamic pricing configuration |

### Admin Authentication
- Simple password-based auth
- Password stored in `NEXT_PUBLIC_ADMIN_PASSWORD` env variable
- Auth state stored in localStorage (`admin_authenticated`)

---

## API Routes

### POST /api/telegram
Sends order notifications to Telegram:
- Formats message based on service type (cargo/evacuator vs crane)
- Includes Google Maps links for locations
- Displays price and customer phone

### GET /api/telegram/test
Test endpoint to verify Telegram integration is working.

---

## Database Structure (Firestore)

### Collection: `orders`
```typescript
{
  id: string;
  serviceType: 'cargo' | 'evacuator' | 'crane';
  subType: string;  // Size/vehicle type/duration
  pickup: { address: string; lat: number; lng: number; };
  dropoff?: { address: string; lat: number; lng: number; };  // Not for crane
  distance?: number;  // Not for crane
  customerPrice: number;
  driverPrice: number;
  phone: string;
  paymentMethod: 'cash' | 'card';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime?: Timestamp;
  createdAt: Timestamp;

  // Evacuator-specific
  customerVehicleType?: string;
  serviceVehicleType?: string;
  evacuatorAnswers?: { wheelLocked?: boolean; steeringLocked?: boolean; goesNeutral?: boolean; };

  // Crane-specific
  craneFloor?: string;
  craneCargoType?: string;
  craneDuration?: string;
}
```

### Collection: `settings`
Document: `pricing`
```typescript
{
  tbilisiFixedZoneKm: number;  // Default: 35
  cargo: Record<string, { customerPrice, driverPrice, perKm, perKmProfit }>;
  evacuator: Record<string, { customerPrice, driverPrice, perKm, perKmProfit }>;
  serviceVehicle: Record<string, { customerPrice, driverPrice, perKm, perKmProfit }>;
  crane: Record<string, { customerPrice, driverPrice }>;
}
```

### Collection: `drivers` (planned)
```typescript
{
  id: string;
  name: string;
  phone: string;
  serviceVehicleType: string;
  baseLocation: string;
  workingDays: string[];
  workingHours: { start: string; end: string; };
  createdAt: Date;
}
```

---

## Pricing Logic

### Base Zone
- **Tbilisi Fixed Zone:** 35 km (configurable in Firestore)
- Within this zone: flat base price
- Outside zone: base price + per-km charge

### Calculation Formula
```
if (distance <= tbilisiFixedZoneKm) {
  customerPrice = baseCustomerPrice
  driverPrice = baseDriverPrice
} else {
  extraKm = distance - tbilisiFixedZoneKm
  extraCustomerCharge = extraKm * perKm
  extraProfit = extraKm * perKmProfit
  extraDriverCharge = extraCustomerCharge - extraProfit

  customerPrice = baseCustomerPrice + extraCustomerCharge
  driverPrice = baseDriverPrice + extraDriverCharge
}

profit = customerPrice - driverPrice
```

### Crane Pricing
- No per-km charges
- Base price + floor surcharge
- Driver gets 70% of floor surcharge

### Real-time Updates
- `usePricing` hook listens to Firestore `settings/pricing` document
- Admin can update prices in `/admin/pricing`
- Changes reflect immediately across the site

---

## Environment Variables

Required in `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Telegram Bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Admin Panel
NEXT_PUBLIC_ADMIN_PASSWORD=
```

---

## Contact Information

- **Phone:** +995 555 23 33 44
- **Email:** exprogeo@gmail.com
- **WhatsApp:** +995 555 23 33 44
- **Availability:** 24/7

### Bank Details (for card payments)
- **TBC Bank:** GE10TB7248945061100092
- **BOG Bank:** GE83BG0000000160844522
- **Recipient:** EXPRO LLC

---

## Completed Features

- [x] Main booking flow (7 steps)
- [x] Three service types (cargo, evacuator, crane)
- [x] Google Maps integration (Places, Geocoding, Directions)
- [x] Dynamic pricing with Firestore sync
- [x] Telegram order notifications
- [x] Cookie consent banner
- [x] Admin panel with authentication
- [x] Order management (list, details, status updates)
- [x] Admin pricing configuration
- [x] Responsive design (mobile-friendly)
- [x] Georgian language throughout
- [x] Payment method selection (cash/card)
- [x] Scheduled orders with date/time picker
- [x] Smart evacuator questionnaire
- [x] Privacy policy and terms pages
- [x] Contact page

---

## Pending / Potential Improvements

1. **Drivers Management**
   - Admin drivers page exists but may need full CRUD implementation
   - Auto-assignment of orders to drivers based on location/availability

2. **User Accounts**
   - Customer registration/login
   - Order history for returning customers

3. **Payment Integration**
   - Online payment gateway (Georgian banks)
   - Payment status tracking

4. **SMS Notifications**
   - Notify customers via SMS when order status changes

5. **Real-time Order Tracking**
   - Live driver location on map
   - ETA calculations

6. **Analytics Dashboard**
   - Revenue reports
   - Popular routes
   - Peak hours analysis

7. **Multi-language Support**
   - English translation option

8. **Rating System**
   - Customer feedback after service completion
   - Driver ratings

---

## Notes for Development Continuation

1. **Firebase Rules:** Ensure Firestore security rules are properly configured for production.

2. **API Keys:** Google Maps API key should be restricted to specific domains in production.

3. **Admin Security:** Consider implementing more robust authentication (Firebase Auth) instead of simple password.

4. **Error Handling:** Add more comprehensive error handling and user feedback throughout the app.

5. **Testing:** No test files currently exist - consider adding unit and integration tests.

6. **SEO:** Metadata is configured but could be expanded with structured data.

---

*This document provides a comprehensive overview of the EXPRO.GE project for development continuation.*
