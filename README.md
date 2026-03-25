# Node.js Authentication Template

A robust, production-ready authentication boilerlate built with Node.js, Express, MongoDB, and Passport.js. This template is designed to help you quickly bootstrap your backend applications with a secure, highly modular local and third-party authentication architecture.

## 🚀 Features
- **Local Authentication:** Complete register/login functionality with securely hashed passwords using `bcrypt`.
- **Google OAuth 2.0:** Integrated "Sign in with Google" via `passport-google-oauth20`.
- **JWT Authorization:** Stateless route protection via HTTP-Only JSON Web Tokens (`jsonwebtoken`).
- **Session & Flash Messages:** Dynamic front-end UI alerts natively fed from backend middleware using `express-session` and `connect-flash`.
- **Modular Routing:** Follows scalable MVC patterns with a clean `userRoutes` configuration.
- **Tailwind UI Component Hooks:** Elegant, glassmorphic EJS templates pre-built out of the box.

## 📦 Tech Stack
- **Node.js**: Backend JavaScript runtime.
- **Express.js**: Fast, unopinionated routing framework.
- **MongoDB + Mongoose**: NoSQL Database for user records.
- **Passport.js**: Authentication middleware bridging social logins.
- **EJS**: Embedded JavaScript templating for front-end rendering.

<br>

## 🛠 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/krishnakasaudhan0/template.git
   cd template
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of your project directory and configure the database and OAuth credentials:
   ```env
   # Database Configurations
   MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@<YOUR_CLUSTER_URL>
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key

   # Google OAuth Configurations
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

4. **Start the application:**
   You can run the server in development mode using `nodemon` (if installed globally) or normally via Node:
   ```bash
   nodemon server.js
   # OR
   node server.js
   ```

   The app will automatically run on [http://localhost:3000](http://localhost:3000).

---

## 🔒 Routes & Endpoints Structure

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| **GET** | `/users/login` | Renders the login UI module | No |
| **GET** | `/users/register` | Renders the signup UI module | No |
| **POST** | `/users/login` | Processes standard email/password login, generates HTTP-only JWT login cookies | No |
| **POST** | `/users/register`| Processes new user account registration, generates secure BCrypt hashes | No |
| **GET** | `/users/auth/google` | Triggers the redirect out to the Google Consent Screen | No |
| **GET** | `/users/auth/google/callback` | Callback URL where Google returns user payloads over to Passport | No |
| **GET** | `/users/logout` | Clears all cookies & active session parameters | Yes |
| **GET** | `/` | Protected root dashboard, only reachable if `isLoggedIn` middleware validates token | Yes |

## ⚙️ How Google OAuth is connected
To enable your Google Sign-in to process actual requests, you must securely whitelist this application inside your Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project.
3. Search for "APIs & Services" -> "Credentials"
4. Hit "+ Create Credentials" -> **OAuth client ID**
5. Add `http://localhost:3000/users/auth/google/callback` to the **Authorized redirect URIs**.
6. Export the Client ID and Secret back into your `.env` configuration.

---

### Contributions
If there are any enhancements, pull requests are welcomed!
