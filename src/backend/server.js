import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// In-memory users data (simulating a database with a JSON file)
const usersFilePath = path.resolve(__dirname, 'users.json');

// Function to load users from the JSON file
const loadUsers = () => {
  if (fs.existsSync(usersFilePath)) {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
  }
  return [];
};

// Function to save users to the JSON file
const saveUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  // Check if email and password match any stored user
  const user = users.find((user) => user.email === email && user.password === password);

  if (user) {
    return res.json({ message: 'Login successful', redirectTo: '/dashboard' });
  } else {
    return res.status(400).json({ message: 'Invalid email or password' });
  }
});

// Register Route
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  // Check if the email already exists
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  // Add new user
  const newUser = { email, password };
  users.push(newUser);

  // Save the updated users list to the JSON file
  saveUsers(users);

  return res.json({ message: 'Registration successful' });
});

// Serve the frontend if in production (optional, if you're deploying both React and Express in the same app)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build')); // Adjust path if needed

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
