# UOM — E-Commerce Platform

A full-stack e-commerce web application built with **React**, **Supabase**, and **Stripe/Google Pay** integration. Features a modern UI with product browsing, cart management, order tracking, and real-time notifications.

---

## Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Frontend   | React 19, React Router v6, Redux Toolkit |
| Styling    | Bootstrap 5, MUI, Custom CSS             |
| Backend    | Supabase (Auth, Database, Storage)       |
| Payments   | Stripe, Google Pay                       |
| Animations | Framer Motion, Lottie                    |
| Real-time  | Pusher (live notifications)              |
| Carousels  | Swiper.js                                |

---

## Project Structure

```
src/
├── components/
│   ├── cart/                    # Cart-related assets (logos, payment icons)
│   ├── layout/
│   │   └── layouts/
│   │       ├── AuthLayout.jsx       # Protected route wrapper
│   │       └── GuestLayout.jsx      # Public route wrapper
│   ├── product/
│   │   ├── AdditionalInfo.jsx       # Product tabs (description, reviews)
│   │   ├── BestSelling/             # Best selling + recently visited carousel
│   │   ├── collectionBox/           # Collection/category grid
│   │   ├── Filter.jsx               # Product filter sidebar
│   │   ├── GooglePlay.jsx           # Google Pay button config
│   │   ├── ProductImageGallery.jsx  # Flipkart-style image gallery + zoom
│   │   ├── Productss.jsx            # Product listing grid
│   │   └── RelatedProducts.jsx      # Related products carousel
│   └── ui/
│       ├── Footer.jsx               # Site footer
│       ├── main.jsx                 # Hero section / homepage main
│       ├── Navbar.jsx               # Top navigation bar
│       ├── Pagination.js            # Reusable pagination
│       ├── ProtectedRoute.jsx       # Auth guard component
│       ├── ScrollToTop.jsx          # Scroll reset on navigation
│       └── Sidebar.jsx              # Account sidebar
│
├── config/
│   ├── GooglePay.jsx                # Google Pay payment config
│   └── ShippingOptions.jsx          # Shipping method definitions
│
├── context/
│   ├── authContext.js                # Auth state, order placement, tracking
│   └── PageHeaderContext.tsx         # Dynamic page header state
│
├── pages/
│   ├── auth/                        # Login, Register, Forgot Password
│   ├── cancelled/                   # Cancelled orders page
│   ├── cart/                        # Shopping cart
│   ├── checkout/                    # Checkout + payment
│   ├── home/                        # Homepage
│   ├── orders/                      # Order list + detail panel + receipt
│   ├── payments/                    # Payment history
│   ├── popup/                       # Promotional popup
│   ├── product/                     # Product detail page
│   ├── products/                    # Product listing/catalog
│   ├── profile/                     # Settings, profile, notifications
│   ├── raffle/                      # Raffle/lottery page
│   └── static/                      # About, Contact, Terms, 404
│
├── redux/
│   ├── index.ts                     # Store configuration
│   └── slice/
│       ├── Product.ts               # Products fetch + pagination
│       ├── filterProduct.ts         # Filtered products
│       ├── searchProduct.ts         # Search results
│       ├── userCart.ts              # Cart state + operations
│       ├── userRecommendation.ts    # Personalized recommendations
│       └── trackingSlice.ts         # Analytics tracking
│
├── service/
│   ├── emailService.js              # Email sending via Supabase
│   ├── googlePayService.js          # Google Pay processing
│   ├── populateUserRecommendations.js
│   └── recalcUserInterest.js        # User interest scoring
│
├── styles/
│   └── theme.css                    # Global CSS variables + tokens
│
├── types/
│   └── products.ts                  # TypeScript product interfaces
│
├── utils/
│   └── tracking.js                  # Analytics event helpers
│
├── Hook/                            # Custom React hooks
├── RoutesComponent.tsx              # All route definitions
├── supaBaseClient.js                # Supabase client init
├── index.js                         # App entry point
└── index.css                        # Global typography + reset
```

---

## Key Features

### Product Browsing

- **Product catalog** with filtering by brand, category, and price range
- **Search** with real-time results across name, brand, type, and category
- **Product detail page** with Flipkart-style vertical thumbnail gallery and hover-to-zoom
- **Related products** carousel based on matching brand/category

### Shopping & Checkout

- **Cart** with quantity management and persistent state
- **Checkout** with Stripe and Google Pay integration
- **Shipping options** with multiple delivery methods

### Orders

- **Order list** with toggle between active and cancelled orders
- **Slide-in detail panel** with tracking timeline, shipping address, and payment info
- **Print invoice** support with print-optimized CSS

### User Account

- **Settings page** with profile card, notification preferences, address book, and payment methods
- **Real-time notifications** via Pusher with unread count
- **Wishlist** and recently visited product tracking

### UI/UX

- Modern black/white/gray design system with consistent typography (`DM Sans` + `Barlow`)
- Responsive layout (mobile, tablet, desktop)
- Skeleton loading states
- Toast notifications
- Framer Motion animations

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

---

## Environment Variables

Create a `.env` file with:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

---