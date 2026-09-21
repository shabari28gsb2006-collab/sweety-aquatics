# Sweety Birds & Fishes — Premium Frontend

A mobile-first React + TypeScript + Vite ecommerce frontend for **Sweety Birds & Fishes**.

## Current storefront scope

- Guppies / aquarium fish
- Fish Food
- Combo Packs
- Wholesale products
- Guppy care / seasonal care educational content

Birds, aquarium tanks, aquarium accessories, filters, pumps, decorative plants and other unrelated products are **not** part of the current storefront.

## Important V2 features

- Distinct Shop, Guppies, Fish Food, Combo Packs and Wholesale pages
- English / Tamil language switcher for the built-in interface and editorial content
- Premium mobile-first aquatic UI with fish, water, plant and bubble effects on public pages
- Customer account + mock email OTP verification flow
- Verified-account-only cart / wishlist / checkout flow
- Tamil Nadu-only delivery rule + mock serviceable-PIN-code validation
- Manual UPI checkout with app link, QR code, UTR submission and seller verification
- Manual seller shipping workflow:
  1. Order confirmed / payment successful
  2. Seller schedules packing date/time
  3. Seller marks order shipped / dispatched
  4. Seller can add AWB / tracking code later
  5. Seller or customer confirms order received
- Customer reviews become available after receipt; seller must approve a review before it appears publicly
- Seller product image upload UI with 1600×1600 (1:1), JPG/PNG/WebP, max 5 MB guidance
- Seller contact settings that update the frontend through localStorage in this frontend-only build
- “Why Enthusiasts Trust Sweety Birds & Fishes” page
- Realistic About / Mission / Vision content built around fish care and reducing unnecessary screen time
- Seller/admin login is not linked from normal customer-facing navigation

## Default contact details

- WhatsApp: **+91 9976894662**
- Email: **shabari28gsb2006@gmail.com**

The seller can edit these in **Admin → Contact Settings**. In this frontend-only version they persist in the browser with localStorage and update customer-facing contact/WhatsApp areas.

## Run locally

### Requirements

- Node.js 18+ (Node.js 20+ recommended)
- npm

### Commands

```bash
npm install
npm run dev
```

The development server is configured to run on:

```text
http://localhost:3000
```

### Production frontend check

```bash
npm run build
```

## Frontend-only architecture

This project intentionally uses mock/local frontend services. Before production launch, connect real backend services for:

- authentication and authorization / RBAC
- email OTP generation and verification
- persistent database storage
- product and image storage
- Manual UPI payment review, duplicate-UTR protection and private failed-payment audit
- real Tamil Nadu courier serviceability data
- persistent orders, shipment tracking and reviews
- admin contact/settings persistence
- production notifications

Never put payment secret keys, OTP secrets, database credentials or other production secrets in this frontend.


## Premium V2.3
This revision adds edit-gated seller contact settings, a five-step fulfilment/tracking flow, copyable customer AWB codes, post-receipt review UX, simplified premium navigation, clearer trust messaging, stronger button micro-interactions, and richer animated aquatic plants/background layers.


## V2.4 visual upgrade

- Replaced the simple underwater illustration direction with a greener aquarium mood.
- Added a rocky fish-home / cave composition with animated green aquatic plants.
- Added graceful dolphin-style ambient motion and removed the flat boat/fisherman visual direction from the main ambience.
- Upgraded hero and CTA button motion for a more premium animated feel.
- Strengthened the all-pages aquarium background so the UI feels more alive and immersive.

## Premium V2.5 frontend features

This build also includes availability alerts, recently viewed products, My Aquarium, saved-address management, delivery-date estimates, improved Buy Again, invoice export, product sharing, and seller bulk product operations. These are frontend/mock implementations stored on the current browser/device and should be replaced with authenticated database/API behavior in the backend stage.

- Landing page reef upgraded with colourful rocks, glowing pebbles, coral accents, and a greener planted fish-home for a more impressive premium aquarium look.
