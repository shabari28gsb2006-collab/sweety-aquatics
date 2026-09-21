# Phase 12 — Launch Checklist

- Run backend and frontend production builds.
- Apply all database migrations and seed the seller account.
- Confirm API startup reports `Verified courier service areas ready: 205/205 PIN codes` and test PIN `626125`.
- Save the production UPI ID, payee name, contact details and courier + packing charge.
- Confirm a new payment starts with a unique non-sequential reference included in the UPI note.
- Confirm UPI app and QR choices carry the correct payee, amount and reference.
- Confirm UTR is required, duplicate UTRs are rejected and screenshot is optional.
- Confirm new submissions appear in seller UPI Verification and trigger the seller email.
- Confirm only seller approval marks an order Paid and Order Confirmed.
- Confirm Unsuccessful restores stock, removes the order from active seller orders and retains the private audit record.
- Confirm customer notifications and order status reflect each seller decision.
