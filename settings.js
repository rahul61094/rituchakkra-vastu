/* =========================================================
   SITE SETTINGS — edit these to make the site yours
   ========================================================= */
const CONFIG = {
  business: "Rituchakkra Vastu",
  whatsapp: "919136969627",              // country code + number, no + or spaces
  phone: "+91 91369 69627",
  email: "rituchakkravastu@gmail.com",
  address: "Unity House, Charni Road, Mumbai",
  hours: "", // e.g. "Mon – Sat, 10:00 – 19:00 IST"
  instagram: "https://www.instagram.com/Rituchakkravastu",
  // Razorpay: paste your Key ID (starts with rzp_live_ or rzp_test_). Leave empty to run in test mode.
  razorpayKey: "",
  // Server functions (included in the download) that create and verify Razorpay orders.
  createOrderUrl: "/api/create-order",
  verifyUrl: "/api/verify-payment",
  shippingFlat: 99, freeShippingOver: 2000
};

const PACKAGES = [
  {id:"online-45",mode:"online",name:"Online Consultation",price:1100,unit:"45 minutes",meta:"Video call · any property",
   feat:["Floor plan and photo review","Key problem zones identified","Pyramid remedies explained on the call","Ideal for a quick, focused question"],
   calendly:"https://calendly.com/YOUR-HANDLE/online-consultation"},
  {id:"online-report",mode:"online",name:"End-to-End Online Consulting",price:2990,unit:"with report",tag:"Most chosen",meta:"Complete online consultation",
   feat:["Full review of floor plan and photos","Positive and negative zones mapped","Written report with pyramid remedies","Nirantar follow-up as you apply them"],
   calendly:"https://calendly.com/YOUR-HANDLE/end-to-end-online"},
  {id:"commercial",mode:"online",name:"Commercial Spaces",price:9000,unit:"onwards",meta:"Offices, shops, showrooms, clinics",
   feat:["Review of layout and seating","Cash, entrance and work zones checked","Pyramid solutions for business growth","Final fee depends on size and nature"],
   calendly:"https://calendly.com/YOUR-HANDLE/commercial"},
  {id:"visit-2bhk",mode:"person",name:"Home Site Visit",price:15000,unit:"up to 2 BHK",meta:"Mumbai · homes up to 2 BHK",
   feat:["On-site examination of every room","Positive and negative zones mapped","Pyramid remedies placed on site","Report and Nirantar follow-up"],
   calendly:"https://calendly.com/YOUR-HANDLE/home-visit-2bhk"},
  {id:"visit-large",mode:"person",name:"Large Home Site Visit",price:21000,unit:"above 2 BHK",tag:"For larger homes",meta:"Mumbai · homes larger than 2 BHK",
   feat:["On-site examination of every room","Positive and negative zones mapped","Pyramid remedies placed on site","Report and Nirantar follow-up"],
   calendly:"https://calendly.com/YOUR-HANDLE/home-visit-large"},
  {id:"visit-factory",mode:"person",name:"Factories & Large Sites",price:25000,unit:"onwards",meta:"Factories, plots and large premises",
   feat:["Full site survey","Plot shape, size and layout assessment","Pyramid solutions across the premises","Final fee depends on size and nature"],
   calendly:"https://calendly.com/YOUR-HANDLE/factories-large-sites"}
];

const PRODUCTS = [ // price:null shows "Price on request" with a WhatsApp button. Add a number to sell it online.
  {id:"center-activator",cat:"Pyramids",name:"Center Activator Pyramid",price:null,desc:"Placed at the centre of the home (Brahmasthan) to activate and balance the whole space.",details:["Used for the central zone of homes and offices","Placement guidance included"],art:"pyramid"},
  {id:"bathroom-separator",cat:"Yantras",name:"Bathroom Separator Yantra",price:null,desc:"Used where a bathroom or toilet sits in a sensitive zone, to contain its effect.",details:["For bathrooms and toilets in the wrong zone","Placement guidance included"],art:"yantra"},
  {id:"personal-energy",cat:"Yantras",name:"Personal Energy Activator Yantra",price:null,desc:"A personal yantra to support your own energy, focus and confidence.",details:["Kept with you or at your workspace","Placement guidance included"],art:"yantra"},
  {id:"wealth-activator",cat:"Activators",name:"1 Rupee Wealth Activator",price:null,desc:"A wealth activator for your cash box, locker or wallet.",details:["For lockers, cash counters and wallets","Placement guidance included"],art:"coin"},
  {id:"car-yantra",cat:"Yantras",name:"Car Yantra",price:null,desc:"Kept in your vehicle for protection and positive energy on the road.",details:["Fits on the dashboard","Placement guidance included"],art:"yantra"},
  {id:"work-desk",cat:"Yantras",name:"Work Desk Yantra",price:null,desc:"Placed on your desk to support focus, productivity and growth at work.",details:["For office and home work desks","Placement guidance included"],art:"yantra"},
  {id:"study-yantra",cat:"Yantras",name:"Study Yantra",price:null,desc:"For a student's study table to support concentration and learning.",details:["For study tables and children's rooms","Placement guidance included"],art:"yantra"}
];

const CREDENTIALS = [
  ["Roots","Founded by Mr. Yogesh Purohit","Among the first Pyramid Vastu consultants in India"],
  ["25+ yrs","Over two decades of practice","Homes, plots, offices and health"],
  ["3,000+","Clients served","Mostly through referrals and word of mouth"],
  ["Today","Rahul Purohit leads the practice","Online and in-person consultations"]
];

const TESTIMONIALS = [/* add real client quotes here as ["quote","Name, City"] */
];

const FAQ = [
  ["When should I consult a Vastu expert?","Before buying a property, while planning interiors, when illness keeps recurring in the household, when weighing a marriage proposal, during frequent family conflict, or when choosing a career."],
  ["Will I have to make structural changes?","Not for an existing property. We suggest remedies only, using pyramids. For a property that isn't built yet, we may recommend some changes to the plan."],
  ["How are charges decided?","Charges depend on the size and nature of the property. The prices shown are what you pay to book; any balance is confirmed before the consultation."],
  ["What do I need for an online consultation?","A floor plan (hand-drawn is fine if it's to scale), the direction of your main entrance, and a short video walk-through on your phone. We send a checklist after you book."],
  ["Can I reschedule?","Yes. Use the reschedule link in your Calendly confirmation up to 24 hours before your slot."],
  ["Do you travel outside Mumbai?","Yes. Travel and stay outside the city are charged at actuals and agreed before the visit."]
];

const ZONES = [
  ["N","North","Money and new opportunities"],["NNE","North-north-east","Health and immunity"],["NE","North-east","Clarity of mind, prayer"],["ENE","East-north-east","Fun and recreation"],
  ["E","East","Social connections"],["ESE","East-south-east","Churning and analysis"],["SE","South-east","Cash flow and liquidity"],["SSE","South-south-east","Strength and confidence"],
  ["S","South","Fame and rest"],["SSW","South-south-west","Disposal and letting go"],["SW","South-west","Relationships and skills"],["WSW","West-south-west","Education and savings"],
  ["W","West","Gains and profits"],["WNW","West-north-west","Detox and release"],["NW","North-west","Support and banking"],["NNW","North-north-west","Attraction and intimacy"]
];

const POLICIES = {
  terms:["Terms of service",`<p>These terms apply to consultations and products bought from ${CONFIG.business}. By booking or ordering you agree to them.</p><h3>Consultations</h3><p>Vastu guidance is advisory. Results depend on many factors and are not guaranteed. Consultations are delivered at the booked time by video call or site visit.</p><h3>Pricing</h3><p>Prices are in Indian rupees and include GST unless stated. Packages marked "onwards" may carry a balance based on area, confirmed before the consultation.</p><h3>Contact</h3><p>${CONFIG.email} · ${CONFIG.phone}</p>`],
  privacy:["Privacy policy",`<p>We collect your name, contact details, address and floor plans only to deliver your consultation or order.</p><h3>Payments</h3><p>Payments are processed by Razorpay. We never see or store your card or UPI details.</p><h3>Bookings</h3><p>Scheduling is handled by Calendly, which stores your name, email and booking time.</p><h3>Your data</h3><p>We do not sell or share your information. Write to ${CONFIG.email} to see or delete what we hold.</p>`],
  refund:["Refunds & cancellation",`<h3>Consultations</h3><p>Cancel more than 48 hours before your slot for a full refund. Within 48 hours you can reschedule once at no charge. No refund after the consultation has taken place.</p><h3>Products</h3><p>Products damaged in transit are replaced free. Report within 48 hours of delivery with a photo. Energised products cannot be returned once opened.</p><h3>Refund timing</h3><p>Approved refunds go back to the original payment method within 5–7 working days.</p>`],
  shipping:["Shipping policy",`<p>We ship across India through trusted courier partners.</p><h3>Dispatch</h3><p>Orders are energised and dispatched within 2–3 working days.</p><h3>Delivery</h3><p>Delivery takes 3–7 working days depending on location. Tracking is shared on WhatsApp.</p><h3>Charges</h3><p>₹${CONFIG.shippingFlat} per order, free above ₹${CONFIG.freeShippingOver.toLocaleString("en-IN")}.</p>`]
};
