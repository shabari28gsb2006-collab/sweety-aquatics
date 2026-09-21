# Sweety Birds & Fishes — Premium V2 Corrections

This version includes the requested second-pass storefront, customer-flow and seller/admin corrections.

## Storefront and design

- Shop, Guppies, Fish Food, Combo Packs and Wholesale now have separate routes and distinct page experiences.
- Wholesale is now a real store category rather than a separate “wholesale enquiry” feature.
- Desktop base typography was increased for better readability.
- Added English / Tamil switching for built-in navigation, important storefront copy, About/Trust/Contact content, order tracking and care content.
- Added premium aquatic visual layers across public pages: subtle water light, bubbles, fish, plants and aquarium imagery.
- Upgraded the homepage hero with a real aquarium image layer, animated caustic lighting and the existing interactive fish motion.
- Added a process-based “Why Enthusiasts Trust Sweety Birds & Fishes” page without fake awards, guarantees or certifications.
- Rebuilt About / Mission / Vision around caring for living fish, giving children meaningful screen-free responsibility, and providing working adults a calm aquarium-care routine without making medical claims.

## Contact and seller settings

Default public contact information:

- WhatsApp: +91 9976894662
- Email: shabari28gsb2006@gmail.com

Admin now has a **Contact Settings** screen. In this frontend-only build, changes are stored in localStorage and immediately update the public Footer, Contact page and WhatsApp actions.

## Order tracking workflow

The customer-facing workflow is now intentionally simpler:

1. **Order Confirmed** — payment has succeeded in the mock flow.
2. **Packing Scheduled** — seller chooses and saves a packing date/time; customer sees “Packing on …”.
3. **Shipped / Dispatched** — seller marks the order dispatched.
4. **Order Received** — either the seller or customer can confirm receipt.

The seller can add or update courier / AWB / tracking details after dispatch, and those details appear to the customer when available.

## Reviews

- A customer can submit a product rating/review only after the order is marked received.
- New reviews enter **Pending** status in the seller/admin Reviews screen.
- Seller can Approve, Reject or Hide/remove as provided by the mock admin UI.
- Only approved reviews tied to a received purchase are shown publicly.

## Product/admin improvements

- Seller image-upload guidance: 1600 × 1600 px, 1:1 square, JPG/PNG/WebP, max 5 MB.
- Product statuses remain: Active, Out of Stock, Coming Soon, Draft and Archived.
- Coming Soon products remain visible but cannot be purchased.
- Wholesale products can be created/edited using the same seller product workflow.
- Public navigation contains no Seller/Admin login link. The admin route remains available directly for the seller.

## Architecture and safety corrections retained from V1

- Corrected frontend type/data mismatches across checkout, order success, product detail and admin screens.
- Removed automatic fake AWB generation after payment.
- Removed unsupported claims such as guaranteed delivery, temperature-regulated shipping, pure/pedigree bloodline claims and fabricated certifications.
- Centralized WhatsApp configuration and removed hardcoded fake contact data.
- Mock services remain replaceable with production REST APIs later.
- No production payment secrets, OTP secrets or backend credentials are included.

## Production note

This is still a frontend-only prototype. localStorage-based settings, mock OTP, mock payment states, mock pincode serviceability and mock order data must be replaced by authenticated server-side services before real customer use.

## V2.1 runtime hotfix
- Fixed blank page caused by importing `SmartphoneOff` from `lucide-react`; this project's installed lucide version does not export that symbol. Replaced it with the stable `Smartphone` icon.


## Premium V2.2 polish
- Increased desktop breathing room between the Sweety brand block and the Home navigation item.
- Removed Wholesale from the main header, Shop hover menu, homepage category grid, homepage hero CTA, footer and WhatsApp quick actions. Wholesale remains available inside the Shop catalog and its direct category route.
- Removed the large cursor-instruction pill from the hero for a cleaner premium composition.
- Made the real aquarium photograph actually visible by changing the canvas water layer from opaque to translucent.
- Enhanced the living aquarium with parallax depth, stronger photographic treatment, moving water-surface light, larger detailed guppy rendering, tail texture, scale details and natural plant motion.
- Replaced simple Lucide fish decorations on inner pages with animated SVG guppies, animated fins/tails, seaweed clusters, bubbles and water-surface caustics.
- Added premium route transitions and progressive scroll-reveal motion, with prefers-reduced-motion support.
- Kept all effects pointer-events:none outside the hero so they do not block shopping interactions.

## Premium V2.3 corrections
- Seller Contact Settings now opens in read-only mode. An explicit Edit button unlocks fields; Save & Publish or Cancel closes edit mode.
- Seller order fulfilment is now exposed as a clear sequence: payment confirmed → schedule packing → ship/dispatch → add tracking/AWB → received.
- Customer tracking now includes a dedicated Tracking Code Added stage and a one-click Copy tracking code button.
- Customer review access now checks both delivered status and confirmed receipt, and a prominent review invitation appears after receipt.
- Seller review moderation continues to require approval before customer reviews become public.
- Hero trust strip language was rewritten in plain customer-facing language and redesigned as readable explanation cards.
- Desktop navigation was simplified to Home, Shop, Guppy Care, About and Contact; Guppies, Fish Food and Combo Packs live inside the premium Shop menu.
- Added richer hover/press/shimmer motion for buttons and navigation while keeping reduced-motion support.
- Added more visible animated green aquatic plants and subtle moving underwater light ribbons across customer pages.
- Added a more layered animated page background while keeping the effects pointer-safe and lightweight.


## V2.4 visual upgrade

- Replaced the simple underwater illustration direction with a greener aquarium mood.
- Added a rocky fish-home / cave composition with animated green aquatic plants.
- Added graceful dolphin-style ambient motion and removed the flat boat/fisherman visual direction from the main ambience.
- Upgraded hero and CTA button motion for a more premium animated feel.
- Strengthened the all-pages aquarium background so the UI feels more alive and immersive.

## Premium V2.5 feature pass

Added frontend/mock implementations for the next commerce feature set:

- **Notify Me When Available:** Coming Soon / Out of Stock products can save a verified customer's email alert preference. Seller product rows show alert counts. Backend email/WhatsApp delivery can replace the mock store later.
- **Recently Viewed:** Product views are stored locally and surfaced on the home page as a Continue Exploring section.
- **My Aquarium:** Delivered guppy purchases automatically appear in the customer account. Customers can nickname fish and enable local feeding/water-care reminder preferences. Includes an arrival-care card.
- **Delivery Estimate:** Serviceable PIN-code results now show a readable estimated arrival date range in addition to typical transit time.
- **Saved Addresses:** Customer account now supports Add / Edit / Remove / Set Default. Checkout can apply a saved address in one tap.
- **Buy Again Improvements:** Reorder only adds currently active/in-stock products and clearly reports skipped unavailable items.
- **Invoice Export:** Customer orders include a downloadable print-ready HTML invoice that can be saved as PDF from the browser.
- **Advanced Seller Product Tools:** Multi-select products, bulk price ±5%, bulk stock ±1, bulk Active / Coming Soon / Draft status, and Duplicate Product as Draft.
- **Seller Availability Signal:** Product management shows how many frontend availability alerts are waiting for each product.
- **Product Sharing:** Product detail page uses the device share sheet when available, with copy-link fallback.

All of these features remain frontend-only and localStorage-backed so a production backend can later replace them cleanly.

- Landing page reef upgraded with colourful rocks, glowing pebbles, coral accents, and a greener planted fish-home for a more impressive premium aquarium look.
