# TaskMate Server

TaskMate Server is the backend service for the TaskMate application, providing user account management, task CRUD operations, and real-time updates through Socket.IO. This project is built with **Node.js**, **Express.js**, **MongoDB**, and **Socket.IO**.


## 🌟 Features

- 🔒 **JWT Authentication** for user security.
- 📋 **Task Management** (Add, Edit, Delete, Fetch tasks).
- 🛡️ **Token Verification** for route protection.
- 🔄 **Real-time task updates** using **Socket.IO**.
- 🗂️ **MongoDB** for task and account storage.
- 🌐 **CORS** configured for secure client-server communication.

---

## 🛠️ Installation and Setup

### Prerequisites
Ensure that you have the following installed:

- [Node.js](https://nodejs.org/en/) (v14+)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)
- A `.env` file with the following environment variables:
  ```env
  PORT=5000
  DB_USER=your_mongo_user
  DB_SECRET_KEY=your_mongo_secret_key
  ACCESS_TOKEN_SECRET=your_jwt_secret
  NODE_ENV=development
  ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shaikatahmed78/taskmate-server.git
   cd taskmate-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

---

## 🚀 API Endpoints

### 🔑 Authentication

- **`POST /jwt`** - Generate JWT token using user email.
  
  ```json
  {
    "email": "user@example.com"
  }
  ```

- **`GET /logout`** - Clears the authentication cookie.

### 🗂️ User Accounts

- **`POST /accounts`** - Create a new user account.
- **`GET /accounts`** - Fetch all accounts.

### 📝 Task Records

- **`POST /records`** - Add a new task.
- **`GET /records/:email`** - Get all tasks for a user (Requires JWT verification).
- **`PUT /records/:id`** - Update a task.
- **`PATCH /records/:id`** - Partial update of a task.
- **`DELETE /records/:id`** - Delete a task.

---

## 🔒 Security Middleware

- **Token Verification:** Ensures only authenticated users can access protected routes.
- **Input Validation:** Validates task IDs and user inputs to prevent invalid data.

---

## 🔗 Socket.IO Integration

Real-time updates are provided through Socket.IO. When a user performs task operations, an event is emitted to update the client's task list.

- **Join Room:** Users can join a Socket.IO room using their email.
- **Task Updated:** Emits `task-updated-{email}` when a task is created, updated, or deleted.

---

## 📂 Project Structure

```
.
├── server.js             # Main server file
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

---

## 🖼️ UI/UX
To enhance TaskMate Server integration, ensure the front-end client is properly configured with:

- **Base URL:** `http://localhost:5000`
- **CORS:** Ensure cross-origin requests are allowed for `http://localhost:5173`.

---

## 🛡️ Error Handling

All API routes are designed with structured error messages to provide clarity:

- **400:** Invalid input or malformed request.
- **401:** Unauthorized access.
- **403:** Forbidden (e.g., accessing another user's tasks).
- **500:** Internal server errors.

---

## 🛑 Common Issues and Troubleshooting

- **MongoDB Connection Errors:** Ensure correct MongoDB URI in `.env`.
- **Token Issues:** Verify token format and validity.
- **CORS Issues:** Ensure correct client URL is configured in the `cors` middleware.

---

## 🤝 Contribution

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

---

---

## 📞 Support

For issues or support, please contact [Support](mailto:shaikatahmed78@gmail.com).


---

Thank you for using **TaskMate Server**! 🎉

## 👨‍💻 Made ❤️ by [Saikat Ahmed]