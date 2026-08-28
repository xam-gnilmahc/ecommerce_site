# UOM — E-Commerce Platform

A full-stack e-commerce web application built with **React**, **Supabase**, and **Stripe/Google Pay** integration. Features a modern UI with product browsing, cart management, order tracking, and real-time notifications.

---

## Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Frontend   | React 19, React Router v6, Redux Toolkit |
| Styling    | Bootstrap 5, MUI, Custom CSS             |
| Backend    | Supabase (Auth, Database, Storage, RPC)  |
| Payments   | Stripe, Google Pay                       |
| Animations | Framer Motion, Lottie                    |
| Real-time  | Pusher (live notifications)              |
| Carousels  | Swiper.js                                |
| Data Fetch | TanStack Query (React Query)             |
| Forms      | country-state-city                       |
| Loading    | react-loading-skeleton                   |
| Notifications | react-hot-toast                       |

---

## Project Structure

```
src/
├── components/
│   ├── cart/                    # Cart-related assets (logos, payment icons)
│   ├── common/
│   │   ├── DemoBanner.jsx           # Demo mode banner
│   │   ├── NotificationTicker.jsx   # Live notification marquee
│   │   ├── OAuthErrorCatcher.jsx    # OAuth error boundary
│   │   ├── ProtectedRoute.jsx       # Auth guard component
│   │   ├── ScrollToTop.jsx          # Scroll reset on navigation
│   │   └── ...
│   ├── layout/
│   │   └── layouts/
│   │       ├── AuthLayout.jsx       # Protected route wrapper
│   │       └── GuestLayout.jsx      # Public route wrapper
│   ├── product/
│   │   ├── AdditionalInfo.jsx       # Product tabs (description, reviews)
│   │   ├── BestSelling/             # Best selling + recently visited carousel
│   │   ├── CollectionBox/           # Collection/category grid
│   │   ├── Filter.jsx               # Product filter sidebar
│   │   ├── GooglePlay.tsx           # Google Pay button config
│   │   ├── ProductImageGallery.jsx  # Flipkart-style image gallery + zoom
│   │   ├── ProductQuickView.jsx     # Quick view modal
│   │   ├── Productss.jsx            # Product listing grid
│   │   ├── RelatedProducts.jsx      # Related products carousel
│   │   └── SortBar.jsx              # Product sort dropdown
│   └── ui/
│       ├── Footer.jsx               # Site footer
│       ├── Navbar.jsx               # Top navigation bar
│       ├── Pagination.js            # Reusable pagination
│       └── Sidebar.jsx              # Account sidebar
│
├── config/
│   ├── GooglePay.tsx                # Google Pay payment config
│   ├── ShippingOptions.ts           # Shipping method definitions
│   └── env.js                       # Environment constants
│
├── context/
│   ├── authContext.js               # Auth state, Pusher, visitor tracking, background jobs
│   └── PageHeaderContext.tsx        # Dynamic page header state
│
├── hooks/
│   └── useVisitorCookie.ts          # Anonymous visitor tracking cookie
│
├── pages/
│   ├── auth/                        # Login, Register, Forgot Password, Update Password
│   ├── cart/                        # Shopping cart
│   ├── checkout/                    # Checkout + payment (Stripe + Google Pay)
│   ├── home/                        # Homepage (Hero, Best Selling, Collections, Recently Visited)
│   ├── orders/                      # Order list + detail panel + receipt + print invoice
│   ├── payments/                    # Payment history
│   ├── product/                     # Product detail page (gallery, sizes, colors, reviews, buy now)
│   ├── products/                    # Product listing/catalog with filters & search
│   ├── profile/                     # Settings, profile, notifications, address book
│   ├── raffle/                      # Raffle/lottery page
│   └── static/                      # About, Contact, Terms, 404
│
├── services/
│   ├── emailService.js              # Email sending via Supabase
│   ├── googlePayService.ts          # Google Pay processing
│   ├── populateUserRecommendations.ts # Personalized recommendation engine
│   └── recalcUserInterest.ts        # User interest scoring (RPC)
│
├── styles/
│   └── theme.css                    # Global CSS variables + tokens
│
├── tanstack/
│   ├── cart.ts                      # Cart queries & mutations
│   ├── orders.ts                    # Order queries & mutations
│   ├── products.ts                  # Product queries (search, filter, best selling, recent)
│   ├── recommendations.ts           # Personalized recommendations
│   ├── search.ts                    # Search queries
│   ├── tracking.ts                  # Analytics events (view, add-to-cart, purchase)
│   ├── filters.ts                   # Filter queries
│   └── notifications.ts             # Notification queries
│
├── types/
│   └── products.ts                  # TypeScript product interfaces
│
├── utils/
│   ├── supabaseStorage.js           # Storage URL helpers
│   └── tracking.js                  # Analytics event helpers
│
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
- **Product reviews** with user avatars and ratings
- **Related products** carousel based on matching brand/category
- **Quick view** modal for fast preview
- **Sorting** by price, rating, newest, popularity

### Shopping & Checkout

- **Cart** with quantity management and persistent state (TanStack Query)
- **Checkout** with Stripe Card Element and Google Pay integration
- **Saved addresses** with default selection and "add new address" form
- **Country/State dropdowns** via `country-state-city` library
- **Shipping options**: Free (7–20 days) vs Express (1–3 days, $3)
- **Payment overlay** with spinner during processing (prevents double-submit)
- **Buy now with Google Pay** directly on product page
- **Real-time stock validation** before payment

### Inventory & Stock

- **Live inventory checks** from Supabase `inventory` table
- **Stock badges**: In Stock, Low Stock (≤10), Out of Stock, Checking…
- **Brand-aware size defaults** — shoe brands (Nike, Adidas, etc.) show numeric sizes (6–11), others show XS–XL
- **Color swatch selection** with tooltips

### Orders

- **Order list** with toggle between active and cancelled orders
- **Status filters**: All, Pending, Confirmed, Shipped Out, Out for Delivery, Delivered, Cancelled
- **Slide-in detail panel** with tracking timeline, shipping address, and payment info
- **Print invoice** support with print-optimized CSS
- **Tracking numbers** with carrier integration ready

### User Account

- **Settings page** with profile card, notification preferences, address book, and payment methods
- **Real-time notifications** via Pusher with unread count and notification ticker
- **Wishlist** (heart icon) and recently visited product tracking (visitor cookie)
- **Address management** with default address logic
- **Automatic address redirect** — new users sent to `/add-address` on login

### Personalization & Intelligence

- **Visitor tracking** — anonymous cookie tracks recently viewed products
- **User interest scoring** — `recalc_user_interest` RPC runs every 30s per user
- **Personalized recommendations** — `populateUserRecommendations` runs every 60s per user
- **Analytics tracking** — product preview, add-to-cart, purchase events via TanStack Query

### UI/UX

- Modern black/white/gray design system with consistent typography (`DM Sans` + `Barlow`)
- Responsive layout (mobile, tablet, desktop)
- Skeleton loading states throughout
- Toast notifications (`react-hot-toast`)
- Framer Motion animations (hero, collection boxes, transitions)
- Lottie animations for empty states
- Swiper.js carousels with autoplay & navigation
- Print-optimized invoice styles

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Format code
npm run format
```

---

## Environment Variables

Create a `.env` file with:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key
REACT_APP_GOOGLE_PAY_MERCHANT_ID=your_merchant_id
REACT_APP_PUSHER_KEY=your_pusher_key
REACT_APP_PUSHER_CLUSTER=your_pusher_cluster
```

---

## Available Scripts

| Command         | Description                   |
| --------------- | ----------------------------- |
| `npm start`     | Start dev server on port 3000 |
| `npm run build` | Production build              |
| `npm test`      | Run test suite                |
| `npm run format`| Format with Prettier          |

---

## Supabase Database Schema (Key Tables)

- **products** — product catalog with banner, description, brand, category, rating
- **product_items** — size/color/SKU variants per product
- **product_images** — gallery images with primary flag
- **product_reviews** — user reviews with ratings
- **inventory** — stock_quantity per product_id
- **users** — extended profile (name, avatar, created_at)
- **shipping_addresses** — user addresses with is_default flag
- **cart_items** — user cart with quantity
- **orders** — order header (total, status, tracking_number, shipping_method)
- **order_items** — line items per order
- **user_interest** — computed interest scores per user/category
- **user_recommendations** — personalized product recommendations
- **notifications** — real-time notifications per user
- **visitor_tracking** — anonymous cookie product_ids

---

## Background Jobs (via AuthContext)

| Job | Interval | Description |
|-----|----------|-------------|
| `recalcUserInterest` | 30 seconds | Recalculates user interest scores via Postgres RPC |
| `populateUserRecommendations` | 60 seconds | Generates personalized product recommendations |

---

## Deployment Notes

- **Supabase**: Enable RLS policies on all tables
- **Stripe**: Configure webhook endpoint for payment confirmation
- **Google Pay**: Register merchant ID, configure allowed domains
- **Pusher**: Create channels for `user.{userId}` private channels
- **Environment**: Set all `REACT_APP_*` vars in hosting platform