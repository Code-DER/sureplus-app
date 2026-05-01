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
    Version: v0.0.8
    <br />
    Status: design kickoff / early scaffold.
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

The backend uses the local Supabase schema as its persistence layer, includes a service-role client for server-side database operations, and signs application JWTs with a backend-only secret rather than the Supabase anon key. Focused regression tests cover forged-token rejection and database-role mismatch rejection in the authentication dependency.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Current Repository State

This repository is currently at the backend scaffold stage. The local Supabase project skeleton is committed under `app/supabase/` with the initial database migration and Row Level Security policies, and `app/backend/` now contains the FastAPI backend, dependency manifest, environment sample, authentication routes, user routes, product/safety routes, service modules, Pydantic models, and focused authentication regression tests. A committed frontend application is not yet present.

Refer to `SUPABASE_SETUP.md` at the repository root for the local-development onboarding flow that runs Supabase entirely on Docker without requiring a hosted Supabase account. Detailed version documentation for the product-and-safety backend additions is available in `docs/version-0.0.8-docs.md`, and earlier version notes are tracked under the other `docs/version-*-docs.md` files and in `CHANGELOG.md`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

- Git
- A code editor
- Docker Desktop, kept running before any `supabase` command is used
- Supabase CLI (via Homebrew on macOS or `npm install -g supabase` on Windows or Linux)
- Python 3.11+ for the FastAPI backend
- Backend dependencies from `app/backend/requirements.txt`

### Local Setup

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
5. Bring up the local Supabase stack and apply the initial schema. See `SUPABASE_SETUP.md` for the full walkthrough; the short form is:
   ```sh
   cd app/supabase
   supabase start
   supabase db reset
   ```
6. Install backend dependencies and run the FastAPI backend from the backend directory.
   ```powershell
   cd ../backend
   python -m pip install -r requirements.txt
   python -m uvicorn main:app --reload
   ```
7. Run the focused backend regression tests after dependencies are installed.
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
- [ ] Commit the initial frontend application scaffold.
- [x] Add the initial FastAPI backend scaffold with authentication, user, product, allergen, and user-allergy routes.
- [ ] Complete role-based onboarding and profile management beyond the current authentication and user-profile baseline.
- [ ] Complete seller food-listing workflows with transactional allergen updates, inventory workflows, expiration behavior, and product formats.
- [ ] Implement buyer discovery, purchase, receipt, points, and rating flows.
- [ ] Implement charity, innovator, composter, and admin workflows.
- [ ] Add notification, messaging, social-impact, analytics, and leaderboard outputs.
- [x] Commit the initial Supabase database migration with Row Level Security policies for the 17 baseline tables.
- [ ] Add additional database migrations, transactional safety operations, broader tests, deployment notes, and operations guidance.

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
