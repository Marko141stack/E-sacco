# E-SACCO web application

A mobile-first React web app for saving towards, financing and purchasing approved electric-cooking appliances. Zimba SACCO is the approved SACCO, Vermaak is the technology partner, and checkout is handed off to exact EventSuite payment links maintained in the CMS.

## What is included

- Member dashboard, savings goal and transaction views
- Approved appliance marketplace and product comparison information
- Indicative loan eligibility and repayment view
- Zimba SACCO, group savings, Fumba Hub referral, education and support sections
- Password-protected CMS for products, prices, images, announcements and public site copy
- Editable EventSuite payment URL for every product
- Supabase database, authentication and Row Level Security migration
- Netlify build, SPA redirects and security headers
- Demo mode that runs without cloud credentials

## Technology

- React + TypeScript + Vite
- Supabase for CMS data and administrator authentication
- Netlify for hosting
- EventSuite for external payment collection

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite. The public app is at `/`; the CMS is at `/admin`.

Without Supabase environment variables, the app runs in demo mode. CMS changes are saved only in that browser's local storage. Demo mode is for review, not production.

## Configure the production CMS

1. Create a Supabase project.
2. Open its SQL Editor and run `supabase/migrations/001_esacco_cms.sql`.
3. In Supabase Authentication, create an email/password user for each approved administrator.
4. Copy that user's UUID and run the following in the SQL Editor:

```sql
insert into public.profiles (id, full_name, role)
values ('AUTH-USER-UUID', 'Administrator Name', 'cms_admin')
on conflict (id) do update set role = excluded.role;
```

5. In Supabase Authentication settings, add the production Netlify URL to the allowed Site URL and redirect URLs.
6. Copy `.env.example` to `.env` and add the project URL and anonymous key. Never put a Supabase service-role key in this frontend.

Row Level Security allows everyone to read published content while only authenticated users whose profile has `cms_admin` or `super_admin` access can change CMS data.

## Configure EventSuite payment links

EventSuite is implemented as a safe hosted-checkout handoff:

1. Create or obtain the relevant payment link in EventSuite.
2. Sign into `/admin`.
3. Open **Products and payments**.
4. Paste the exact HTTPS EventSuite URL into the appliance's **EventSuite payment link** field.
5. Save changes and test the button from the public marketplace.

The starter does not invent EventSuite URL parameters or mark a payment as completed after redirect. A verified callback/webhook or an authorised reconciliation process must be agreed with EventSuite before automatic fulfilment is enabled. The `payment_handoffs` table is included for that later integration.

## Deploy to Netlify from GitHub

1. Create an empty GitHub repository.
2. From this project folder, run:

```bash
git init
git add .
git commit -m "Initial E-SACCO web app"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
git push -u origin main
```

3. In Netlify, select **Add new site → Import an existing project**, then choose the GitHub repository.
4. Netlify reads `netlify.toml`; the build command is `npm run build` and the publish directory is `dist`.
5. Add these environment variables in **Site configuration → Environment variables**:

```text
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
VITE_DEFAULT_EVENTSUITE_URL=https://events.vermaak.africa/YOUR-EXACT-PAYMENT-LINK
```

6. Deploy, then verify the public app, `/admin`, one CMS edit and every EventSuite link.

## Roles and boundaries

- **Zimba SACCO:** membership, KYC, savings, credit decisions, repayment terms and financial records.
- **Vermaak:** application technology, CMS administration support and EventSuite linkage.
- **NREP:** programme coordination and stakeholder alignment.
- **Fumba Hub:** receives purchase referrals only where the member has consented and the operating agreement permits it.

Savings balances, eligibility and loan data in this starter are demonstration data. Connect them to approved Zimba SACCO services before production use. Do not treat the current indicative eligibility screen as a credit offer.

## Production checklist

- Replace all demo contact details, images, prices and payment links in the CMS.
- Confirm privacy notice, terms, consent language and data-retention rules.
- Complete Zimba SACCO security and financial-control review.
- Restrict CMS accounts and enable multi-factor authentication where available.
- Confirm EventSuite callback, reconciliation and refund procedures.
- Connect real member, savings and loan services through server-side functions—not secret keys in the browser.
- Test small-screen accessibility, low-bandwidth behaviour and all external links.
- Add monitoring, backups and an incident-response contact.

## Commands

```bash
npm run dev       # local development
npm run typecheck # TypeScript validation
npm run build     # production build
npm run preview   # preview the production build
```
