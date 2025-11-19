# YBudget 💰

> Open-source budget management for german associations.

YBudget helps german (non profit) associations manage their budgets when managing them in Excel gets too complicated. It was built by [Joël Heil Escobar](https://www.linkedin.com/in/joel-heil-escobar) as a capstone project at [CODE University](https://code.berlin/) as his co-founded organization, the [Young Founders Network e.V.](https://youngfounders.network) was in desperate need for such a solution.

**The problem?**
Most budget tools are too expensive or too complex for associations to use.

**Our solution?**
Simple, affordable, and open-source.

## Features

- 📊 **Budget Planning:** Organize projects by donors and already mark expected income and expenses
- 💳 **Transaction Import:** Import CSV from Sparkasse, Volksbank, & Moss and use smart matching to match expected expenses with the actual bank ones
- 🎯 **Project Organization:** Assign expenses to projects, see remaining budgets at a glance

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Convex](https://img.shields.io/badge/Convex-FF6F00?style=for-the-badge&logo=convex&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)

## Self-Hosting

YBudget is fully self-hostable. Connect it to your own Convex backend and deploy it on your favorite platform (I used Vercel).

**Prerequisites:** Node.js 20+, pnpm, [Convex account](https://www.convex.dev/) (free tier available)

**Quick Start:**

```bash
# Clone and install
git clone https://github.com/yourusername/ybudget.git
cd ybudget
pnpm install

# Set up Convex
npx convex dev

# Configure environment variables
cp env.example .env.local
# Edit .env.local with your Convex URLs
# Set google auth & stripe variables in Convex Dashboard → Settings → Environment Variables

# Run locally
pnpm dev
```

**Environment Variables:**

- See `env.example` for required variables
- Set `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
- Set `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `SITE_URL`, and optional Stripe keys in Convex Dashboard

**Deploy:**

```bash
npx vercel          # Deploy Next.js
npx convex deploy   # Deploy Convex functions
```

## Contributing

We're building a tool to support NGOs on their mission to make budgeting as easy as possible. Would be awesome to have you on board 🙌

**How to contribute:**

1. Fork the repo
2. Clone your fork locally (`git clone https://github.com/YOUR-USERNAME/ybudget.git`)
3. Create a feature branch (`git checkout -b feat/amazing-feature`)
4. Make and commit your changes
5. Push to your fork (`git push origin feat/amazing-feature`)
6. Open a Pull Request

**Ideas, feedback, or questions?**  
📧 [team@ybudget.de](mailto:team@ybudget.de) | 🐛 [Open an issue](https://github.com/joelheile/ybudget/issues)

## Security

We take security seriously at YBudget. Here's how we protect your financial data and keep operations safe for NGOs.

#### Authentication & Authorization

**1. OAuth instead of Password**

- We use OAuth 2.0 with Google instead of traditional username/password authentication
- Eliminates frequent password vulnerabilities (weak passwords or password reuse by user)
- Implemented with [Convex Auth](https://labs.convex.dev/auth) → Google Provider in `convex/auth.ts`

**2. Organizational Isolation**

- Every database query is filtered by `organizationId` to make sure that data is seperated between organizations
- Organizations can only access their own transactions, projects, donors, and financial data
- All queries use indexed filters similar to `.withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))`

**3. Role-Based Access Control**

- Implemented permission levels, after talking to first potential customers
- `viewer` (read-only) → `editor` (can edit) → `finance` (can edit and match transactions) → `admin` (full control over users, projects, etc.)
- Functions check minimum required roles before executing sensitive operations
- `requireRole(ctx, "admin")` validates permissions through `convex/users/permissions.ts`

**4. Team-Based Permissions**

- Project level access control to limit visibility on projects
- Only Admins and finance roles have organization wide access, everyone else is restricted to team projects
- Functions can be found in `convex/teams/permissions.ts`

#### Data Protection

**5. Environment Variable Security**

- All credentials (OAuth secrets, Stripe keys, JWT keys, etc.) are stored server side in Convex Dashboard
- Client never receives API keys or secrets, so that only public keys are exposed to browsers

**6. HTTPS Enforcement**

- All production traffic is encrypted using TLS, enforced by Convex Hosting and Next.js
- This protects against man-in-the-middle attacks and stops people from eavesdropping on financial data

**7. Preventing NoSQL injections**

- Convex uses type-safe queries to prevents NoSQL injection attacks
- All database operations use typed query methods, not string concatenation and are validated when compiling

### API Security

**8. Input Validation**

- Every function argument is validated at runtime using Convex validators, so that we can make sure that the data is correct
- This prevents malformed data from entering the system

**9. Internal vs Public Functions**

- We separate sensitive operations (like payment fulfillment, user management) into internal functions
- These internal functions can only be called from our backend (not from client code)

#### Third Party Integration Security

**10. Stripe Webhook Verification**

- Every Stripe webhook is verified before we process it using `STRIPE_WEBHOOKS_SECRET`
- This way, attackers can't fake payment confirmations

**11. Secure Payment Processing**

- We don't store any credit card data, as we can rely on Stripe as market leader for that
- Subscriptions are managed through Stripe's customer portal and only the subscriptionId and customerId is saved in our database

### Session Management

**12. Secure Session Handling**

- We use Convex Auth to manage sessions with JWT tokens and automatic token rotation
- Sessions expire automatically and users need to re-authenticate after some time
- Tokens are stored using httpOnly cookies, so JavaScript can't access them

**📋 Threat Model:**
For a comprehensive threat analysis including STRIDE analysis and our data flow chart have a look at our [Threat model](security/Threatmodel.md)

---

**Found a security issue?**
Please email team@ybudget.de with details. We take security seriously and will respond asap.

---

Built with ❤️ by the Young Founders Network team
