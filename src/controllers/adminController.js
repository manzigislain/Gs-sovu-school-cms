const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const path = require('path');

// ============ AUTH ============
exports.loginPage = (req, res) => {
  res.render('admin/login', {});
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!result.rows.length) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/admin/login');
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/admin/login');
    }
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/admin/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
};

// ============ DASHBOARD ============
exports.dashboard = async (req, res) => {
  try {
    const [newsR, eventsR, galleryR, messagesR, announcementsR, downloadsR, staffR, usersR, testimonialsR, achievementsR, slidesR] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM news'),
      pool.query('SELECT COUNT(*) as count FROM events WHERE active=true'),
      pool.query('SELECT COUNT(*) as count FROM gallery WHERE active=true'),
      pool.query('SELECT COUNT(*) as count FROM contact_messages'),
      pool.query('SELECT COUNT(*) as count FROM announcements WHERE active=true'),
      pool.query('SELECT COUNT(*) as count FROM downloads WHERE active=true'),
      pool.query('SELECT COUNT(*) as count FROM staff WHERE active=true'),
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM testimonials WHERE active=true'),
      pool.query('SELECT COUNT(*) as count FROM achievements WHERE active=true'),
      pool.query('SELECT COUNT(*) as count FROM hero_slides WHERE active=true'),
    ]);
    const recentMessages = (await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5')).rows;
    const recentNews = (await pool.query('SELECT * FROM news ORDER BY created_at DESC LIMIT 5')).rows;

    const stats = {
      news: parseInt(newsR.rows[0].count),
      events: parseInt(eventsR.rows[0].count),
      gallery: parseInt(galleryR.rows[0].count),
      messages: parseInt(messagesR.rows[0].count),
      announcements: parseInt(announcementsR.rows[0].count),
      downloads: parseInt(downloadsR.rows[0].count),
      staff: parseInt(staffR.rows[0].count),
      users: parseInt(usersR.rows[0].count),
      testimonials: parseInt(testimonialsR.rows[0].count),
      achievements: parseInt(achievementsR.rows[0].count),
      slides: parseInt(slidesR.rows[0].count),
    };

    res.render('admin/dashboard', { stats, recentMessages, recentNews, user: req.session.user });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.render('admin/dashboard', {
      stats: { news: 0, events: 0, gallery: 0, messages: 0, announcements: 0, downloads: 0, staff: 0, users: 0, testimonials: 0, achievements: 0, slides: 0 },
      recentMessages: [], recentNews: [], user: req.session.user
    });
  }
};

// ============ SETTINGS ============
exports.settingsPage = async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const s = {};
    result.rows.forEach(r => { s[r.key] = r.value || ''; });
    res.render('admin/settings', { s, user: req.session.user });
  } catch (err) {
    res.redirect('/admin/dashboard');
  }
};

exports.settingsSave = async (req, res) => {
  try {
    const fields = [
      'school_name', 'school_tagline', 'school_type', 'school_address',
      'school_phone1', 'school_phone2', 'school_email', 'footer_about',
      'admissions_info', 'about_intro', 'mission', 'vision', 'motto',
      'head_teacher_name', 'head_teacher_image', 'head_teacher_message',
      'facebook_url', 'twitter_url', 'youtube_url',
      'why_choose_1_title', 'why_choose_1_desc',
      'why_choose_2_title', 'why_choose_2_desc',
      'why_choose_3_title', 'why_choose_3_desc',
      'why_choose_4_title', 'why_choose_4_desc',
    ];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        await pool.query(
          'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()',
          [field, req.body[field]]
        );
      }
    }
    req.flash('success', 'Settings saved successfully.');
    res.redirect('/admin/settings');
  } catch (err) {
    console.error('Settings error:', err);
    req.flash('error', 'Failed to save settings.');
    res.redirect('/admin/settings');
  }
};

// ============ GENERIC CRUD FACTORY ============
function createCrud(tableName, viewPrefix, options = {}) {
  const { orderBy = 'created_at DESC', extraFields = [] } = options;

  return {
    // List
    list: async (req, res) => {
      try {
        const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY ${orderBy}`);
        res.render(`admin/${viewPrefix}-list`, { items: result.rows, user: req.session.user });
      } catch (err) {
        console.error(`List ${tableName} error:`, err);
        res.render(`admin/${viewPrefix}-list`, { items: [], user: req.session.user });
      }
    },

    // New form
    newForm: (req, res) => {
      res.render(`admin/${viewPrefix}-form`, { item: null, user: req.session.user });
    },

    // Create
    create: async (req, res) => {
      try {
        const body = { ...req.body };
        // Handle file uploads
        if (req.file) {
          if (options.fileField) {
            body[options.fileField] = '/uploads/files/' + req.file.filename;
          } else {
            body.image_url = '/uploads/images/' + req.file.filename;
          }
        }

        const keys = Object.keys(body).filter(k => k !== 'existing_image' && k !== 'existing_file');
        const values = keys.map(k => body[k]);
        const placeholders = keys.map((_, i) => `$${i + 1}`);

        // Handle special field conversions
        const processedValues = values.map((v, i) => {
          const key = keys[i];
          if (key === 'published' || key === 'featured' || key === 'active') return v === 'true' || v === true;
          return v;
        });

        await pool.query(
          `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders.join(',')})`,
          processedValues
        );
        req.flash('success', `${options.label || tableName} created successfully.`);
        res.redirect(`/admin/${viewPrefix}`);
      } catch (err) {
        console.error(`Create ${tableName} error:`, err);
        req.flash('error', `Failed to create: ${err.message}`);
        res.redirect(`/admin/${viewPrefix}/new`);
      }
    },

    // Edit form
    editForm: async (req, res) => {
      try {
        const result = await pool.query(`SELECT * FROM ${tableName} WHERE id=$1`, [req.params.id]);
        if (!result.rows.length) {
          req.flash('error', 'Item not found.');
          return res.redirect(`/admin/${viewPrefix}`);
        }
        res.render(`admin/${viewPrefix}-form`, { item: result.rows[0], user: req.session.user });
      } catch (err) {
        res.redirect(`/admin/${viewPrefix}`);
      }
    },

    // Update
    update: async (req, res) => {
      try {
        const body = { ...req.body };

        // Handle file uploads
        if (req.file) {
          if (options.fileField) {
            body[options.fileField] = '/uploads/files/' + req.file.filename;
          } else {
            body.image_url = '/uploads/images/' + req.file.filename;
          }
        }

        const keys = Object.keys(body).filter(k => k !== 'existing_image' && k !== 'existing_file');
        const values = keys.map(k => body[k]);

        // Handle special field conversions
        const processedValues = values.map((v, i) => {
          const key = keys[i];
          if (key === 'published' || key === 'featured' || key === 'active') return v === 'true' || v === true;
          return v;
        });

        const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
        processedValues.push(req.params.id);

        await pool.query(
          `UPDATE ${tableName} SET ${setClause}, updated_at=NOW() WHERE id=$${keys.length + 1}`,
          processedValues
        );
        req.flash('success', `${options.label || tableName} updated successfully.`);
        res.redirect(`/admin/${viewPrefix}`);
      } catch (err) {
        console.error(`Update ${tableName} error:`, err);
        req.flash('error', `Failed to update: ${err.message}`);
        res.redirect(`/admin/${viewPrefix}`);
      }
    },

    // Delete
    delete: async (req, res) => {
      try {
        await pool.query(`DELETE FROM ${tableName} WHERE id=$1`, [req.params.id]);
        req.flash('success', `${options.label || tableName} deleted successfully.`);
      } catch (err) {
        console.error(`Delete ${tableName} error:`, err);
        req.flash('error', `Failed to delete: ${err.message}`);
      }
      res.redirect(`/admin/${viewPrefix}`);
    },
  };
}

// Create CRUD instances
const slides = createCrud('hero_slides', 'slides', { orderBy: 'sort_order ASC' });
const news = createCrud('news', 'news');
const events = createCrud('events', 'events', { orderBy: 'event_date DESC' });
const gallery = createCrud('gallery', 'gallery', { orderBy: 'sort_order ASC, created_at DESC' });
const staff = createCrud('staff', 'staff', { orderBy: 'sort_order ASC' });
const testimonials = createCrud('testimonials', 'testimonials');
const downloads = createCrud('downloads', 'downloads', { orderBy: 'created_at DESC', fileField: 'file_url' });
const announcements = createCrud('announcements', 'announcements');
const achievements = createCrud('achievements', 'achievements', { orderBy: 'year DESC' });
const pages = createCrud('pages', 'pages', { orderBy: 'title ASC' });

// Expose CRUD handlers
exports.slides = slides;
exports.news = news;
exports.events = events;
exports.gallery = gallery;
exports.staff = staff;
exports.testimonials = testimonials;
exports.downloads = downloads;
exports.announcements = announcements;
exports.achievements = achievements;
exports.pages = pages;

// ============ MESSAGES ============
exports.messagesList = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.render('admin/messages-list', { items: result.rows, user: req.session.user });
  } catch (err) {
    res.render('admin/messages-list', { items: [], user: req.session.user });
  }
};

exports.messageView = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages WHERE id=$1', [req.params.id]);
    if (!result.rows.length) {
      req.flash('error', 'Message not found.');
      return res.redirect('/admin/messages');
    }
    // Mark as read
    await pool.query('UPDATE contact_messages SET read=true WHERE id=$1', [req.params.id]);
    res.render('admin/message-view', { item: result.rows[0], user: req.session.user });
  } catch (err) {
    res.redirect('/admin/messages');
  }
};

exports.messageDelete = async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_messages WHERE id=$1', [req.params.id]);
    req.flash('success', 'Message deleted.');
  } catch (err) {
    req.flash('error', 'Failed to delete message.');
  }
  res.redirect('/admin/messages');
};

// ============ USERS ============
exports.usersList = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.render('admin/users-list', { items: result.rows, user: req.session.user });
  } catch (err) {
    res.render('admin/users-list', { items: [], user: req.session.user });
  }
};

exports.userNewForm = (req, res) => {
  res.render('admin/users-form', { item: null, user: req.session.user });
};

exports.userCreate = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)', [name, email, hash, role || 'admin']);
    req.flash('success', 'User created successfully.');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('User create error:', err);
    req.flash('error', 'Failed to create user: ' + err.message);
    res.redirect('/admin/users/new');
  }
};

exports.userEditForm = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
    if (!result.rows.length) {
      req.flash('error', 'User not found.');
      return res.redirect('/admin/users');
    }
    res.render('admin/users-form', { item: result.rows[0], user: req.session.user });
  } catch (err) {
    res.redirect('/admin/users');
  }
};

exports.userUpdate = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET name=$1, email=$2, password=$3, role=$4 WHERE id=$5', [name, email, hash, role || 'admin', req.params.id]);
    } else {
      await pool.query('UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4', [name, email, role || 'admin', req.params.id]);
    }
    req.flash('success', 'User updated successfully.');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('User update error:', err);
    req.flash('error', 'Failed to update user.');
    res.redirect('/admin/users');
  }
};

exports.userDelete = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.session.user.id) {
      req.flash('error', 'You cannot delete your own account.');
      return res.redirect('/admin/users');
    }
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    req.flash('success', 'User deleted.');
  } catch (err) {
    req.flash('error', 'Failed to delete user.');
  }
  res.redirect('/admin/users');
};
