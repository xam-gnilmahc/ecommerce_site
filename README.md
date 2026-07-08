# ShopWave — Full-Stack E-Commerce Template

Launch your online store in hours, not months. This production-ready React template includes everything you need: product catalog with search & filter, cart & checkout with Stripe/Google Pay, order management, user authentication, AI-powered recommendations, and real-time notifications. Just connect your Supabase backend and start selling.

---

## Why Choose ShopWave?

| Feature                     | What You Get                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------- |
| **23 Pages**                | Home, Catalog, Product Detail, Cart, Checkout, Orders, Profile, Settings, and more |
| **Dual Payment Gateways**   | Stripe card payments + Google Pay out of the box                                   |
| **AI Recommendations**      | Built-in personalized product recommendation engine based on user behavior         |
| **Real-Time Notifications** | Pusher-powered instant notifications for orders and updates                        |
| **Smart Collections**       | Dynamic homepage collections that rotate based on time and visitor behavior        |
| **Guest & Auth Routes**     | Protected and public layouts with role-based access                                |
| **Responsive Design**       | Mobile-first UI that works on all devices                                          |
| **Modern Stack**            | React 19, Redux Toolkit, Supabase, Framer Motion animations                        |

---

## Perfect For

- **Startup founders** launching a new online store
- **Freelancers** building client ecommerce sites
- **Agencies** needing a quick turnaround template
- **Side projects** where you need a full backend without building one
- **Learning** modern React patterns with real-world features

---

## Tech Stack

| Layer      | Technology                                         | Why                                   |
| ---------- | -------------------------------------------------- | ------------------------------------- |
| Frontend   | React 19, React Router v6, Redux Toolkit           | Modern, performant, industry standard |
| Styling    | Tailwind CSS 3, Bootstrap 5, MUI                   | Utility-first + component libraries   |
| Backend    | Supabase (Auth, Database, Storage, Edge Functions) | No server setup needed                |
| Payments   | Stripe, Google Pay                                 | Trusted, secure, worldwide            |
| Animations | Framer Motion, Lottie                              | Smooth, professional transitions      |
| Real-time  | Pusher                                             | Instant notifications without polling |
| Deployment | Netlify                                            | Free hosting with 1-click deploy      |

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
│   ├── collectionConfig.ts         # Collection pool with images for dynamic homepage
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
│   └── theme.css                    # Placeholder (styles now in Tailwind)
│
├── types/
│   └── products.ts                  # TypeScript product interfaces
│
├── utils/
│   ├── collectionAlgorithm.ts      # Dynamic collection scoring algorithm
│   └── tracking.js                  # Analytics event helpers
│
├── Hook/                            # Custom React hooks
├── RoutesComponent.tsx              # All route definitions
├── supaBaseClient.js                # Supabase client init
├── index.js                         # App entry point
├── index.css                        # Tailwind directives + global base styles
└── tailwind.config.js               # Tailwind configuration with design tokens
```

---

## Key Features

### 🛍️ Product Browsing

- **Product catalog** with filtering by brand, category, and price range
- **Search** with real-time results across name, brand, type, and category
- **Product detail page** with Flipkart-style vertical thumbnail gallery and hover-to-zoom
- **Related products** carousel based on matching brand/category
- **Best sellers** section with dynamic product recommendations

### 💳 Shopping & Checkout

- **Cart** with quantity management and persistent state
- **Checkout** with Stripe card payments and Google Pay integration
- **Shipping options** with multiple delivery methods
- **Order confirmation** with email notifications

### 📦 Orders & Tracking

- **Order list** with toggle between active and cancelled orders
- **Slide-in detail panel** with tracking timeline, shipping address, and payment info
- **Print invoice** support with print-optimized CSS
- **Guest order tracking** without login required

### 👤 User Account

- **Authentication** with email/password, Google OAuth, and Facebook login
- **Settings page** with profile card, notification preferences, and address book
- **Real-time notifications** via Pusher with unread count
- **Wishlist** and recently visited product tracking

### 🤖 AI & Personalization

- **Recommendation engine** that learns from user browsing, cart, and purchase history
- **Dynamic collections** on homepage that rotate based on time and visitor behavior
- **User interest scoring** that tracks and weights user preferences
- **Time-based content** that changes throughout the day

### 🎨 UI/UX

- Modern black/white/gray design system with consistent typography
- Tailwind CSS utility-first styling for rapid development
- Responsive layout (mobile, tablet, desktop)
- Skeleton loading states
- Toast notifications
- Framer Motion animations
- Lottie micro-interactions

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A free [Supabase](https://supabase.com) account
- A free [Stripe](https://stripe.com) account (optional)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/shopwave.git
cd shopwave

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start development server
npm start
```

### Connect Your Backend

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migrations from `db/sql/` folder
3. Copy your Supabase URL and anon key to `.env`
4. Optionally add your Stripe publishable key

That's it — your store is live!

---

## What's Included

```
src/
├── components/          # 15+ reusable components (Tailwind-styled)
├── pages/               # 23 page components (Tailwind-styled)
├── redux/               # 6 state slices with async thunks
├── service/             # Payment, email, and recommendation services
├── config/              # Google Pay, shipping options
├── context/             # Auth and page header providers
├── types/               # TypeScript interfaces
├── utils/               # Tracking and collection algorithms
├── tailwind.config.js   # Tailwind configuration with design tokens
└── index.css            # Tailwind directives + global base styles
```

---

## Environment Variables

Create a `.env` file with:

```env
# Required - Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key

# Optional - Stripe (for payments)
REACT_APP_STRIPE_URL=pk_test_your_stripe_key

# Optional - Supabase Edge Functions
REACT_APP_SMART_HANDLER_URL=your_edge_function_url
```

---

## Available Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `npm start`      | Start dev server on port 3000 |
| `npm run build`  | Production build              |
| `npm test`       | Run test suite                |
| `npm run format` | Format code with Prettier     |

---

## Customization

### Change Branding

- Update colors, spacing, and fonts in `tailwind.config.js`
- Replace logo in `src/components/cart/assets/`
- Modify collection images in `src/config/collectionConfig.ts`

### Tailwind Configuration

All design tokens are defined in `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#111827', hover: '#1f2937' },
        accent: '#2563eb',
        success: '#059669',
        danger: '#dc2626',
        // ...
      },
      fontFamily: {
        main: ["'Inter'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      // ...
    },
  },
};
```

For styles that can't be expressed as Tailwind utilities (scrollbar pseudo-elements, keyframe animations, print styles), minimal `<style>` tags are used inline in components.

### Add Products

- Add products to your Supabase `products` table
- Products automatically appear in the catalog

### Enable Features

- **Google OAuth**: Configure in Supabase Dashboard → Authentication → Providers
- **Push Notifications**: Create a Pusher account and add credentials
- **Email Service**: Configure Supabase Edge Functions for order emails

---

## License

MIT License - feel free to use for personal or commercial projects.
