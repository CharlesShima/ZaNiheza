# ZaNiheza website + admin

React (Vite) website for ZaNiheza Tour Operator, with a back office for the team.

- **Website:** home, 4 experience pages (Kigali Yacu, Sura Ahandi, Umwimerere, Umwami), packages with day-by-day itineraries, prices and departure dates, about, contact. Mobile menu, SEO tags, sitemap, WhatsApp button everywhere.
- **Back office (`/admin`):** packages with an itinerary builder, dates & availability, experiences, hotels, vehicles, attractions & museums, inquiries & bookings, website settings (logo, hero image, contacts), team roles.
- **Backend:** Supabase (free tier): database, team logins, image storage. No server to maintain.
- **Hosting:** any Hostinger plan. GitHub uploads the site to Hostinger every time you save changes to the code.

## The three users

| User | What they do |
|---|---|
| Traveler | Browses the site, sends an inquiry or a booking request for a departure date, or messages on WhatsApp. No account needed. |
| Advisor (travel consultant) | Logs in to `/admin`. Answers inquiries, assigns them, adds notes, builds packages, manages hotels, vehicles, attractions and dates. |
| Admin (you) | Everything advisors do, plus deleting, website settings (logo, hero image, contacts) and giving people roles. |

---

## Day 1: get it running (about 3 to 4 hours)

### 1. Put the code on GitHub
1. Create a free account at github.com, then **New repository**, name it `zaniheza-website`, set it to **Private**.
2. Upload all files from this folder (drag and drop on the repository page works), including the hidden `.github` folder and `public/.htaccess`.
   If drag-and-drop skips hidden files, install GitHub Desktop and publish the folder from there.

### 2. Create the backend (Supabase)
1. Sign up at supabase.com, then **New project**. Region: choose the closest (e.g. Frankfurt or London). Save the database password somewhere safe.
2. Open **SQL Editor**, then **New query**, paste everything in `supabase/schema.sql`, and click **Run**. This creates all tables, security rules, the image storage and your brochure content.
3. Go to **Authentication > Users > Add user**, create your login (e.g. muraho@zaniheza.com with a strong password, tick "Auto confirm").
4. Back in **SQL Editor**, run:
   ```sql
   update profiles set role = 'admin' where email = 'muraho@zaniheza.com';
   ```
5. Go to **Authentication > Sign In / Providers** and turn off **Allow new users to sign up** (only invited team members can log in).
6. Go to **Authentication > URL Configuration** and set Site URL to `https://zaniheza.com`.
7. Go to **Project Settings > API** and copy the **Project URL** and the **anon public** key.

### 3. Connect GitHub to Hostinger
1. In Hostinger hPanel go to **Files > FTP Accounts** and note the FTP host, username and password (or create a new FTP account).
2. In your GitHub repository go to **Settings > Secrets and variables > Actions > New repository secret** and add:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
   | `VITE_SITE_URL` | `https://zaniheza.com` |
   | `VITE_WEB3FORMS_KEY` | Optional, see step 4 |
   | `FTP_SERVER` | e.g. `ftp.zaniheza.com` or the IP Hostinger shows |
   | `FTP_USERNAME` | Hostinger FTP username |
   | `FTP_PASSWORD` | Hostinger FTP password |

3. Go to the **Actions** tab, open **Deploy to Hostinger**, click **Run workflow**. After about 2 minutes your site is live at zaniheza.com.
4. In hPanel, make sure **SSL** is active for the domain.

> If `public_html` already contains an old site, back it up first. The deploy uploads into `public_html/`. If your FTP account opens directly inside `public_html`, change `server-dir: public_html/` to `server-dir: ./` in `.github/workflows/deploy.yml`.

### 4. Get inquiry emails (optional, 2 minutes)
Every inquiry is saved in the admin automatically. To also receive each one by email, get a free access key at web3forms.com using muraho@zaniheza.com, add it as the `VITE_WEB3FORMS_KEY` secret, and run the workflow again.

## Day 2: fill it with your content

1. Open `https://zaniheza.com/admin` and log in.
2. **Website settings:** upload your logo (transparent PNG or SVG) and a wide hero photo (the Kigali Convention Centre photo from the brochure works well). Check email and WhatsApp.
3. **Experiences:** add a cover image and gallery to each of the four.
4. **Catalog:** add your hotels (with cost per night), vehicles (cost per day) and attractions & museums (fees).
5. **Packages:** create each package, pick the experience, then use the itinerary builder: add days, pick the overnight hotel and attractions for each day. The cost box shows your base cost, so you can set your selling price in "Price from". Tick "Show on website".
6. **Dates & availability:** add fixed departure dates with the number of places. Travelers can pick one when booking; dates show as full automatically when places booked reaches the total.
7. **Team & roles:** invite each advisor in Supabase (**Authentication > Users > Invite user**). When they appear in Team & roles, set them to `advisor`. They set their password under **My account**.
8. Submit a test inquiry from the website and check it appears in **Inquiries & bookings**.
9. Submit `https://zaniheza.com/sitemap.xml` in Google Search Console.

From now on, content changes in `/admin` appear on the site immediately. Only code changes need a deploy, which GitHub does automatically when you push to `main`.

## Working on the code locally (optional)
```bash
npm install
cp .env.example .env.local   # fill in your Supabase values
npm run dev                  # http://localhost:5173
```

## Phase 2 ideas
- Online deposits (Flutterwave or Stripe) on booking requests.
- Traveler accounts to see their trip and documents.
- French and Kinyarwanda versions.
- Automatic quote PDF from a package's itinerary.
- Moving to Next.js on Hostinger Node.js hosting for server-rendered pages, if SEO competition demands it.
