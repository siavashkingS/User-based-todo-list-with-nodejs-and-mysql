# 🧠 User-Based Todo List Project (Node.js + MySQL)

This project showcases two versions of a full-featured backend web app built with **pure Node.js and MySQL** — one using **raw SQL queries**, and another using the **Sequelize ORM**.  
Both versions allow users to sign up, log in, and manage their own private todo lists.

---

## 📸 Screenshots

### 🟠 Sign Up Page  
![Sign Up](./screenshots/signup.png)

### 🔑 Sign In Page  
![Sign In](./screenshots/signin.png)

### ✅ Personal Todo List Page  
![Todo List](./screenshots/todolist.png)


---

## 🚀 Features

- ✅ User Registration (Sign Up)
- 🔐 User Authentication (Sign In)
- 📝 Add, complete, and delete tasks
- 🧍 Each user has a **private todo list**
- 🍪 Cookie-based sessions (in-memory)
- 💾 MySQL database (users + todos)
- 🎨 Clean UI with orange-themed CSS
- 🧼 Fully modular: signup, signin, and todos in separate files

---

## 📁 Project Structure

project/

├── Raw SQL version/ # ✅ Version 1: Uses raw MySQL queries

│ ├── server.js

│ ├── connection.js

│ ├── auth/

│ │ ├── signup.js

│ │ └── signin.js

│ └── public/

│ └── style.css

├── ORM version/ # ✅ Version 2: Uses Sequelize ORM

│ ├── server.js

│ ├── models/

│ │ ├── index.js

│ │ ├── user.js

│ │ └── todo.js

│ └── public/

│ └── style.css

└── screenshots/

---

## 🛠️ Setup Instructions

### 1. Clone and Navigate

```bash
git clone https://github.com/yourusername/user-todo-app.git
cd user-todo-app
2. Install Dependencies
npm install mysql
```
3. Configure the Database
Create a new MySQL database and run the following SQL schema:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```
Update the database credentials in connection.js.

▶️ Running Each Version
🧱 Raw SQL Version
```bash
cd Raw SQL version
node server.js
```
⚙️ Sequelize ORM Version
```bash
cd ORM version
node server.js
```
Visit: http://localhost:3000

---
🎓 Learning Highlights
---
This app was built to strengthen understanding of:

Routing with the native http module

Processing HTML form data with querystring

Session handling using cookies

Working with MySQL queries and user relationships

Serving static assets (like CSS)

Organizing code with modular separation

Building real-world backend apps without frameworks

---
📌 Optional Next Features
---
Password hashing with bcrypt

Persistent sessions stored in a database or file

Edit/update tasks

REST API version for frontend integration

Rate limiting or login attempt protection