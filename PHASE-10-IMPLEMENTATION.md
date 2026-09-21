# Phase 10 — Seller Analytics

Implemented with protected database-backed seller APIs:

- Paid revenue, paid orders and average order value
- Received/cancelled order metrics and fulfilment rate
- Unique-customer and active-product counts
- Daily revenue/order trend
- Revenue and units by product category
- Best-performing products
- Highest-value customers
- Tamil Nadu district order/revenue performance
- Low-stock and out-of-stock alerts
- Availability-alert demand ranking
- Seller-selected date range with a maximum two-year query window
- Downloadable paid-sales CSV report

Security and correctness:

- All analytics and exports require authenticated ADMIN access.
- Revenue is calculated from server-side paid orders only.
- Date inputs are validated server-side.
- CSV values are escaped server-side.
- Customer analytics are visible only inside the protected seller console.

Verification completed:

- Prisma Client generation passed.
- Backend TypeScript build passed.
- Frontend TypeScript check passed.
- Frontend Vite production build passed.

Runtime data verification still requires a configured reachable PostgreSQL database with seeded or real order data.
