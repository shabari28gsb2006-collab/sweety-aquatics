import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppLanguage = 'en' | 'ta';

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (english: string, tamil?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const exactTamilTranslations: Record<string, string> = {
  'Home': 'முகப்பு',
  'Shop': 'கடை',
  'Guppies': 'கப்பி மீன்கள்',
  'Fish Food': 'மீன் உணவு',
  'Combo Packs': 'காம்போ தொகுப்புகள்',
  'Wholesale': 'மொத்த விற்பனை',
  'Guppy Care': 'கப்பி பராமரிப்பு',
  'About': 'எங்களைப் பற்றி',
  'Contact': 'தொடர்பு',
  'Search': 'தேடல்',
  'Orders': 'ஆர்டர்கள்',
  'Cart': 'கார்ட்',
  'Wishlist': 'விருப்பப் பட்டியல்',
  'Sign In': 'உள்நுழைக',
  'My Orders': 'என் ஆர்டர்கள்',
  'Saved Address': 'சேமித்த முகவரி',
  'Profile Details': 'சுயவிவர விவரங்கள்',
  'View All': 'அனைத்தையும் பார்க்க',
  'Explore Guppies': 'கப்பி மீன்களைப் பாருங்கள்',
  'Shop Fish Food': 'மீன் உணவை வாங்குங்கள்',
  'Shop Wholesale': 'மொத்த விற்பனையைப் பாருங்கள்',
  'Shop by Category': 'வகைப்படி வாங்குங்கள்',
  'Featured Guppies': 'சிறப்பு கப்பி மீன்கள்',
  'Customer Reviews': 'வாடிக்கையாளர் மதிப்புரைகள்',
  'Why Choose Us': 'ஏன் எங்களைத் தேர்வு செய்ய வேண்டும்?',
  'Why Enthusiasts Trust Sweety Birds & Fishes': 'ஆர்வலர்கள் ஏன் Sweety Birds & Fishes மீது நம்பிக்கை வைக்கிறார்கள்?',
  'Learn More': 'மேலும் அறிக',
  'Customer Support & Enquiries': 'வாடிக்கையாளர் ஆதரவு மற்றும் கேள்விகள்',
  'WhatsApp Business': 'வாட்ஸ்அப் பிசினஸ்',
  'Email Desk': 'மின்னஞ்சல்',
  'Tamil Nadu, India': 'தமிழ்நாடு, இந்தியா',
  'Send us a Direct Message': 'நேரடியாக செய்தி அனுப்புங்கள்',
  'Your Name': 'உங்கள் பெயர்',
  'Email Address': 'மின்னஞ்சல் முகவரி',
  'Subject': 'பொருள்',
  'Message': 'செய்தி',
  'Submit Query': 'கேள்வியை அனுப்புங்கள்',
  'Frequently Asked Questions': 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
  'Order Tracking': 'ஆர்டர் கண்காணிப்பு',
  'Order Confirmed': 'ஆர்டர் உறுதிசெய்யப்பட்டது',
  'Packing Scheduled': 'பேக்கிங் திட்டமிடப்பட்டது',
  'Shipped / Dispatched': 'அனுப்பப்பட்டது',
  'Order Received': 'ஆர்டர் பெறப்பட்டது',
  'Back to My Orders': 'என் ஆர்டர்களுக்கு திரும்பவும்',
  'Track with Courier': 'கூரியரில் கண்காணிக்கவும்',
  'Need Assistance?': 'உதவி வேண்டுமா?',
  'Add to Cart': 'கார்ட்டில் சேர்க்கவும்',
  'Buy Now': 'இப்போது வாங்குங்கள்',
  'Coming Soon': 'விரைவில் வருகிறது',
  'Out of Stock': 'கையிருப்பில் இல்லை',
  'In Stock': 'கையிருப்பில் உள்ளது',
  'Check Delivery': 'டெலிவரியைச் சரிபார்க்கவும்',
  'Delivery Available': 'டெலிவரி கிடைக்கிறது',
  'Browse Shop': 'கடையைப் பாருங்கள்',
  'Buy Again': 'மீண்டும் வாங்குங்கள்',
  'Track Order': 'ஆர்டரை கண்காணிக்கவும்',
  'Rate & Review': 'மதிப்பீடு மற்றும் விமர்சனம்',
  'Submit Review': 'மதிப்புரையை அனுப்புங்கள்',
  'Our Vision': 'எங்கள் பார்வை',
  'Our Mission': 'எங்கள் நோக்கம்',
  'More Life. Less Screen.': 'அதிக உயிர்ப்பான வாழ்க்கை. குறைந்த திரை நேரம்.',
  'Healthy Fish • Happy Homes • Better Life': 'ஆரோக்கியமான மீன்கள் • மகிழ்ச்சியான வீடுகள் • சிறந்த வாழ்க்கை',
  'Guppies Make Life Brighter.': 'கப்பி மீன்கள் வாழ்க்கையை மேலும் வண்ணமயமாக்குகின்றன.',
  'English': 'English',
  'Tamil': 'தமிழ்',
  'Language': 'மொழி',
  'All Products': 'அனைத்து பொருட்கள்',
  'All': 'அனைத்தும்',
  'Filters': 'வடிகட்டிகள்',
  'Sort': 'வரிசைப்படுத்து',
  'Price': 'விலை',
  'Availability': 'கிடைப்பாடு',
  'Continue Shopping': 'தொடர்ந்து வாங்குங்கள்',
  'Proceed to Checkout': 'செக்அவுட் செல்லுங்கள்',
  'Checkout': 'செக்அவுட்',
  'Order Summary': 'ஆர்டர் சுருக்கம்',
  'Payment': 'பணம் செலுத்தல்',
  'Delivery Address': 'டெலிவரி முகவரி',
  'Order Success': 'ஆர்டர் வெற்றிகரமாக முடிந்தது',
  'Notifications': 'அறிவிப்புகள்',
  'Curated Catalog': 'தேர்ந்தெடுக்கப்பட்ட பொருள் பட்டியல்',
  'Seller-listed': 'விற்பனையாளர் பட்டியலிட்டது',
  'Available varieties published by seller': 'விற்பனையாளர் வெளியிட்டுள்ள கிடைக்கும் வகைகள்',
  'Daily Feeding': 'தினசரி உணவளிப்பு',
  'Fish-food products currently in stock': 'தற்போது கையிருப்பில் உள்ள மீன் உணவுகள்',
  'Curated Packs': 'தேர்ந்தெடுக்கப்பட்ட தொகுப்புகள்',
  'Seller-created product combinations': 'விற்பனையாளர் உருவாக்கிய பொருள் சேர்க்கைகள்',
  'Bulk Category': 'மொத்த விற்பனை வகை',
  'Bulk packs for shops and repeat buyers': 'கடைகள் மற்றும் அதிக அளவு வாங்குபவர்களுக்கான மொத்த தொகுப்புகள்',
  'Available Guppy Collection': 'தற்போது கிடைக்கும் கப்பி மீன் தொகுப்பு',
  'View All Guppies': 'அனைத்து கப்பி மீன்களையும் பாருங்கள்',
  'Fish Food Collection': 'மீன் உணவு தொகுப்பு',
  'Fish Food for Everyday Aquarium Care': 'தினசரி அக்வேரியம் பராமரிப்பிற்கான மீன் உணவு',
  'Browse the fish-food products currently published by the seller. Product ingredients, pack size and feeding directions should be checked on each individual listing before purchase.': 'விற்பனையாளர் தற்போது வெளியிட்டுள்ள மீன் உணவுகளைப் பாருங்கள். வாங்கும் முன் ஒவ்வொரு பொருளின் மூலப்பொருட்கள், பேக் அளவு மற்றும் உணவளிப்பு வழிமுறைகளை அதன் தனிப்பட்ட பட்டியலில் சரிபார்க்கவும்.',
  'Clear Product Availability': 'தெளிவான பொருள் கிடைப்புத் தகவல்',
  'Available, Out of Stock and Coming Soon states make it clear what can actually be ordered.': 'கிடைக்கிறது, கையிருப்பில் இல்லை, விரைவில் வருகிறது என்ற நிலைகள் மூலம் எந்த பொருளை உண்மையில் ஆர்டர் செய்யலாம் என்பது தெளிவாக தெரியும்.',
  'Seller-Controlled Dispatch': 'விற்பனையாளர் கட்டுப்படுத்தும் அனுப்பும் செயல்முறை',
  'Packing time, dispatch and courier tracking are updated by the seller instead of using automatic fake statuses.': 'தானாக உருவாக்கப்படும் தவறான நிலைகளுக்கு பதிலாக, பேக்கிங் நேரம், அனுப்பிய நிலை மற்றும் கூரியர் கண்காணிப்பு விவரங்களை விற்பனையாளர் புதுப்பிப்பார்.',
  'Delivery Eligibility Check': 'டெலிவரி தகுதி சரிபார்ப்பு',
  'Checkout is limited to Tamil Nadu and requires an enabled serviceable PIN code before payment.': 'செக்அவுட் தற்போது தமிழ்நாட்டிற்குள் மட்டுமே கிடைக்கும்; பணம் செலுத்தும் முன் செயல்படுத்தப்பட்ட சேவை பின்கோடு அவசியம்.',
  'Direct Business Contact': 'நேரடி வணிக தொடர்பு',
  'Customers can contact the business directly through the published WhatsApp number for product and order questions.': 'பொருட்கள் மற்றும் ஆர்டர்கள் குறித்த கேள்விகளுக்கு வாடிக்கையாளர்கள் வெளியிடப்பட்ட வாட்ஸ்அப் எண்ணில் நேரடியாக தொடர்புகொள்ளலாம்.',
  'See how our order & review process works': 'எங்கள் ஆர்டர் மற்றும் மதிப்புரை செயல்முறையை அறியுங்கள்',
  'Approved Customer Feedback': 'அனுமதிக்கப்பட்ட வாடிக்கையாளர் கருத்துகள்',
  'Reviews appear here only after an order is received and the seller approves the submission.': 'ஆர்டர் பெறப்பட்ட பிறகு வாடிக்கையாளர் அளித்த மதிப்புரையை விற்பனையாளர் அனுமதித்தாலே அது இங்கு தோன்றும்.',
  'Real customer reviews will appear here': 'உண்மையான வாடிக்கையாளர் மதிப்புரைகள் இங்கு தோன்றும்',
  'A customer can review a product only after the order is marked received. The seller then approves the review before it is shown publicly.': 'ஆர்டர் பெறப்பட்டது என்று உறுதிசெய்யப்பட்ட பிறகே வாடிக்கையாளர் பொருளுக்கு மதிப்புரை அளிக்க முடியும். அந்த மதிப்புரை பொதுவாக காட்டப்படுவதற்கு முன் விற்பனையாளர் அதை அனுமதிப்பார்.',
  'Hobbyist Knowledge Hub': 'மீன் ஆர்வலர்களுக்கான அறிவு மையம்',
  'Guppy Care Essentials': 'அத்தியாவசிய கப்பி பராமரிப்பு',
  'All Guides': 'அனைத்து வழிகாட்டிகளும்',
  'Read Guide': 'வழிகாட்டியைப் படிக்கவும்',
  'Wholesale Category': 'மொத்த விற்பனை வகை',
  'Bulk-ready products in the same store experience': 'அதே கடை அனுபவத்தில் மொத்தமாக வாங்கக்கூடிய பொருட்கள்',
  'Wholesale products are managed as normal catalog items. View published bulk packs, stock, quantity and pricing directly in the store.': 'மொத்த விற்பனை பொருட்களும் சாதாரண கடை பொருட்களைப் போலவே நிர்வகிக்கப்படுகின்றன. வெளியிடப்பட்ட மொத்த தொகுப்புகள், கையிருப்பு, அளவு மற்றும் விலையை கடையிலேயே பார்க்கலாம்.',
  'Browse Wholesale': 'மொத்த விற்பனை பொருட்களைப் பாருங்கள்',
  'Selected guppy pairs, fish food, and starter combo packs. Delivery is offered to enabled serviceable PIN codes within Tamil Nadu.': 'தேர்ந்தெடுக்கப்பட்ட கப்பி ஜோடிகள், மீன் உணவு மற்றும் காம்போ தொகுப்புகள் கிடைக்கின்றன. தமிழ்நாட்டில் செயல்படுத்தப்பட்ட சேவை பின்கோடுகளுக்கு மட்டுமே டெலிவரி வழங்கப்படுகிறது.',
  'Careful Packing': 'கவனமான பேக்கிங்',
  'Seller-managed packing': 'விற்பனையாளர் நிர்வகிக்கும் பேக்கிங்',
  'Customer Support': 'வாடிக்கையாளர் ஆதரவு',
  'WhatsApp guidance': 'வாட்ஸ்அப் வழிகாட்டல்',
  'Reliable Service': 'நம்பகமான சேவை',
  'TN serviceable PIN codes': 'தமிழ்நாடு சேவை பின்கோடுகள்',
  'Move your cursor & watch the fish swim!': 'கர்சரை நகர்த்தி மீன் நீந்துவதைப் பாருங்கள்!',
  'No Orders Yet': 'இதுவரை ஆர்டர்கள் இல்லை',
  'Once you complete your checkout, you can track seller packing, dispatch and receipt status here.': 'செக்அவுட் முடிந்த பிறகு, விற்பனையாளர் பேக்கிங் நேரம், அனுப்பிய நிலை மற்றும் ஆர்டர் பெறப்பட்ட நிலையை இங்கு கண்காணிக்கலாம்.',
  'Your Wishlist is Empty': 'உங்கள் விருப்பப் பட்டியல் காலியாக உள்ளது',
  'Primary Delivery Address': 'முதன்மை டெலிவரி முகவரி',
  'Account Information': 'கணக்கு தகவல்',
  'Registered Name': 'பதிவு செய்யப்பட்ட பெயர்',
  'Email (Verified)': 'மின்னஞ்சல் (சரிபார்க்கப்பட்டது)',
  'Mobile Phone': 'மொபைல் எண்',
  'Verified Customer': 'சரிபார்க்கப்பட்ட வாடிக்கையாளர்',
  'Sign Out': 'வெளியேறு',
  'Review Published': 'மதிப்புரை வெளியிடப்பட்டது',
  'Review Pending': 'மதிப்புரை அனுமதிக்க காத்திருக்கிறது',
  'Review Not Published': 'மதிப்புரை வெளியிடப்படவில்லை',
  'Verified Purchase Review': 'உறுதிப்படுத்தப்பட்ட வாங்குதலின் மதிப்புரை',
  'Your review is sent to the seller first and becomes public only after approval.': 'உங்கள் மதிப்புரை முதலில் விற்பனையாளருக்கு அனுப்பப்படும்; அவர் அனுமதித்த பிறகே பொதுவாக காட்டப்படும்.',
  'Rating': 'மதிப்பீடு',
  'Review title': 'மதிப்புரை தலைப்பு',
  'Your experience': 'உங்கள் அனுபவம்',
  'Submit Review for Approval': 'அனுமதிக்க மதிப்புரையை அனுப்புங்கள்',
  'Customers can submit a review from My Orders only after the order is marked received. The seller approves it before it appears here.': 'ஆர்டர் பெறப்பட்டது என்று குறிக்கப்பட்ட பிறகே வாடிக்கையாளர் “என் ஆர்டர்கள்” பகுதியில் மதிப்புரை அளிக்க முடியும். அது இங்கு தோன்றுவதற்கு முன் விற்பனையாளர் அனுமதிப்பார்.',
  'Review a Verified Purchase': 'சரிபார்க்கப்பட்ட வாங்குதலை மதிப்பாய்வு செய்யவும்',
  'No approved reviews for this product yet.': 'இந்த பொருளுக்கு இதுவரை அனுமதிக்கப்பட்ட மதிப்புரைகள் இல்லை.',
  'Packing & Handling': 'பேக்கிங் மற்றும் கையாளுதல்',
  'Included (₹0)': 'சேர்க்கப்பட்டுள்ளது (₹0)',
  'Items Subtotal': 'பொருட்களின் இடைக்கூட்டல்',
  'Estimated Total': 'மதிப்பிடப்பட்ட மொத்தம்',
  'Proceed to Secure Checkout': 'பாதுகாப்பான செக்அவுட் செல்லுங்கள்',
  'Amount Payable': 'செலுத்த வேண்டிய தொகை',
  'Customer Details': 'வாடிக்கையாளர் விவரங்கள்',
  'Full Name': 'முழுப் பெயர்',
  'Mobile Number': 'மொபைல் எண்',
  'Address Line': 'முகவரி',
  'Area / Locality': 'பகுதி / வட்டாரம்',
  'City': 'நகரம்',
  'District': 'மாவட்டம்',
  'State': 'மாநிலம்',
  'Pincode': 'பின்கோடு',
  'Pay Securely': 'பாதுகாப்பாக பணம் செலுத்துங்கள்',
  'Payment Successful': 'பணம் செலுத்தப்பட்டது',
  'Awaiting seller packing schedule': 'விற்பனையாளர் பேக்கிங் நேரத்தை அறிவிக்க காத்திருக்கிறது',
  'Mark Order Received': 'ஆர்டர் பெற்றதாக உறுதிசெய்யவும்',
  'I Received My Order': 'என் ஆர்டரை பெற்றுவிட்டேன்',
  'Contact Settings': 'தொடர்பு அமைப்புகள்',
  'Tamil Nadu Delivery Catalog': 'தமிழ்நாடு டெலிவரி பொருள் பட்டியல்',
  'Aquatic Catalog': 'அக்வேரியம் பொருள் பட்டியல்',
  'Browse seller-published guppies, fish food, combo packs and wholesale products in one catalog.': 'விற்பனையாளர் வெளியிட்டுள்ள கப்பி மீன்கள், மீன் உணவு, காம்போ தொகுப்புகள் மற்றும் மொத்த விற்பனை பொருட்களை ஒரே பட்டியலில் பாருங்கள்.',
  'Featured First': 'சிறப்பு பொருட்கள் முதலில்',
  'Price: Low to High': 'விலை: குறைவிலிருந்து அதிகம்',
  'Price: High to Low': 'விலை: அதிகத்திலிருந்து குறைவு',
  'Highest Rated': 'அதிக மதிப்பீடு பெற்றவை',
  'Guppy Color': 'கப்பி நிறம்',
  'Gender / Pair': 'பாலினம் / ஜோடி',
  'Max Price': 'அதிகபட்ச விலை',
  'In Stock Only': 'கையிருப்பில் உள்ளவை மட்டும்',
  'Active filters:': 'செயலில் உள்ள வடிகட்டிகள்:',
  'No Products Found': 'பொருட்கள் கிடைக்கவில்லை',
  'Filter Catalog': 'பொருள் பட்டியலை வடிகட்டவும்',
  'Refine by strain color, gender and price': 'நிறம், பாலினம் மற்றும் விலைப்படி வடிகட்டவும்',
  'Gender / Pair Selection': 'பாலினம் / ஜோடி தேர்வு',
  'Show in-stock items only': 'கையிருப்பில் உள்ள பொருட்களை மட்டும் காட்டவும்',
  'Search guppies, food, combos or wholesale...': 'கப்பி, மீன் உணவு, காம்போ அல்லது மொத்த விற்பனை பொருட்களைத் தேடுங்கள்...',
  'Your Shopping Cart is Empty': 'உங்கள் கார்ட் காலியாக உள்ளது',
  'Courier Dispatch (TN)': 'கூரியர் அனுப்புதல் (தமிழ்நாடு)',
  'Authentication Required': 'உள்நுழைவு அவசியம்',
  'Your Cart is Empty': 'உங்கள் கார்ட் காலியாக உள்ளது',
  'Add products to your cart before proceeding to checkout.': 'செக்அவுட் செல்லும் முன் பொருட்களை கார்ட்டில் சேர்க்கவும்.',
  'Phone Number (WhatsApp preferred)': 'மொபைல் எண் (வாட்ஸ்அப் எண் விரும்பப்படுகிறது)',
  'House / Flat / Door No. & Street': 'வீடு / ஃபிளாட் / கதவு எண் மற்றும் தெரு',
  'Area / Landmark': 'பகுதி / அடையாள இடம்',
  'City / Town': 'நகரம் / ஊர்',
  '6-Digit PIN Code': '6 இலக்க பின்கோடு',
  '256-Bit Encrypted Secure Payment': 'பாதுகாப்பான பணம் செலுத்தும் பகுதி',
  'Google Pay / PhonePe / Paytm': 'Google Pay / PhonePe / Paytm',
  'Instant UPI Payment': 'உடனடி UPI பணம் செலுத்தல்',
  'Credit / Debit Card': 'கிரெடிட் / டெபிட் கார்டு',
  'Visa, Mastercard, RuPay': 'Visa, Mastercard, RuPay',
  'Net Banking': 'நெட் பேங்கிங்',
  'All Indian Banks Supported': 'இந்திய வங்கிகள் மூலம் பணம் செலுத்தும் விருப்பம்',
  'Authorize Payment': 'பணம் செலுத்த தொடரவும்',
  'e.g. karthik.tn@example.com': 'உதா: karthik.tn@example.com',
  'Enter password': 'கடவுச்சொல்லை உள்ளிடுங்கள்',
  'Your Full Name': 'உங்கள் முழுப் பெயர்',
  'Email': 'மின்னஞ்சல்',
  'Min 6 chars': 'குறைந்தது 6 எழுத்துகள்',
  'Repeat': 'மீண்டும் உள்ளிடுங்கள்',
  'Fast Demo Review Mode': 'முன்பக்க டெமோ சோதனை முறை',
  'Activate verified Tamil Nadu customer profile': 'சரிபார்க்கப்பட்ட தமிழ்நாடு வாடிக்கையாளர் டெமோ கணக்கை செயல்படுத்தவும்',
  'Confirm Password': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
  'Email Verified ✓': 'மின்னஞ்சல் சரிபார்க்கப்பட்டது ✓',
  'Verify Your Email': 'உங்கள் மின்னஞ்சலை சரிபார்க்கவும்',
  'Search products': 'பொருட்களைத் தேடுங்கள்',
  'View wishlist': 'விருப்பப் பட்டியலைப் பாருங்கள்',
  'Open WhatsApp live enquiry': 'வாட்ஸ்அப் தொடர்பைத் திறக்கவும்',
  'Aquatic Care Knowledge': 'அக்வேரியம் பராமரிப்பு அறிவு',
  'Guppy Care & Breeding Hub': 'கப்பி பராமரிப்பு மற்றும் இனப்பெருக்க மையம்',
  'Practical beginner-friendly guides for breeding, feeding, acclimation and seasonal aquarium care. Always adapt general guidance to your own aquarium conditions.': 'இனப்பெருக்கம், உணவளிப்பு, புதிய மீன்களை பழக்கப்படுத்துதல் மற்றும் பருவகால அக்வேரியம் பராமரிப்பிற்கான தொடக்கநிலையினருக்கு ஏற்ற நடைமுறை வழிகாட்டிகள். பொதுவான ஆலோசனைகளை உங்கள் அக்வேரியத்தின் நிலைக்கு ஏற்ப பயன்படுத்துங்கள்.',
  'Read Complete Guide': 'முழு வழிகாட்டியைப் படிக்கவும்',
  'Back to Care Hub': 'பராமரிப்பு மையத்திற்குத் திரும்பவும்',
  'Care Notes': 'பராமரிப்பு குறிப்புகள்',
  'Sweety Birds & Fishes • General care guide': 'Sweety Birds & Fishes • பொதுப் பராமரிப்பு வழிகாட்டி',
  'Share Article': 'கட்டுரையை பகிரவும்',
  'Breeding': 'இனப்பெருக்கம்',
  'Seasonal': 'பருவகால பராமரிப்பு',
  'Beginner': 'தொடக்கநிலை',
  'Nutrition': 'உணவளிப்பு',
  'Acclimation': 'புதிய சூழலுக்கு பழக்கப்படுத்துதல்',
  '3 min read': '3 நிமிட வாசிப்பு',
  '4 min read': '4 நிமிட வாசிப்பு',
  '5 min read': '5 நிமிட வாசிப்பு',
  'Guppy Breeding Tips: A Practical Beginner Guide': 'கப்பி இனப்பெருக்க குறிப்புகள்: தொடக்கநிலையினருக்கான நடைமுறை வழிகாட்டி',
  'Healthy breeding fish, safe cover for fry, and simple early-care habits.': 'ஆரோக்கியமான இனப்பெருக்க மீன்கள், குஞ்சுகளுக்கான பாதுகாப்பான மறைவிடங்கள் மற்றும் எளிய ஆரம்ப பராமரிப்பு பழக்கங்கள்.',
  'A simple starting point for guppy breeding: choose active fish, provide enough space and cover, keep water conditions stable, and feed fry in small appropriate portions.': 'கப்பி இனப்பெருக்கத்தைத் தொடங்க எளிய அடிப்படை: சுறுசுறுப்பான மீன்களைத் தேர்வு செய்யுங்கள், போதுமான இடமும் மறைவிடங்களும் வழங்குங்கள், நீர்நிலையை நிலையாக வைத்திருங்கள், குஞ்சுகளுக்கு சிறிய அளவில் பொருத்தமான உணவை அளியுங்கள்.',
  '1. Choose Active, Healthy Fish': '1. சுறுசுறுப்பான, ஆரோக்கியமான மீன்களைத் தேர்வு செய்யுங்கள்',
  'Select fish that are alert, swimming normally and free from obvious injury. Avoid breeding fish that appear weak or are being heavily chased.': 'எச்சரிக்கையுடன் இயல்பாக நீந்தும், வெளிப்படையான காயங்கள் இல்லாத மீன்களைத் தேர்வு செய்யுங்கள். பலவீனமாகத் தோன்றும் அல்லது தொடர்ந்து துரத்தப்படும் மீன்களை இனப்பெருக்கத்திற்கு தேர்வு செய்ய வேண்டாம்.',
  'Provide enough space and hiding areas so females can move away from persistent males. Observe the group and adjust the number of fish if chasing becomes excessive.': 'பெண் மீன்கள் தொடர்ந்து துரத்தும் ஆண் மீன்களிலிருந்து விலகிச் செல்ல போதுமான இடமும் மறைவிடங்களும் வழங்குங்கள். துரத்தல் அதிகமாக இருந்தால் குழுவைக் கவனித்து மீன்களின் எண்ணிக்கையை ஏற்ப மாற்றுங்கள்.',
  'If you add new fish, keep them separate for observation before mixing them with an established group.': 'புதிய மீன்களைச் சேர்க்கும்போது, ஏற்கனவே உள்ள குழுவுடன் சேர்ப்பதற்கு முன் அவற்றை தனியாக வைத்துக் கவனிப்பது நல்லது.',
  '2. Give Fry Safe Cover': '2. குஞ்சுகளுக்கு பாதுகாப்பான மறைவிடங்களை வழங்குங்கள்',
  'Adult guppies may eat newborn fry. Dense fine-leaved plants or a separate nursery area can give fry places to hide.': 'வயது வந்த கப்பி மீன்கள் புதிதாகப் பிறந்த குஞ்சுகளை உண்ணக்கூடும். அடர்த்தியான நுண்ணிய இலைத் தாவரங்கள் அல்லது தனி நர்சரி பகுதி குஞ்சுகளுக்கு மறைவிடமாக உதவும்.',
  'Keep the nursery environment stable and avoid sudden changes in temperature or water quality.': 'குஞ்சுகள் இருக்கும் சூழலை நிலையாக வைத்திருந்து, வெப்பநிலை அல்லது நீர்தரத்தில் திடீர் மாற்றங்களைத் தவிர்க்கவும்.',
  '3. Feed Fry Small Portions': '3. குஞ்சுகளுக்கு சிறிய அளவில் உணவளிக்கவும்',
  'Use food that is small enough for fry to eat. Feed modest portions and remove or reduce excess food so the water does not foul.': 'குஞ்சுகள் எளிதில் உண்ணக்கூடிய அளவு சிறிய உணவைப் பயன்படுத்துங்கள். அளவாக உணவளித்து, மீதமுள்ள உணவு நீர்தரத்தை பாதிக்காதபடி அதிகப்படியான உணவைத் தவிர்க்கவும்.',
  'As fry grow, gradually move to appropriately sized food and continue observing their activity and water quality.': 'குஞ்சுகள் வளரும்போது, அவற்றின் அளவுக்கு ஏற்ற உணவிற்கு படிப்படியாக மாற்றி, அவற்றின் செயற்பாடும் நீர்தரமும் தொடர்ந்து கவனிக்கவும்.',
  'Summer Guppy Maintenance in Tamil Nadu': 'தமிழ்நாட்டின் கோடைக்கால கப்பி பராமரிப்பு',
  'Temperature, oxygen, shade, evaporation and feeding checks for hot weather.': 'வெப்பமான காலநிலையில் வெப்பநிலை, ஆக்சிஜன், நிழல், ஆவியாகுதல் மற்றும் உணவளிப்பை கவனிக்கும் முறைகள்.',
  'Hot weather can warm aquarium water quickly. Monitor temperature, maintain surface movement, keep tanks away from direct sun and watch water level and feeding closely.': 'வெப்பமான காலநிலையில் அக்வேரியம் நீர் விரைவாக சூடாகலாம். வெப்பநிலையை கண்காணித்து, நீர்மேற்பரப்பில் அசைவை பராமரித்து, தொட்டியை நேரடி வெயிலிலிருந்து விலக்கி, நீர்மட்டத்தையும் உணவளிப்பையும் கவனமாக பார்க்கவும்.',
  '1. Watch Temperature and Surface Movement': '1. வெப்பநிலையும் நீர்மேற்பரப்பு அசைவையும் கவனிக்கவும்',
  'Warm water generally holds less dissolved oxygen than cooler water. Keep good surface movement and observe fish for unusual breathing or inactivity.': 'குளிர்ந்த நீரைவிட வெப்பமான நீரில் கரைந்த ஆக்சிஜன் பொதுவாக குறைவாக இருக்கும். நல்ல நீர்மேற்பரப்பு அசைவை வைத்திருந்து, மீன்களில் இயல்பற்ற சுவாசம் அல்லது சுறுசுறுப்பின்மை உள்ளதா கவனிக்கவும்.',
  'An air stone or sponge filter can improve surface agitation when needed, provided the flow is not too strong for the fish.': 'தேவைப்பட்டால் ஏர் ஸ்டோன் அல்லது ஸ்பாஞ்ச் ஃபில்டர் நீர்மேற்பரப்பு அசைவை அதிகரிக்க உதவும்; ஆனால் நீரோட்டம் மீன்களுக்கு அதிகமாக இருக்கக்கூடாது.',
  'Use a reliable aquarium thermometer so changes are noticed early instead of guessing from room temperature.': 'அறை வெப்பநிலையை மட்டும் ஊகிக்காமல், மாற்றங்களை முன்கூட்டியே அறிய நம்பகமான அக்வேரியம் வெப்பமானியைப் பயன்படுத்துங்கள்.',
  '2. Reduce Direct Heat': '2. நேரடி வெப்பத்தை குறைக்கவும்',
  'Keep the aquarium away from direct afternoon sunlight and other heat sources.': 'அக்வேரியத்தை நேரடி மதிய வெயில் மற்றும் பிற வெப்ப மூலங்களிலிருந்து விலக்கி வைக்கவும்.',
  'A suitable aquarium fan can help with evaporative cooling, but evaporation also changes water level, so top up appropriately and keep checking temperature.': 'பொருத்தமான அக்வேரியம் விசிறி ஆவியாகும் குளிர்விற்கு உதவலாம். ஆனால் ஆவியாகுதல் நீர்மட்டத்தை குறைக்கும் என்பதால், தேவையான அளவு நீர் நிரப்பி வெப்பநிலையை தொடர்ந்து சரிபார்க்கவும்.',
  'Avoid sudden cooling methods such as adding large amounts of ice directly to the aquarium.': 'அக்வேரியத்தில் நேரடியாக அதிக அளவு பனியைச் சேர்ப்பது போன்ற திடீர் குளிர்விப்பு முறைகளைத் தவிர்க்கவும்.',
  '3. Feed Carefully in Hot Weather': '3. வெப்பமான காலநிலையில் கவனமாக உணவளிக்கவும்',
  'Offer only what the fish can finish in a short time. Extra uneaten food can worsen water quality faster in warm conditions.': 'மீன்கள் குறுகிய நேரத்தில் உண்ணக்கூடிய அளவு மட்டுமே உணவளிக்கவும். வெப்பமான சூழலில் மீதமுள்ள உணவு நீர்தரத்தை வேகமாக பாதிக்கக்கூடும்.',
  'Rainy Season & Winter Guppy Maintenance': 'மழைக்காலம் மற்றும் குளிர்கால கப்பி பராமரிப்பு',
  'Keep temperature and water changes stable during cooler nights and rainy weather.': 'குளிரான இரவுகளிலும் மழைக்காலத்திலும் வெப்பநிலையும் நீர் மாற்றங்களும் நிலையாக இருக்க கவனிக்கவும்.',
  'Cooler nights and rain can change room and aquarium temperatures. The goal is stability: measure the water temperature, avoid sudden changes and use suitable heating only when needed.': 'குளிரான இரவுகளும் மழையும் அறை மற்றும் அக்வேரியம் வெப்பநிலையை மாற்றலாம். நீரின் வெப்பநிலையை அளந்து, திடீர் மாற்றங்களைத் தவிர்த்து, தேவைப்பட்டால் மட்டுமே பொருத்தமான ஹீட்டரைப் பயன்படுத்துவது முக்கியம்.',
  '1. Keep Temperature Stable': '1. வெப்பநிலையை நிலையாக வைத்திருங்கள்',
  'Use an aquarium thermometer and watch for large day-to-night changes. Guppies generally do better with stable tropical temperatures than repeated sudden swings.': 'அக்வேரியம் வெப்பமானியைப் பயன்படுத்தி பகல்-இரவு வெப்பநிலை மாற்றங்கள் அதிகமாக உள்ளதா கவனிக்கவும். மீண்டும் மீண்டும் திடீர் மாற்றங்கள் ஏற்படுவதற்குப் பதிலாக நிலையான வெப்பநிலை கப்பிகளுக்கு ஏற்றதாக இருக்கும்.',
  'If your aquarium becomes too cool for the fish, use a correctly sized thermostatic aquarium heater and follow the manufacturer instructions.': 'அக்வேரியம் மீன்களுக்கு மிகக் குளிராகுமானால், சரியான திறன் கொண்ட தெர்மோஸ்டாட் அக்வேரியம் ஹீட்டரை பயன்படுத்தி உற்பத்தியாளர் வழிமுறைகளைப் பின்பற்றவும்.',
  '2. Match Water During Changes': '2. நீர் மாற்றத்தின் போது வெப்பநிலையை பொருத்தமாக வைத்திருங்கள்',
  'During water changes, avoid adding replacement water that is dramatically colder or warmer than the aquarium. Make changes gradually and use dechlorinated water appropriate for your setup.': 'நீர் மாற்றும்போது அக்வேரியம் நீரைவிட மிகவும் குளிரான அல்லது சூடான நீரை திடீரென சேர்க்க வேண்டாம். மாற்றங்களை படிப்படியாக செய்து, உங்கள் அமைப்பிற்கு ஏற்ற குளோரின் நீக்கப்பட்ட நீரைப் பயன்படுத்துங்கள்.',
  'Beginner Guppy Care: A Simple Foundation': 'தொடக்கநிலை கப்பி பராமரிப்பு: எளிய அடித்தளம்',
  'Space, filtration, water quality, observation and a consistent routine.': 'இடவசதி, வடிகட்டி, நீர்தரம், தினசரி கவனிப்பு மற்றும் ஒழுங்கான பராமரிப்பு.',
  'Start with a properly prepared aquarium rather than a tiny bowl. Give guppies stable water, gentle filtration, suitable space and a regular observation routine.': 'மிகச் சிறிய கிண்ணத்திற்கு பதிலாக முறையாக தயாரிக்கப்பட்ட அக்வேரியத்துடன் தொடங்குங்கள். கப்பிகளுக்கு நிலையான நீர், மென்மையான வடிகட்டி, போதுமான இடம் மற்றும் வழக்கமான கவனிப்பை வழங்குங்கள்.',
  '1. Choose a Stable Aquarium': '1. நிலையான அக்வேரியத்தைத் தேர்வு செய்யுங்கள்',
  'Larger, properly filtered aquariums are generally easier to keep stable than very small bowls. Choose a tank size that provides swimming room for the number of fish you plan to keep.': 'மிகச் சிறிய கிண்ணங்களை விட சரியான வடிகட்டியுடன் கூடிய பெரிய அக்வேரியங்களை நிலையாக பராமரிப்பது பொதுவாக எளிது. நீங்கள் வைத்திருக்கத் திட்டமிடும் மீன்களின் எண்ணிக்கைக்கு போதுமான நீந்தும் இடம் தரும் தொட்டியைத் தேர்வு செய்யுங்கள்.',
  '2. Use Gentle Filtration': '2. மென்மையான வடிகட்டியைப் பயன்படுத்துங்கள்',
  'Use filtration that keeps the water moving and supports biological filtration without creating an excessively strong current. Sponge filters are a common gentle option for guppy setups.': 'அதிக வலுவான நீரோட்டத்தை உருவாக்காமல் நீரைச் சுழலச் செய்து உயிரியல் வடிகட்டலை ஆதரிக்கும் ஃபில்டரைப் பயன்படுத்துங்கள். கப்பி அமைப்புகளில் ஸ்பாஞ்ச் ஃபில்டர் பொதுவாகப் பயன்படுத்தப்படும் மென்மையான தேர்வாகும்.',
  '3. Observe Every Day': '3. தினமும் கவனியுங்கள்',
  'Take a few quiet minutes each day to check swimming, appetite, water temperature and equipment. Early observation helps you notice changes before they become larger problems.': 'தினமும் சில நிமிடங்கள் அமைதியாக மீன்களின் நீந்துதல், உணவு விருப்பம், நீரின் வெப்பநிலை மற்றும் உபகரணங்களைச் சரிபார்க்கவும். ஆரம்பத்திலேயே கவனிப்பது மாற்றங்களை விரைவாக அறிய உதவும்.',
  'Guppy Feeding Guide: Small Portions, Consistent Routine': 'கப்பி உணவளிப்பு வழிகாட்டி: சிறிய அளவு, ஒழுங்கான பழக்கம்',
  'How to avoid overfeeding and use product directions responsibly.': 'அதிக உணவளிப்பைத் தவிர்த்து, பொருளின் வழிமுறைகளை சரியாகப் பயன்படுத்துவது எப்படி.',
  'Feed modest portions that the fish can finish, follow the food label, vary the diet when appropriate and keep uneaten food from building up in the aquarium.': 'மீன்கள் முடிக்கக்கூடிய அளவு உணவளித்து, உணவு பொருளின் லேபிள் வழிமுறைகளைப் பின்பற்றி, தேவையானபோது உணவில் மாறுபாடு கொடுத்து, மீதமுள்ள உணவு அக்வேரியத்தில் சேராமல் கவனிக்கவும்.',
  '1. Start With Small Portions': '1. சிறிய அளவில் தொடங்குங்கள்',
  'Overfeeding can leave waste in the aquarium. Start with a small amount, watch how quickly it is eaten and adjust the next feeding rather than adding a large amount at once.': 'அதிக உணவளிப்பு அக்வேரியத்தில் கழிவை அதிகரிக்கலாம். முதலில் சிறிய அளவு கொடுத்து, அது எவ்வளவு விரைவாக உண்ணப்படுகிறது என்பதைப் பார்த்து அடுத்த உணவளிப்பின் அளவை சரிசெய்யுங்கள்.',
  '2. Read the Product Label': '2. பொருளின் லேபிளை படிக்கவும்',
  'Different fish foods have different ingredients and feeding directions. Check the seller listing and manufacturer label instead of assuming every product should be used the same way.': 'வித்தியாசமான மீன் உணவுகளில் வித்தியாசமான மூலப்பொருட்களும் உணவளிப்பு வழிமுறைகளும் இருக்கும். எல்லா பொருட்களையும் ஒரே முறையில் பயன்படுத்தலாம் என்று கருதாமல், விற்பனையாளர் பட்டியலும் உற்பத்தியாளர் லேபிளும் சரிபார்க்கவும்.',
  'Acclimation Guide for Newly Arrived Guppies': 'புதிதாக வந்த கப்பி மீன்களை பழக்கப்படுத்தும் வழிகாட்டி',
  'A calm transition from the transport bag to the aquarium.': 'போக்குவரத்து பையிலிருந்து அக்வேரியத்திற்கு அமைதியான மாற்றம்.',
  'Prepare the aquarium before the fish arrive, keep the lights low, avoid sudden temperature changes and follow the seller instructions for the specific shipment.': 'மீன்கள் வருவதற்கு முன் அக்வேரியத்தைத் தயார் செய்து, விளக்குகளை மங்கலாக வைத்திருந்து, திடீர் வெப்பநிலை மாற்றங்களைத் தவிர்த்து, அந்த அனுப்புதலுக்கான விற்பனையாளர் வழிமுறைகளைப் பின்பற்றுங்கள்.',
  '1. Prepare Before Opening the Bag': '1. பையைத் திறப்பதற்கு முன் தயாராகுங்கள்',
  'Make sure the aquarium is ready before opening the transport bag. Keep lighting low and compare the bag and aquarium temperatures.': 'போக்குவரத்து பையைத் திறப்பதற்கு முன் அக்வேரியம் தயாராக உள்ளதா உறுதி செய்யுங்கள். விளக்குகளை மங்கலாக வைத்திருந்து, பையின் நீர் மற்றும் அக்வேரியம் நீரின் வெப்பநிலையை ஒப்பிடுங்கள்.',
  'If the seller instructs you to float the sealed bag for temperature adjustment, keep the bag sealed during that step and avoid leaving the fish in transport water longer than necessary.': 'வெப்பநிலையை சமப்படுத்த மூடிய பையை நீரில் மிதக்க விட வேண்டும் என்று விற்பனையாளர் கூறியிருந்தால், அந்த நேரத்தில் பையை மூடியே வைத்திருந்து, தேவைக்குமேல் மீன்களை போக்குவரத்து நீரில் வைத்திருக்க வேண்டாம்.',
  '2. Transfer Gently': '2. மெதுவாக மாற்றுங்கள்',
  'Follow the seller guidance for gradual acclimation when water conditions differ. Avoid sudden changes.': 'நீர்நிலைகள் வேறுபட்டால் படிப்படியாக பழக்கப்படுத்த விற்பனையாளர் வழங்கிய வழிகாட்டலைப் பின்பற்றுங்கள். திடீர் மாற்றங்களைத் தவிர்க்கவும்.',
  'When transferring the fish, use a clean net or appropriate container and avoid adding transport water to the main aquarium when possible.': 'மீன்களை மாற்றும்போது சுத்தமான வலை அல்லது பொருத்தமான பாத்திரத்தைப் பயன்படுத்துங்கள்; இயன்றவரை போக்குவரத்து நீரை பிரதான அக்வேரியத்தில் சேர்ப்பதைத் தவிர்க்கவும்.',
};

const originalTextNodes = new WeakMap<Node, string>();
const originalAttributes = new WeakMap<Element, Record<string, string>>();

function translateDom(language: AppLanguage) {
  if (typeof document === 'undefined') return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }

  nodes.forEach((textNode) => {
    const parent = textNode.parentElement;
    if (!parent || parent.closest('#admin-console') || parent.closest('script') || parent.closest('style')) return;
    const raw = textNode.nodeValue || '';
    const trimmed = raw.trim();
    if (!trimmed) return;

    if (language === 'ta') {
      if (!originalTextNodes.has(textNode)) originalTextNodes.set(textNode, raw);
      const translated = exactTamilTranslations[trimmed];
      if (translated) {
        const leading = raw.match(/^\s*/)?.[0] || '';
        const trailing = raw.match(/\s*$/)?.[0] || '';
        textNode.nodeValue = `${leading}${translated}${trailing}`;
      }
    } else {
      const original = originalTextNodes.get(textNode);
      if (original !== undefined) textNode.nodeValue = original;
    }
  });

  // Translate common customer-facing attributes too (placeholders, labels and tooltips).
  document.querySelectorAll<HTMLElement>('[placeholder], [aria-label], [title]').forEach((element) => {
    if (element.closest('#admin-console')) return;
    const tracked = originalAttributes.get(element) || {};
    (['placeholder', 'aria-label', 'title'] as const).forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (!current) return;
      if (language === 'ta') {
        if (!(attribute in tracked)) tracked[attribute] = current;
        const translated = exactTamilTranslations[current.trim()];
        if (translated) element.setAttribute(attribute, translated);
      } else if (tracked[attribute]) {
        element.setAttribute(attribute, tracked[attribute]);
      }
    });
    originalAttributes.set(element, tracked);
  });
}

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const stored = localStorage.getItem('sbf_language');
    return stored === 'ta' ? 'ta' : 'en';
  });

  const setLanguage = (next: AppLanguage) => {
    setLanguageState(next);
    localStorage.setItem('sbf_language', next);
  };

  useEffect(() => {
    document.documentElement.lang = language === 'ta' ? 'ta' : 'en';
    translateDom(language);
    const observer = new MutationObserver(() => translateDom(language));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (english: string, tamil?: string) => language === 'ta' ? (tamil || exactTamilTranslations[english] || english) : english,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}
