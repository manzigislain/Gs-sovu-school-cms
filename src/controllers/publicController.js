const pool = require('../db/pool');

// Helper to convert flash messages
function getFlashMessages(req) {
  const msgs = [];
  const errors = req.flash('error');
  const successes = req.flash('success');
  errors.forEach(m => msgs.push({ type: 'error', msg: m }));
  successes.forEach(m => msgs.push({ type: 'success', msg: m }));
  return msgs;
}

exports.home = async (req, res) => {
  try {
    const [slidesR, newsR, eventsR, galleryR, announcementsR, achievementsR, testimonialsR] = await Promise.all([
      pool.query('SELECT * FROM hero_slides WHERE active=true ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM news WHERE published=true ORDER BY created_at DESC LIMIT 6'),
      pool.query("SELECT * FROM events WHERE active=true AND event_date >= CURRENT_DATE - INTERVAL '7 days' ORDER BY event_date ASC LIMIT 6"),
      pool.query('SELECT * FROM gallery WHERE active=true ORDER BY sort_order ASC LIMIT 6'),
      pool.query('SELECT * FROM announcements WHERE active=true AND (expires_at IS NULL OR expires_at >= CURRENT_DATE) ORDER BY created_at DESC LIMIT 10'),
      pool.query('SELECT * FROM achievements WHERE active=true ORDER BY year DESC LIMIT 6'),
      pool.query('SELECT * FROM testimonials WHERE active=true ORDER BY created_at DESC LIMIT 6'),
    ]);
    res.render('public/home', {
      title: 'Home',
      slides: slidesR.rows,
      news: newsR.rows,
      events: eventsR.rows,
      gallery: galleryR.rows,
      announcements: announcementsR.rows,
      achievements: achievementsR.rows,
      testimonials: testimonialsR.rows,
    });
  } catch (err) {
    console.error('Home error:', err);
    res.render('public/home', {
      title: 'Home',
      slides: [], news: [], events: [], gallery: [],
      announcements: [], achievements: [], testimonials: [],
    });
  }
};

exports.about = (req, res) => {
  res.render('public/about', { title: 'About Us' });
};

exports.academics = (req, res) => {
  res.render('public/academics', { title: 'Academic Programs' });
};

exports.admissions = async (req, res) => {
  try {
    const downloadsR = await pool.query("SELECT * FROM downloads WHERE active=true AND category ILIKE '%admission%' ORDER BY created_at DESC LIMIT 5");
    res.render('public/admissions', { title: 'Admissions', downloads: downloadsR.rows });
  } catch (err) {
    res.render('public/admissions', { title: 'Admissions', downloads: [] });
  }
};

exports.contact = (req, res) => {
  res.render('public/contact', {
    title: 'Contact Us',
    success: req.query.success === '1',
    error: null,
  });
};

exports.contactPost = async (req, res) => {
  try {
    const { full_name, email, subject, message } = req.body;
    let attachment_url = null;
    if (req.file) {
      attachment_url = '/uploads/files/' + req.file.filename;
    }
    await pool.query(
      'INSERT INTO contact_messages (full_name, email, subject, message, attachment_url) VALUES ($1,$2,$3,$4,$5)',
      [full_name, email, subject, message, attachment_url]
    );
    res.redirect('/contact?success=1');
  } catch (err) {
    console.error('Contact error:', err);
    res.render('public/contact', {
      title: 'Contact Us',
      success: false,
      error: 'Failed to send message. Please try again.',
    });
  }
};

exports.news = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM news WHERE published=true ORDER BY created_at DESC');
    res.render('public/news', { title: 'News', news: result.rows });
  } catch (err) {
    res.render('public/news', { title: 'News', news: [] });
  }
};

exports.newsSingle = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM news WHERE slug=$1', [req.params.slug]);
    if (!result.rows.length) return res.status(404).render('public/page', {
      title: 'Not Found',
      page: { title: 'Article Not Found', content: '<div class="text-center py-5"><p class="text-muted">This news article could not be found.</p><a href="/news" class="btn-primary-custom">Back to News</a></div>' }
    });
    res.render('public/news-single', { title: result.rows[0].title, article: result.rows[0] });
  } catch (err) {
    res.redirect('/news');
  }
};

exports.gallery = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gallery WHERE active=true ORDER BY sort_order ASC');
    res.render('public/gallery', { title: 'Gallery', gallery: result.rows });
  } catch (err) {
    res.render('public/gallery', { title: 'Gallery', gallery: [] });
  }
};

exports.events = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE active=true ORDER BY event_date ASC');
    res.render('public/events', { title: 'Events', events: result.rows });
  } catch (err) {
    res.render('public/events', { title: 'Events', events: [] });
  }
};

exports.staff = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff WHERE active=true ORDER BY sort_order ASC');
    res.render('public/staff', { title: 'Staff', staff: result.rows });
  } catch (err) {
    res.render('public/staff', { title: 'Staff', staff: [] });
  }
};

exports.parents = async (req, res) => {
  try {
    const downloadsR = await pool.query("SELECT * FROM downloads WHERE active=true AND category ILIKE '%parent%' ORDER BY created_at DESC LIMIT 10");
    res.render('public/parents', { title: 'Parents', downloads: downloadsR.rows });
  } catch (err) {
    res.render('public/parents', { title: 'Parents', downloads: [] });
  }
};

exports.downloads = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM downloads WHERE active=true ORDER BY category, created_at DESC');
    res.render('public/downloads', { title: 'Downloads', downloads: result.rows });
  } catch (err) {
    res.render('public/downloads', { title: 'Downloads', downloads: [] });
  }
};

exports.announcements = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM announcements WHERE active=true AND (expires_at IS NULL OR expires_at >= CURRENT_DATE) ORDER BY created_at DESC");
    res.render('public/announcements', { title: 'Announcements', announcements: result.rows });
  } catch (err) {
    res.render('public/announcements', { title: 'Announcements', announcements: [] });
  }
};

exports.achievements = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM achievements WHERE active=true ORDER BY year DESC');
    res.render('public/achievements', { title: 'Achievements', achievements: result.rows });
  } catch (err) {
    res.render('public/achievements', { title: 'Achievements', achievements: [] });
  }
};

exports.library = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM downloads WHERE active=true AND (category ILIKE '%past paper%' OR category ILIKE '%library%' OR category ILIKE '%resource%') ORDER BY created_at DESC LIMIT 20");
    res.render('public/library', { title: 'Library', downloads: result.rows });
  } catch (err) {
    res.render('public/library', { title: 'Library', downloads: [] });
  }
};

exports.cmsPage = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pages WHERE slug=$1', [req.params.slug]);
    if (!result.rows.length) return res.status(404).render('public/page', {
      title: 'Not Found',
      page: { title: 'Page Not Found', content: '<div class="text-center py-5"><p class="text-muted">This page could not be found.</p><a href="/" class="btn-primary-custom">Back to Home</a></div>' }
    });
    const page = result.rows[0];
    res.render('public/page', { title: page.title, page });
  } catch (err) {
    res.redirect('/');
  }
};
