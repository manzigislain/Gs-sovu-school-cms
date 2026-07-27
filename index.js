require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const initDB = require('./src/db/init');
const pool = require('./src/db/pool');

const app = express();
const PORT = process.env.PORT || 3002;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override for forms
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'sovu_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Flash messages
app.use(flash());

// Global middleware: settings + flash messages
app.use(async (req, res, next) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.locals.settings = settings;
  } catch (err) {
    res.locals.settings = {};
  }

  // Convert flash messages to format expected by admin views
  const msgs = [];
  flashMessages = flash();
  if (req.flash) {
    const errors = req.flash('error');
    const successes = req.flash('success');
    errors.forEach(m => msgs.push({ type: 'error', msg: m }));
    successes.forEach(m => msgs.push({ type: 'success', msg: m }));
  }
  res.locals.messages = msgs;
  next();
});

// Routes
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('public/page', {
    title: 'Page Not Found',
    page: { title: 'Page Not Found', content: '<div class="text-center py-5"><i class="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i><h3>Page Not Found</h3><p class="text-muted">The page you are looking for does not exist or has been moved.</p><a href="/" class="btn-gold mt-3">Back to Home</a></div>' }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('public/page', {
    title: 'Server Error',
    page: { title: 'Server Error', content: '<div class="text-center py-5"><i class="fas fa-server fa-4x text-danger mb-3"></i><h3>Something went wrong</h3><p class="text-muted">We are experiencing technical difficulties. Please try again later.</p><a href="/" class="btn-gold mt-3">Back to Home</a></div>' }
  });
});

// Initialize DB and start server
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`\n✅ G.S. SOVU School CMS running at http://localhost:${PORT}`);
      console.log(`   Admin panel: http://localhost:${PORT}/admin/login`);
      console.log(`   Credentials: admin@gsovu.rw / admin123\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
