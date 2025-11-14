# YBudget 💰

> Open-source budget management built for NGOs, by NGOs.

YBudget helps german non profit associations manage their budgets when Excel isn't enough anymore. Built as a capstone project at [CODE University](https://code.berlin/) for the [Young Founders Network e.V.](https://youngfounders.network) by [Joël Heil Escobar](https://www.linkedin.com/in/joel-heil-escobar)

**The problem?** Most budget tools are too expensive, too complex, or don't provide the transparency non-profits need.

**Our solution?** Simple, affordable, and open-source.

## Features

- 📊 **Budget Planning** - Organize projects by donors, track expenses in real-time, get warnings when approaching limits
- 💳 **Transaction Import** - Import CSV from all German banks (Sparkasse, Volksbank, & Moss) with smart matching
- 🎯 **Project Organization** - Assign expenses to projects, see remaining budgets at a glance

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
# Set auth/stripe variables in Convex Dashboard → Settings → Environment Variables

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

We're building the next generation of software for NGOs and we'd love your help on our mission to make budgeting as easy as possible 🙌

**How to contribute:**

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes
4. Open a Pull Request

**Ideas, feedback, or questions?**  
📧 [team@ybudget.de](mailto:team@ybudget.de) | 🐛 [Open an issue](https://github.com/yourusername/ybudget/issues)

## About

Built by Joël, one of the founders of the [Young Founders Network e.V.](https://youngfounders.network) a non-profit supporting young founders through startup resources, community, and entrepreneurial education.

This started as a capstone project at [CODE University](https://code.berlin/) to solve our own budget management challenges. Now we're open-sourcing it for other NGOs.

---

Built with ❤️ by the Young Founders Network team
