# Rituchakkra Vastu website: going live

This folder is your full website. It runs on Netlify (the free plan is enough), takes payments through Razorpay and bookings through Calendly.

## What's in the folder

| Address | File |
|---|---|
| rituchakkravastu.com/ | `index.html` |
| /about/ | `about/index.html` |
| /consultations/ | `consultations/index.html` |
| /shop/ | `shop/index.html` |
| /book/ | `book/index.html` (a package can be linked directly, e.g. `/book/?package=online-report`) |
| /contact/ | `contact/index.html` |
| /policies/ | `policies/index.html` |
| /checkout/ | `checkout/index.html` (hidden from Google) |

Each page has its own title and description for Google, and a link preview (`og-image.jpg`) that shows when the link is shared on WhatsApp, Instagram, Facebook or LinkedIn. `sitemap.xml` and `robots.txt` help Google find every page.

The pages share three files:
- `js/settings.js`: **the file you edit.** Contact details, packages and prices, products, FAQs, credentials and policies.
- `js/app.js`: how the site works. You don't need to touch it.
- `css/site.css`: the design.

## 1. Your details
Open `js/settings.js`. Everything you will usually change is there:
- `CONFIG`: WhatsApp number, phone, email, address, hours, shipping charges, Razorpay key
- `PACKAGES`: names, prices, inclusions and the Calendly link for each
- `PRODUCTS`: set `price: null` to show "Price on request" with a WhatsApp button, or a number (e.g. `price: 1100`) to sell it online with the cart. To show a photo, add `img: "/images/car-yantra.jpg"` and upload the photo into `images/`.

The page wording (headlines, about text, services, process) is inside each page's HTML. Ask Claude to change it so all pages stay in sync.

## 2. Calendly
1. Create one event type per package in Calendly.
2. In each event add a first custom question, "Payment and contact details". The site fills it in with the Razorpay payment ID, phone and city.
3. Paste each event's link into the matching package's `calendly` field.

## 3. Razorpay
1. Sign up at razorpay.com and complete KYC. Give them these links: Terms, Privacy, Refund and Shipping at `rituchakkravastu.com/policies/`, contact at `rituchakkravastu.com/contact/`.
2. Dashboard → Account & Settings → API Keys → generate **Test mode** keys first.
3. Put the **Key ID** (`rzp_test_…` or `rzp_live_…`) in `CONFIG.razorpayKey` in `js/settings.js`.
4. In Netlify → Site configuration → Environment variables add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (the secret never goes in any website file).
5. Test with Razorpay's test UPI and cards, then switch to live keys.

## 4. Publish on Netlify
Because the site has payment functions (the `netlify/functions` folder), publish it from GitHub so Netlify sets those up:
1. Create a free GitHub account, make a new private repository, and upload everything in this folder.
2. In Netlify: Add new site → Import an existing project → GitHub → pick the repository. Leave the build settings empty and deploy.
3. Add the two Razorpay environment variables, then redeploy.
4. Check Netlify → Functions lists `create-order` and `verify-payment`.
5. Domain management → add `rituchakkravastu.com` and follow the DNS steps. HTTPS is automatic.

Any later change you upload to GitHub goes live automatically within a minute.

If your domain is not rituchakkravastu.com, ask Claude to rebuild: the address is written into each page's link preview and the sitemap.

## 5. Check the link preview
After the site is live, paste `https://rituchakkravastu.com` into a WhatsApp chat (send it to yourself). You should see the logo, "Make it without breaking it." and the page title. WhatsApp and Facebook remember previews; if you change the image later and still see the old one, open developers.facebook.com/tools/debug, paste the address and press "Scrape again".

## 6. After launch
- Google Search Console (search.google.com/search-console): add your domain and submit `https://rituchakkravastu.com/sitemap.xml` so Google indexes every page.
- Old links ending in `#about`, `#shop` and so on still work and move to the new addresses.

## While you're setting up
- With `razorpayKey` empty the site shows a labelled test payment screen and charges nothing.
- With `YOUR-HANDLE` still in a Calendly link the site shows a sample calendar.
- A small "Preview" note bottom-left lists what is still in test mode. It disappears once both are set.
