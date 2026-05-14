<a id="readme-top"></a>

<p align="center">
  <a href="https://github.com/Code-DER/sureplus-app/graphs/contributors"><img src="https://img.shields.io/github/contributors/Code-DER/sureplus-app.svg?style=for-the-badge" alt="Contributors" /></a>
  <a href="https://github.com/Code-DER/sureplus-app/network/members"><img src="https://img.shields.io/github/forks/Code-DER/sureplus-app.svg?style=for-the-badge" alt="Forks" /></a>
  <a href="https://github.com/Code-DER/sureplus-app/stargazers"><img src="https://img.shields.io/github/stars/Code-DER/sureplus-app.svg?style=for-the-badge" alt="Stars" /></a>
  <a href="https://github.com/Code-DER/sureplus-app/issues"><img src="https://img.shields.io/github/issues/Code-DER/sureplus-app.svg?style=for-the-badge" alt="Issues" /></a>
  <a href="https://github.com/Code-DER/sureplus-app/blob/main/LICENSE.txt"><img src="https://img.shields.io/badge/license-proprietary-red.svg?style=for-the-badge" alt="Proprietary License" /></a>
</p>

[![Sureplus Website Screen Shot][product-screenshot]](https://github.com/Code-DER/sureplus-app)

<div align="center">
<h3 align="center">Sureplus Website</h3>
  <p align="center">
    <strong>A web platform concept for Sureplus Philippines, focused on rescuing edible surplus food, supporting responsible inedible-food recycling, and tracking social impact.</strong>
    <br />
    Version: v0.2.0
    <br />
    Status: remote Supabase-ready development baseline.
    <br />
    <a href="https://github.com/Code-DER/sureplus-app"><strong>Explore the repository</strong></a>
    <br />
    <br />
    <a href="https://github.com/Code-DER/sureplus-app">View Repository</a>
    &middot;
    <a href="https://github.com/Code-DER/sureplus-app/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/Code-DER/sureplus-app/issues">Request Feature</a>
  </p>
</div>
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#product-scope">Product Scope</a></li>
        <li><a href="#key-features">Key Features</a></li>
        <li><a href="#data-model-highlights">Data Model Highlights</a></li>
        <li><a href="#backend-api-highlights">Backend API Highlights</a></li>
        <li><a href="#remote-supabase-development">Remote Supabase Development</a></li>
        <li><a href="#current-repository-state">Current Repository State</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#local-setup">Local Setup</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>


## About The Project


Sureplus is a proposed website for a food-rescue marketplace in the Philippines. It connects buyers, sellers, charities, innovators, composters, and administrators around surplus food listings, purchases, ratings, social-impact tracking, and recycling workflows.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Product Scope

- Buyers discover edible rescued-food listings, buy or claim available food, receive allergen warnings, redeem points, and view purchase history.
- Sellers, companies, and organizations post food listings with stock, price or free-item flags, expiration dates, product format, allergens, and edible or inedible status.
- Charities claim donated or free listings and publish donation posts with target and current amounts.
- Innovators and composters handle inedible-food recycling requests, transaction fees, deadlines, and partner or facility metadata.
- Administrators review users, listings, purchases, charity approvals, partner tags, account deactivation queues, urgent messages, fees, and platform activity logs.
- The platform reports social impact such as kilos rescued, carbon offset, people fed, badges, streaks, and leaderboard metrics.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Key Features

- Role-based registration and onboarding for buyers, sellers, charities, innovators, composters, and admins.
- Food listing management with stock tracking, expiration enforcement, product formats, pictures, and allergen tagging.
- Search and filtering by category, seller, allergen safety, and edible or inedible status.
- Purchases with itemized line items, payment method capture, optional point redemption, and stock decrement behavior.
- Bidirectional ratings after purchases, including rater, ratee, rating, capped comments, and timestamps.
- Social-impact outputs for individual purchases and platform-wide reporting.
- Charity posts, recycle requests, conversations, messages, notifications, admin activity logs, and account-control workflows.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Data Model Highlights

The initial database migration at `app/supabase/migrations/20260425000000_initial_schema.sql` provisions 17 tables with Row Level Security policies and supporting indexes:

- `User` plus role extensions for `Buyer`, `Seller`, `Charity`, and `Admin`. The `User.role` column is constrained to `buyer`, `seller`, `charity`, or `admin` in the current schema.
- `Food`, `Allergen`, `FoodAllergen`, and `UserAllergies` for listings and allergy-aware discovery.
- `Purchase`, `PurchaseItems`, `Rating`, and `SocialImpact` for transactions and outcome tracking.
- `CharityApplication` and `CharityPost` for charity onboarding and donation workflows.
- `Notifications` and `AdminActivity` for user notifications and administrator action logging.

Innovator, composter, recycling-request, and direct messaging entities described in the broader product scope are not yet part of the committed schema and remain on the roadmap.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Backend API Highlights

The backend scaffold under `app/backend/` now includes FastAPI routes and service-layer support for:

- authentication and current-user context,
- user profile lookup,
- product listing discovery and seller-owned product management,
- allergen catalog reads and admin-owned allergen creation,
- current-user allergy profile reads and updates,
- allergy-aware product responses that expose matched allergens and safe-for-current-user status.

The backend uses Supabase as its persistence layer, requires a backend-only elevated Supabase key for server-side database operations, and signs application JWTs with a separate backend-only secret rather than a Supabase client key. Product-safety relationship writes now go through database RPC functions so food-allergen and user-allergy replacement can be handled atomically after the latest migrations are applied.

Focused regression tests cover forged-token rejection, database-role mismatch rejection, service-role configuration failure, and the product-safety service paths that call the atomic RPC functions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Remote Supabase Development

Version `v0.2.0` moves the shared backend target from developer-specific local Supabase instances to the hosted Sureplus Supabase project. The committed backend sample now points at the hosted Supabase URL, while secrets remain local to each developer or deployment environment.

The current shared-development expectations are:

- apply the committed Supabase migrations to the hosted project before running shared backend or frontend tests,
- keep elevated Supabase keys on the backend only,
- configure frontend requests through `VITE_API_URL` instead of hardcoded backend URLs,
- configure backend CORS through `BACKEND_CORS_ORIGINS` for local and deployed frontend origins,
- keep Supabase Auth redirect URLs aligned with the active frontend origin.

The frontend still talks to the FastAPI backend rather than directly to Supabase for application login/signup flows. Supabase provides the hosted database, Row Level Security posture, RPC functions, and platform services behind the backend.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Current Repository State

This repository is currently at the remote Supabase-ready development baseline. The Supabase project skeleton is committed under `app/supabase/` with schema migrations, Row Level Security policies, auth redirect defaults for Vite development, and product-safety RPC functions. `app/backend/` contains the FastAPI backend, dependency manifest, environment sample, authentication routes, user routes, product/safety routes, service modules, Pydantic models, configurable CORS, and focused backend regression tests. `app/frontend/` contains the React/Vite frontend scaffold, application components, and a shared API client driven by `VITE_API_URL`.

Refer to `SUPABASE_SETUP.md` at the repository root for the shared hosted-Supabase setup path and the optional local Docker workflow. Detailed version documentation for this remote Supabase transition is available in `docs/version-0.2.0-docs.md`; prior product-and-safety backend additions are documented in `docs/version-0.0.8-docs.md`, `docs/version-0.0.9-docs.md`, and `docs/version-0.0.10-docs.md`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

- Git
- A code editor
- Docker Desktop, required only when running the optional local Supabase stack
- Supabase CLI (via Homebrew on macOS or `npm install -g supabase` on Windows or Linux)
- Python 3.11+ for the FastAPI backend
- Backend dependencies from `app/backend/requirements.txt`
- Node.js and npm for the React/Vite frontend

### Development Setup

1. Clone the repository.
   ```sh
   git clone https://github.com/Code-DER/sureplus-app.git
   ```
2. Enter the project directory.
   ```sh
   cd sureplus-app
   ```
3. Review the current project documentation and design notes.
   ```sh
   dir
   ```
4. Review the current backend environment sample.
   ```powershell
   Get-Content app/backend/.sample.env
   ```
5. Prepare the hosted Supabase project. See `SUPABASE_SETUP.md` for the full walkthrough; the short form is:
   ```sh
   cd app/supabase
   supabase link --project-ref <project-ref>
   supabase db push
   ```
6. Configure backend environment values from the sample, using project-specific keys from the Supabase dashboard and a strong backend JWT secret.
7. Install backend dependencies and run the FastAPI backend from the backend directory.
   ```powershell
   cd ../backend
   python -m pip install -r requirements.txt
   python -m uvicorn main:app --reload
   ```
8. Install frontend dependencies and run the Vite dev server from the frontend directory.
   ```powershell
   cd ../frontend
   npm install
   npm run dev
   ```
9. Run the focused backend regression tests after dependencies are installed.
   ```powershell
   python -m unittest discover tests
   ```

For PowerShell users, the repository can be opened from the project root:

```powershell
code .
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Roadmap

- [ ] Convert the design kickoff into reviewed requirements, user stories, and acceptance criteria.
- [x] Commit the initial frontend application scaffold.
- [x] Add the initial FastAPI backend scaffold with authentication, user, product, allergen, and user-allergy routes.
- [ ] Complete role-based onboarding and profile management beyond the current authentication and user-profile baseline.
- [x] Add transactional database functions for product-safety relationship writes.
- [ ] Complete seller food-listing workflows beyond the current backend baseline, including inventory workflows, expiration behavior, and product formats.
- [ ] Implement buyer discovery, purchase, receipt, points, and rating flows.
- [ ] Implement charity, innovator, composter, and admin workflows.
- [ ] Add notification, messaging, social-impact, analytics, and leaderboard outputs.
- [x] Commit the initial Supabase database migration with Row Level Security policies for the 17 baseline tables.
- [x] Add shared hosted Supabase setup notes and remote-ready application configuration.
- [ ] Add broader route tests, live database validation, deployment notes, and operations guidance.

See the [open issues](https://github.com/Code-DER/sureplus-app/issues) for proposed features and known gaps.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Contributing

Contributions should keep the project aligned with the Sureplus food-rescue domain, protect user privacy, and make behavior easy to verify.

1. Fork the project.
2. Create a feature branch.
   ```sh
   git checkout -b feat/your-change
   ```
3. Keep changes focused and update documentation when behavior changes.
4. Run the relevant checks for the stack you touch, or document why no automated check exists yet.
5. Open a pull request with the problem, approach, validation evidence, and risks.

See `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md` for process, behavior, and vulnerability-reporting guidance.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## License

This project is proprietary and confidential. All rights are reserved by the Sureplus Website Development Team.
See `LICENSE.txt` for the complete notice.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Contact

Maintainers:

- Xander Jay C. Cagang
- Zildjian E. California
- Joe Hanna S. Cantero
- Genesis Roner P. Lozada
- Michael James B. Mangaron
- Tirso Benedict J. Naza
- Dana Jill P. Santiago
- Xious N. Sardoma

Project Link: [https://github.com/Code-DER/sureplus-app](https://github.com/Code-DER/sureplus-app)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Acknowledgments

- CMSC 127 Laboratory Exercise #7: Database & System Design Kickoff.
- Sureplus Philippines project stakeholders and student contributors.
- Food-rescue, charity, and circular-economy initiatives that inspired the platform domain.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



[product-screenshot]: repo/images/project_screen.png
