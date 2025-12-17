# YBudget 💰

> Open-source budget management for german associations.

YBudget helps german (non profit) associations manage their budgets when Excel gets too complicated. It is built by [Joël Heil Escobar](https://www.linkedin.com/in/joel-heil-escobar) as a [CODE University](https://code.berlin/) Capstone project. The initial idea came when the [Young Founders Network e.V.](https://youngfounders.network) got into desperate need of such a solution.

**The problem?**
Most budget tools are too expensive or too complex for associations to use. While Excel is flexible, it is also plenty of work keeping track of all the expenses that go in and out.

**Our solution?**
Simple, affordable, intuitive and open-source.

## Features

- 📊 **Dashboard & Charts:** Visualize cashflow with income, expenses, and balance trends
- 💳 **Transaction Import:** Import CSV from Sparkasse, Volksbank, & Moss
- 🔄 **Budget Transfers:** Move budgets between projects when plans change
- 🎯 **Project Organization:** Assign expenses to projects, see remaining budgets at a glance
- 🧾 **Reimbursements:** Submit expense and travel reimbursements with receipt uploads
- 🎁 **Volunteer Allowance:** "Ehrenamtspauschale" forms with shareable links for external signatures
- 🤖 **AI Assistant:** Chat with your budget data (admin/lead only) to get transactions, todos in form of expected transactions and open reimbursements via natural language
- 👥 **Team Management:** Organize members into teams with project access control
- 📤 **Donor Export:** Export transactions by donor to CSV
- ✉️ **Email Invitations:** Invite team members via email (powered by Resend)
- 🎓 **Guided Onboarding:** Interactive tour for new users
- 📝 **Audit Logs:** Track all actions for transparency and compliance

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Convex](https://img.shields.io/badge/Convex-FF6F00?style=for-the-badge&logo=convex&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)

## Architecture

YBudget uses Next.js 15 App Router with protected and public routes:

- `app/(public)/` → Login and public pages
- `app/(protected)/` → Authenticated dashboard with sidebar navigation

Data flows through Convex for real-time sync. Every query is scoped by `organizationId` for data isolation.

**[Database Schema](docs/schema.md)** - Full ER diagram with all tables and relationships

## Self-Hosting

**Prerequisites:** Node.js 20+, pnpm, [Convex account](https://www.convex.dev/)

### 1. Clone & Install

```bash
git clone https://github.com/joelheile/ybudget.git
cd ybudget
pnpm install
npx convex dev  # Creates .env.local with CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL
```

### 2. Initialize Auth

```bash
npx @convex-dev/auth
```

### 3. Set Up Google OAuth to get auth working

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `https://<your-convex-deployment>.convex.site/api/auth/callback/google`
4. Copy Client ID and Client Secret

### 4. Configure Environment Variables

Set in Convex Dashboard → Settings → Environment Variables
or via CLI:

```bash
npx convex env set AUTH_GOOGLE_ID "your-google-client-id"
npx convex env set AUTH_GOOGLE_SECRET "your-google-client-secret"

# Optional
npx convex env set OPENAI_API_KEY "sk_proj_"
npx convex env set RESEND_API_KEY "re_..."
npx convex env set STRIPE_KEY "sk_test_..."
npx convex env set STRIPE_WEBHOOKS_SECRET "whsec_..."
```

### 5. Run

```bash
pnpm dev
```

### 6. Deploy

```bash
npx convex deploy
npx vercel
```

Update `SITE_URL` to your production URL after deploying.

## Contributing

We're building a tool to support NGOs on their mission by making budgeting as easy as possible. Would be awesome to have you on board and ship ideas with us 🙌

**This is how you contribute:**

1. Fork the repo
2. Clone your fork locally (`git clone https://github.com/YOUR-USERNAME/ybudget.git`)
3. Create a feature branch (`git checkout -b feat/amazing-feature`)
4. Make and commit your changes
5. Push to your fork (`git push origin feat/amazing-feature`)
6. Open a Pull Request

**Ideas, feedback, or questions?**
📧 [team@ybudget.de](mailto:team@ybudget.de) | 🐛 [Open an issue](https://github.com/joelheile/ybudget/issues)

## Testing

Through using vitest, the project got a 100% test coverage on lines, functions and ~96% on branch for unit and integration tests.

```bash
pnpm vitest run              # Unit & integration tests
pnpm vitest run --coverage   # Get test coverage report
pnpm exec playwright test    # E2E tests
```

GitHub Actions runs both test suites on every push and PR.

## Security

OAuth 2.0, role-based access control, organizational data isolation, encrypted at rest.

**[Security Details](docs/Security.md)** | **[Threat Model](docs/ThreatModel.md)**

Found an issue? Email team@ybudget.de

---

Built with ❤️ by the Young Founders Network team
