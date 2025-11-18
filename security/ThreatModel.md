## Data Flow Diagram (Level 1)

To analyze the underlying security and data streams of yBudget better, I have created a Level 1 Data Flow Diagram.
It is kept high level, to better point out trust boundaries between services and processes.

**What are trust boundaries?**
Trust Boundaries show transition points where data moves between zones with different security standards. The trust level changes and therefore requires specific security controls.
We do this by validating and authenticating data before being accepted into higher trust zones and minimizing, encrypting and protecting data going out to less trusted sources.

### Our Trust Zones

I've organized YBudget into five security zones, each with different trust levels and protection mechanisms.

**Public Zone (Untrusted)**

User browsers and devices are here and I can't directly control them. Since the device or browser could be compromised or even malicious, I need to treat all input as hostile and validate everything before it enters the system.

**External Services (Untrusted)**

I trust Google OAuth, Stripe, Resend, and Posthog, but can't control their code as it is closed source. I protect these integrations with API key protection, webhook signature verification, and TLS encryption for all communications.

**Frontend Zone (Semi-Trusted)**

My Next.js application runs on Vercel (Deployment infrastructure) and in user browsers. It's my code, but in environments I don't fully control. I enforce client-side validation, Content Security Policy headers, and HTTPS to keep things secure.

**Backend Zone (Trusted)**

The Convex backend is where the real business logic lives in a fully controlled environment. Every request goes through authentication checks (role-based, team and organization).

**Data Zone (Most Trusted)**

The database is my single source of truth and must be secured at all costs. I use organization-scoped queries, parameterized queries to prevent injection and comprehensive audit logging to keep it secure.

![Data Flow Diagram](/security/Data%20Flow%20Diagram.png)
_(Diagram was created in FigJam)_

## Trust Boundary Analysis using STRIDE

For this analysis, I used the **STRIDE** framework (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Escalation of Privileges) to identify where YBudget is strong and where it needs improvement. Here's what I found at each trust boundary:

#### TB01: User <-> Frontend (NextJS)

| **Category**                 | **User**                        |                | **Frontend (NextJS)**                                                                  |                                                                                             |
| ---------------------------- | ------------------------------- | -------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
|                              | **Strengths**                   | **Weaknesses** | **Strengths**                                                                          | **Weaknesses**                                                                              |
| **Spoofing**                 | OAuth via Google (no passwords) |                | HTTPS/TLS enforced, Auth check with redirect to login or dashboard in protected layout |                                                                                             |
| **Tampering**                |                                 |                |                                                                                        | No CSP headers configured (to tell browser which ressources to load to prevent XSS attacks) |
| **Repudiation**              |                                 |                | PostHog tracking (login, role updates, transactions, etc.)                             |                                                                                             |
| **Information Disclosure**   |                                 |                | HTTPOnly cookies for sessions                                                          |                                                                                             |
| **Denial of Service**        |                                 |                |                                                                                        | No bot protection on login                                                                  |
| **Escalation of Privileges** |                                 |                | Role-based UI rendering using `useIsAdmin()`, AccessDenied UI                          |                                                                                             |

#### TB02: Frontend (NextJS) <-> Backend (Convex)

| **Category**                 | **Frontend (NextJS)**      |                | **Backend (Convex)**                          |                                                                   |
| ---------------------------- | -------------------------- | -------------- | --------------------------------------------- | ----------------------------------------------------------------- |
|                              | **Strengths**              | **Weaknesses** | **Strengths**                                 | **Weaknesses**                                                    |
| **Spoofing**                 | JWT tokens via Convex Auth |                | JWT validation automatic                      |                                                                   |
| **Tampering**                |                            |                | Convex validators on all inputs               |                                                                   |
| **Repudiation**              |                            | No request IDs |                                               | No comprehensive audit logging, only general logging of functions |
| **Information Disclosure**   | HTTPS/TLS enforced         |                | Encrypted responses                           | 
| **Denial of Service**        |                            |                | Rate limiting of queries/ mutations built-in  |                                                                   |
| **Escalation of Privileges** | Token-based auth           |                | Role based access control via `requireRole()` | Permissions re-checked on every request (no caching)              |

#### TB03: Backend (Convex) <-> Database

| **Category**                 | **Backend (Convex)**                                                  |                     | **Database (Convex Cloud)** |                                   |
| ---------------------------- | --------------------------------------------------------------------- | ------------------- | --------------------------- | --------------------------------- |
|                              | **Strengths**                                                         | **Weaknesses**      | **Strengths**               | **Weaknesses**                    |
| **Spoofing**                 |                                                                       |                     | Convex Auth                 |                                   |
| **Tampering**                | Type safe queries (to prevent SQL injections)                         |                     |                             |                                   |
| **Repudiation**              |                                                                       | Limited audit trail |                             |                                   |
| **Information Disclosure**   |                                                                       |                     | Encryption of database      |                                   |
| **Denial of Service**        |                                                                       |                     | Convex-managed optimization |                                   |
| **Escalation of Privileges** | Organization-scoped queries by checking for organizationId in queries |                     |                             | Convex managed row-level security |

#### TB04: Backend (Convex) <-> Stripe

| **Category**                 | **Backend (Convex)**                   |                                 | **Stripe Payments**                                        |                |
| ---------------------------- | -------------------------------------- | ------------------------------- | ---------------------------------------------------------- | -------------- |
|                              | **Strengths**                          | **Weaknesses**                  | **Strengths**                                              | **Weaknesses** |
| **Spoofing**                 | API keys saved on Convex cloud backend | Keys in environment variables   | Stripe webhook signature verification using webhook secret |                |
| **Tampering**                | Webhook validation                     |                                 | Signed webhooks                                            |                |
| **Repudiation**              |                                        | No webhook verification logs    |                                                            |                |
| **Information Disclosure**   |                                        | API keys could be in error logs | PCI DSS compliant (payment security standard)              |                |
| **Denial of Service**        |                                        | No explicit retry limits        | Stripe rate limits                                         |                |
| **Escalation of Privileges** | Scoped API keys                        |                                 | Restricted API access                                      |                |

#### TB05: Backend (Convex) <-> Google OAuth

| **Category**                 | **Backend (Convex)**              |                                       | **Google OAuth**             |                |
| ---------------------------- | --------------------------------- | ------------------------------------- | ---------------------------- | -------------- |
|                              | **Strengths**                     | **Weaknesses**                        | **Strengths**                | **Weaknesses** |
| **Spoofing**                 | OAuth 2.0 handled via Convex Auth | No visible state parameter validation | Google identity verification |                |
| **Tampering**                | Token validation automatic        |                                       | Signed tokens                |                |
| **Repudiation**              |                                   | No failed attempt tracking            |                              |                |
| **Information Disclosure**   | HTTPS/TLS                         |                                       | Minimal user data exposure   |                |
| **Denial of Service**        |                                   |                                       | Google rate limits           |                |
| **Escalation of Privileges** |                                   |                                       | Token expiration managed     |                |

## Architecture & Dependencies

- **Frontend**: Next.js 15 (server and client components for security, XSS protection)
- **Backend**: Convex (handles database encryption, queries/mutations and infrastructure)
- **Authentication**: Google OAuth 2.0 user verification implemented via Convex Auth → no passwords stored
  → Convex Auth also handles Session management, JWT tokens, HTTPOnly cookies
- **Payment**: Stripe (handles payment compliance)
- **Deployment**: Vercel (CDN security, DDoS protection, TLS enforcement) + Convex Cloud

This analysis focuses on what I can control at the application level. I'm explicitly not covering:

- **Physical security:** Data center security is handled by cloud providers
- **Cloud provider internals:** I trust Convex, Vercel, and Stripe to secure their infrastructure
- **End-user devices:** I can't control if someone's laptop has malware or their browser is outdated
- **Network infrastructure:** ISP security, routing, and network-level DDoS are outside my control

I hope this has helped to show that I care about the security of my users and methods on making my app more secure.
