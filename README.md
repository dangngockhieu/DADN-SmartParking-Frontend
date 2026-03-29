# Smart Parking Frontend 🚗

## Description 📌

Smart Parking Frontend is a web application for managing parking operations with dedicated experiences for end users and administrators.

The project is built with **React + TypeScript + Vite**, integrates with backend APIs via Axios, supports authentication flows, and includes realtime slot updates through WebTransport.

## Features ✨

- User authentication: login, register, reset password, change password.
- Role-based access control for `ADMIN` and `USER` routes.
- Admin workspace: dashboard, users, RFID cards, parking sessions, lots, gates, IoT devices.
- User workspace: profile, wallet/payment history, personal parking sessions.
- Realtime parking slot status updates using WebTransport.
- API token refresh flow with Redux state management.
- Responsive UI using Bootstrap, React-Bootstrap, and SCSS.

## Structure

```text
frontend
├── public/                               # Static assets (favicon, icons...)
│
├── src
│   ├── assets/                           # Images, icons, svg
│   ├── components/                       # Reusable UI and feature modules
│   │   ├── admin/                        # Admin workspace components
│   │   │   ├── DashBoard/                # Admin dashboard widgets
│   │   │   ├── ManageCard/               # RFID card CRUD + modals
│   │   │   ├── ManageDevice/             # IoT device management
│   │   │   ├── ManageLot/                # Parking lot / gate / slot management
│   │   │   ├── ManageUser/               # User management + modals
│   │   │   ├── ParkingSession/           # Parking session admin views
│   │   │   ├── AdminHeader.tsx           # Admin header layout
│   │   │   ├── AdminLayout.tsx           # Admin layout wrapper
│   │   │   ├── AdminSidebar.tsx          # Admin navigation
│   │   │   └── Admin.scss                # Admin layout styles
│   │   ├── user/                         # User workspace components
│   │   │   ├── ManagePayment/            # Wallet & payment history
│   │   │   ├── MyParkingSessio/          # User parking session views
│   │   │   ├── MyProfile/                # Profile management
│   │   │   ├── UserHeader.tsx            # User header layout
│   │   │   ├── UserLayout.tsx            # User layout wrapper
│   │   │   ├── UserSidebar.tsx           # User navigation
│   │   │   └── User.scss                 # User layout styles
│   │   ├── share/                        # Shared cross-role components
│   │   │   └── ParkingLotStatus.tsx      # Public parking slot status view
│   │   ├── statusPayment/                # Deposit payment result pages
│   │   │   ├── DepositCancel.tsx         # Deposit canceled view
│   │   │   └── DepositSuccess.tsx        # Deposit success view
│   │   ├── WelcomePage.tsx               # Landing page
│   │   └── WelcomePage.scss              # Landing page styles
│   ├── interfaces/                       # TypeScript types/contracts
│   ├── pages/                            # Route pages & route guards
│   ├── realtimes/                        # WebTransport realtime layer
│   ├── redux/                            # Redux store setup
│   │   ├── slices/                       # Redux slices (state modules)
│   │   ├── hooks.ts                      # Typed Redux hooks
│   │   └── store.ts                      # Store configuration
│   ├── services/                         # API service layer (Axios)
│   ├── styles/                           # Global styles
│   ├── utils/                            # Shared utilities (Axios config)
│   ├── App.tsx                           # App root component
│   └── main.tsx                          # React entry point
│├── .env.example                         # Environment variables template
├── eslint.config.js                      # ESLint configuration
├── index.html                            # Vite HTML entry
├── package.json                          # Dependencies and scripts
├── tsconfig*.json                        # TypeScript configurations
├── vite.config.ts                        # Vite configuration
└── README.md                             # Project documentation
```

## Installation 🛠️

Follow these steps if you are new to the project:

1. Install prerequisites:

- [Node.js](https://nodejs.org/) `>= 20`.
- `npm` (comes with Node.js).
- Git.

2. Clone the repository:

```bash
git clone --branch new_frontend --single-branch https://github.com/Anh-Tuan04/HCMUT_252_term-Multidisciplinary_Project-Software_Engineering.git
```

3. Move into the project folder:

```bash
cd frontend
```

4. Install dependencies:

```bash
npm install
```

5. Create your environment file:

```bash
cp .env.example .env
```

If you are on Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

6. Update `.env` with your backend and realtime endpoints (see Configuration section).

7. Start the development server:

```bash
npm run dev
```

## Usage ▶️

- Open the app in your browser (Vite will print the local URL, usually `http://localhost:5173`).
- Main routes:
- `/` landing page.
- `/login`, `/register`, `/reset-password`.
- `/user` user portal (protected).
- `/admin` admin portal (protected).
- `/parking-status` public parking status view.
- Useful scripts:

```bash
npm run dev      # run development server
npm run build    # create production build
npm run preview  # preview production build locally
npm run lint     # run ESLint checks
```

## Configuration ⚙️

Create and maintain a `.env` file in the project root:

```env
VITE_BACKEND_URL=
VITE_WEBTRANSPORT_URL=
VITE_WEBTRANSPORT_CERT_HASH=
```

Environment variables:

- `VITE_BACKEND_URL`: Base URL of your backend API (example: `http://localhost:8080`).
- `VITE_WEBTRANSPORT_URL`: WebTransport endpoint for realtime events.
- `VITE_WEBTRANSPORT_CERT_HASH`: Optional certificate hash for secure WebTransport connection.

Notes:

- Never commit sensitive values to source control.
- Keep `.env.example` updated when adding new variables.

## Contributing 🤝

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes and run checks:

```bash
npm run lint
npm run build
```

4. Commit with clear messages and open a Pull Request.

Recommended contribution style:

- Keep PRs focused and small.
- Add/update docs when behavior changes.
- Follow the existing code style and naming conventions.

## License 📄

This project currently does **not** include a license file.

Before public distribution or commercial usage, add a license (for example: MIT, Apache-2.0, or GPL-3.0) based on your project policy.
