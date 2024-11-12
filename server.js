const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer'); // Thêm thư viện nodemailer để gửi email
const crypto = require('crypto'); // Thêm thư viện crypto để tạo token

const app = express();

// Database configuration
const dbURI = 'mongodb://localhost:27017/your-database-name'; // Replace with your MongoDB URI
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiry: Date
});

const User = mongoose.model('User', userSchema);

// Configuration
app.set('view engine', 'ejs'); // Using EJS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: dbURI })
}));

// Register route
app.get('/register', (req, res) => {
  res.render('register', { error: req.session.error }); // Hiển thị form đăng ký
  req.session.error = null; 
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.session.error = 'username đã tồn tại.';
      res.redirect('/register');
      return;
    }

    // Mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo tài khoản mới
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // Chuyển hướng người dùng đến trang login
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.session.error = 'Error during registration.';
    res.redirect('/register');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }); // Find user in the database
    if (user) {
      // Compare entered password with the stored hash
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (isValidPassword) {
        // Login successful, start a session
        req.session.user = user; // Store user data in session
        res.redirect('/home'); // Redirect to the protected page
      } else {
        req.session.error = 'Incorrect password.';
        res.redirect('/');
      }
    } else {
      req.session.error = 'User not found.';
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    req.session.error = 'Internal server error.';
    res.redirect('/');
  }
});

// Forgot password route
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { error: req.session.error });
  req.session.error = null;
});

app.post('/forgot-password', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

      // Save token to database
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      // Send reset email
      const transporter = nodemailer.createTransport({
        // Your email configuration
      });
      const mailOptions = {
        from: 'your-email@example.com',
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
          <p>Please click on the following link to reset your password:</p>
          <a href="http://your-app-url/reset-password/${resetToken}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        `
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          req.session.error = 'Error sending reset email.';
          res.redirect('/forgot-password');
        } else {
          req.session.success = 'Password reset email sent.';
          res.redirect('/forgot-password');
        }
      });
    } else {
      req.session.error = 'User not found.';
      res.redirect('/forgot-password');
    }
  } catch (err) {
    console.error(err);
    req.session.error = 'Internal server error.';
    res.redirect('/forgot-password');
  }
});

// Reset password route
app.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (user) {
      res.render('reset-password', { token });
    } else {
      req.session.error = 'Invalid or expired token.';
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    req.session.error = 'Internal server error.';
    res.redirect('/');
  }
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (user) {
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password and clear reset token
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      req.session.success = 'Password reset successfully.';
      res.redirect('/login');
    } else {
      req.session.error = 'Invalid or expired token.';
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    req.session.error = 'Internal server error.';
    res.redirect('/');
  }
});

// Profile route
app.get('/profile', (req, res) => {
  if (req.session.user) {
    res.render('profile', { user: req.session.user });
  } else {
    req.session.error = 'Please login first.';
    res.redirect('/');
  }
});

app.post('/profile', async (req, res) => {
  const { username, password } = req.body;
  const userId = req.session.user._id; // Assuming you have user ID in the session

  try {
    const user = await User.findById(userId);
    if (user) {
      // Check if username is already taken
      if (username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          req.session.error = 'Username already exists.';
          res.redirect('/profile');
          return;
        }
      }

      // Hash new password if provided
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      // Update username if provided
      if (username) {
        user.username = username;
      }

      await user.save();
      req.session.success = 'Profile updated successfully.';
      res.redirect('/profile');
    } else {
      req.session.error = 'User not found.';
      res.redirect('/profile');
    }
  } catch (err) {
    console.error(err);
    req.session.error = 'Error updating profile.';
    res.redirect('/profile');
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

// Middleware xác thực session
app.use('/home', (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Please login first.';
    res.redirect('/');
  }
});

app.get('/home', (req, res) => {
  if (req.session.user) {
    res.render('home', { user: req.session.user });
  } else {
    res.redirect('/'); // Redirect to login if not logged in
  }
});

// Route for landing page (index)
app.get('/', (req, res) => {
  res.render('index', { error: req.session.error });
  req.session.error = null; // Clear error message after rendering
});

app.listen(8080, () => {
  console.log('Server running on port 8080');
});