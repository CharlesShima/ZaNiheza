# ZaNiheza: Africa’s Friendliest Travel Community

React (Vite) website + Supabase (database, logins, photos) + Netlify (hosting and Stripe payment functions).

## What changed in this update
- New landing page in this order: Hero, The Idea, Community First, How it works, Join, Host a Trip, Stories, Our First Trips, FAQ.
- One top header everywhere: Trips, Hosts, Community, Join, Admin (all visible on phones).
- Members sign in with Google (or an email link), fill an 8-question profile and see “Matched for you” Trips (rule-based: towns, dates, interests, languages).
- Hosts apply, get vetted in Admin, then add Trips. Trips stay “Pending review” until ZaNiheza approves them and sets the price.
- Book instantly with Stripe Checkout. Seats update automatically after payment. Paid travellers get the Trip chat link.
- Reviews only from travellers who paid and went. Stories have their own pages. “Reels” is renamed Stories everywhere.
- Admin = CMS: Trips, Bookings, Hosts, Trip chat links, Stories, Reviews, FAQ, Website settings & page text. The private Umwimerere tools (packages, hotels…) are kept under “Private”.
- Honesty rules built in: no invented hosts, prices, reviews, members or photos. Empty states say so plainly.

## Go live: step by step

### 1. Update the code on GitHub
Replace the contents of your `zaniheza` folder with this one (GitHub Desktop is easiest: copy the files over, then “Commit” and “Push”).
Hidden items to include: `public/_redirects`, `netlify/` folder.

### 2. Update the database (Supabase)
1. Supabase > SQL Editor > New query: paste all of `supabase/migration-2026-11-community.sql` and Run. (Your old `schema.sql` is already done; don’t run it again.)
2. Authentication > Sign In / Providers: turn **ON** “Allow new users to sign up” (travellers need it now).
3. Authentication > URL Configuration: Site URL `https://zaniheza.com`; add `https://zaniheza.com/**` to Redirect URLs.

### 3. Google sign-in (15 minutes)
1. console.cloud.google.com > create a project “ZaNiheza” > APIs & Services > OAuth consent screen: External, app name ZaNiheza, your email, publish.
2. Credentials > Create credentials > OAuth client ID > Web application.
   Authorised redirect URI: `https://fjcrksjuxwdeseeztbac.supabase.co/auth/v1/callback`
3. Copy the Client ID and Client secret into Supabase > Authentication > Sign In / Providers > Google > Enable > Save.

### 4. Stripe payments
1. dashboard.stripe.com (start in **Test mode**). Developers > API keys: copy the **Secret key** (`sk_test_…`).
2. Developers > Webhooks > Add endpoint: `https://zaniheza.com/.netlify/functions/stripe-webhook`
   Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`. Copy the **Signing secret** (`whsec_…`).
3. Netlify > Project configuration > Environment variables, add:

| Key | Value | Secret? |
|---|---|---|
| `STRIPE_SECRET_KEY` | sk_test_… (later sk_live_…) | Yes |
| `STRIPE_WEBHOOK_SECRET` | whsec_… | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API Keys > service_role (Legacy tab) | Yes |
| `VITE_STRIPE_ENABLED` | `true` | No |
| `SITE_URL` | `https://zaniheza.com` | No |

Keep your existing `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_WEB3FORMS_KEY`.
4. Deploys > Trigger deploy > Clear cache and deploy site.
5. Test: Admin > Trips > set a price on a Trip > open it on the site > Book instantly > pay with card `4242 4242 4242 4242`, any future date, any CVC. Check Admin > Bookings shows “paid” and the seats went up.
6. When happy, switch Stripe to Live mode and replace the two Stripe values with live ones (and create the webhook again in Live mode).

Prices are per person in the Trip’s currency. RWF works too (Stripe treats it as a whole-number currency; the code handles that).

### 5. Fill in content (Admin)
- Website settings & text: paste the WhatsApp Community invite link (it appears once, in Community First). Edit any page text.
- Trips: confirm hosts and prices as they’re agreed. Add the chat link per Trip under “Trip chat links”.
- Hosts: vet applications (15-minute call/coffee), then set status to approved.
- Stories: after each pilot, add real photos, video link and quotes, then set status to published.

## Preview
`npm run build:demo` makes `dist-demo/index.html`: one file with sample data (no fake prices or hosts) to click through as visitor, traveller or admin.

## Notes
- The Kigali video in Community (`public/media/kigali-sunday.mp4`) came from a social post: confirm you have permission before launch, or delete the file and the `<KigaliVideo />` lines.
- Old addresses (/experiences, /packages, /reels) redirect to the new pages.
