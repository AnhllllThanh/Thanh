const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto'); 
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = express();
const port = 8080;

// Database configuration
const dbURI = 'mongodb://localhost:27017/your-database-name'; 
mongoose.connect(dbURI) 
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

// Generate a strong, random secret
const secretKey = crypto.randomBytes(32).toString('hex'); 

// Configure session middleware 
app.use(session({
  secret: secretKey, 
  resave: false,
  saveUninitialized: true
}));

// Use template engine EJS
app.set('view engine', 'ejs'); 
app.set('views', './views');

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (IMPORTANT)
app.use(express.static('public'));  

// Root route (landing page)
app.get('/', (req, res) => {
  res.render('index', { error: req.session.error }); 
  req.session.error = null; 
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.session.error = 'Please fill in all fields.';
    res.redirect('/');
    return;
  }

  try {
    const user = await User.findOne({ username });
    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (isValidPassword) {
        req.session.user = user;
        res.redirect('/home');
      } else {
        req.session.error = 'Incorrect password.';
        res.redirect('/');
      }
    } else {
      req.session.error = 'User not found.';
      res.redirect('/');
    }
  } catch (err) {
    console.error('Error during login:', err);
    req.session.error = 'Internal server error.';
    res.redirect('/');
  }
});

// Home route (protected)
app.get('/home', (req, res) => {
  if (req.session.user) {
    res.render('home', { user: req.session.user });
  } else {
    res.redirect('/'); 
  }
});

// Register route
app.get('/register', (req, res) => {
  res.render('register', { error: req.session.error });
  req.session.error = null; // Clear error message
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.session.error = 'Please fill in all fields.';
    res.redirect('/register');
    return;
  }

  try {
    const newUser = new User({ username, password });
    await newUser.save(); 
    res.redirect('/login'); // Redirect to login
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error (username exists)
        req.session.error = 'Username already exists.';
        res.redirect('/register'); 
        return; 
    }
    console.error('Error during registration:', err);
    req.session.error = 'Error during registration.';
    res.redirect('/register');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.redirect('/'); 
    } else {
      res.redirect('/'); 
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});