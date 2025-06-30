# **Stenovia Lite**

A lightweight full-stack web application for real-time typing speed tests, user performance tracking, and leaderboard ranking.

---

## 🚀 Features

* ✍️ **Typing Test Module**
  Take real-time typing tests with WPM, accuracy, and performance feedback.

* 📈 **User Performance History**
  Authenticated users can view their last 20 test results.

* 🏆 **Global Leaderboard**
  Top 10 users ranked by average WPM.

* 🔐 **Authentication System**
  Secure sign-up and login with JWT and password hashing (bcrypt).

* 🧠 **RESTful Backend API**
  Built with Express.js and MySQL, providing secure and scalable endpoints.

---

## 🛠️ Technologies Used

**Frontend:**
*Note: Frontend code isn't included in this file, but typically uses HTML, CSS, JS or frameworks like React.*

**Backend:**

* Node.js
* Express.js
* MySQL
* JWT (jsonwebtoken)
* bcrypt.js
* dotenv
* MySQL2
* CORS
* REST API

---

## 📂 Folder Structure (Backend)

```
stenovia-lite/
├── backend/
│   ├── authMiddleware.js       # Middleware for verifying JWT
│   ├── db.js                   # MySQL connection pool
│   ├── routes/
│   │   ├── auth.js             # User signup/login
│   │   ├── leaderboard.js      # Leaderboard data
│   │   └── tests.js            # Save and fetch typing test results
│   ├── .env                    # Environment config
│   └── package.json            # Dependencies and scripts
```

---

## 🔐 Environment Variables (`.env`)

Create a `.env` file in the `backend` folder with the following values:

```
PORT=5000
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=stenovia_simple
```

---

## 📦 Installation & Setup

```bash
# Navigate to backend
cd stenovia-lite/backend

# Install dependencies
npm install

# Start the backend server
npm run dev  # Uses nodemon for auto-reloading
```

---

## 📡 API Endpoints Overview

### Auth Routes (`/api/auth`)

* `POST /signup` → Create new user
* `POST /login` → Login and receive JWT
* `GET /me` → Get logged-in user's info (requires JWT)

### Test Routes (`/api/tests`)

* `POST /results` → Save test result (requires JWT)
* `GET /history` → Get last 20 test results (requires JWT)

### Leaderboard (`/api/leaderboard`)

* `GET /` → Top 10 users sorted by average WPM

---

## 🔒 Security Notes

* Passwords are hashed using **bcrypt**.
* Tokens are issued and verified using **JWT**.
* Sensitive data stored in `.env`.

---

## 📌 Future Improvements (Ideas)

* Add frontend UI using React or Svelte
* Support code-mode typing tests
* Animated cursor, live metrics, and theme switch
* OAuth login (e.g., Google, GitHub)

---

## 📃 License

MIT License. Feel free to use and modify.

---

Let me know if you also want a `.gitignore`, `LICENSE`, or a working example for frontend integration.
