const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const adminCtrl = require('../controllers/adminController');

// Configure multer
const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/uploads/images'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});
const fileStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/uploads/files'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});
const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.ppt', '.pptx', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// Auth routes (no middleware)
router.get('/login', adminCtrl.loginPage);
router.post('/login', adminCtrl.login);
router.get('/logout', adminCtrl.logout);

// All routes below require authentication
router.use(requireAuth);

// Dashboard
router.get('/dashboard', adminCtrl.dashboard);

// Settings
router.get('/settings', adminCtrl.settingsPage);
router.post('/settings', adminCtrl.settingsSave);

// Hero Slides
router.get('/slides', adminCtrl.slides.list);
router.get('/slides/new', adminCtrl.slides.newForm);
router.post('/slides/new', uploadImage.single('image'), adminCtrl.slides.create);
router.get('/slides/:id/edit', adminCtrl.slides.editForm);
router.post('/slides/:id/edit', uploadImage.single('image'), adminCtrl.slides.update);
router.post('/slides/:id/delete', adminCtrl.slides.delete);

// News
router.get('/news', adminCtrl.news.list);
router.get('/news/new', adminCtrl.news.newForm);
router.post('/news/new', uploadImage.single('image'), adminCtrl.news.create);
router.get('/news/:id/edit', adminCtrl.news.editForm);
router.post('/news/:id/edit', uploadImage.single('image'), adminCtrl.news.update);
router.post('/news/:id/delete', adminCtrl.news.delete);

// Events
router.get('/events', adminCtrl.events.list);
router.get('/events/new', adminCtrl.events.newForm);
router.post('/events/new', uploadImage.single('image'), adminCtrl.events.create);
router.get('/events/:id/edit', adminCtrl.events.editForm);
router.post('/events/:id/edit', uploadImage.single('image'), adminCtrl.events.update);
router.post('/events/:id/delete', adminCtrl.events.delete);

// Gallery
router.get('/gallery', adminCtrl.gallery.list);
router.get('/gallery/new', adminCtrl.gallery.newForm);
router.post('/gallery/new', uploadImage.single('image'), adminCtrl.gallery.create);
router.get('/gallery/:id/edit', adminCtrl.gallery.editForm);
router.post('/gallery/:id/edit', uploadImage.single('image'), adminCtrl.gallery.update);
router.post('/gallery/:id/delete', adminCtrl.gallery.delete);

// Staff
router.get('/staff', adminCtrl.staff.list);
router.get('/staff/new', adminCtrl.staff.newForm);
router.post('/staff/new', uploadImage.single('image'), adminCtrl.staff.create);
router.get('/staff/:id/edit', adminCtrl.staff.editForm);
router.post('/staff/:id/edit', uploadImage.single('image'), adminCtrl.staff.update);
router.post('/staff/:id/delete', adminCtrl.staff.delete);

// Testimonials
router.get('/testimonials', adminCtrl.testimonials.list);
router.get('/testimonials/new', adminCtrl.testimonials.newForm);
router.post('/testimonials/new', adminCtrl.testimonials.create);
router.get('/testimonials/:id/edit', adminCtrl.testimonials.editForm);
router.post('/testimonials/:id/edit', adminCtrl.testimonials.update);
router.post('/testimonials/:id/delete', adminCtrl.testimonials.delete);

// Downloads
router.get('/downloads', adminCtrl.downloads.list);
router.get('/downloads/new', adminCtrl.downloads.newForm);
router.post('/downloads/new', uploadFile.single('file'), adminCtrl.downloads.create);
router.get('/downloads/:id/edit', adminCtrl.downloads.editForm);
router.post('/downloads/:id/edit', uploadFile.single('file'), adminCtrl.downloads.update);
router.post('/downloads/:id/delete', adminCtrl.downloads.delete);

// Announcements
router.get('/announcements', adminCtrl.announcements.list);
router.get('/announcements/new', adminCtrl.announcements.newForm);
router.post('/announcements/new', adminCtrl.announcements.create);
router.get('/announcements/:id/edit', adminCtrl.announcements.editForm);
router.post('/announcements/:id/edit', adminCtrl.announcements.update);
router.post('/announcements/:id/delete', adminCtrl.announcements.delete);

// Achievements
router.get('/achievements', adminCtrl.achievements.list);
router.get('/achievements/new', adminCtrl.achievements.newForm);
router.post('/achievements/new', adminCtrl.achievements.create);
router.get('/achievements/:id/edit', adminCtrl.achievements.editForm);
router.post('/achievements/:id/edit', adminCtrl.achievements.update);
router.post('/achievements/:id/delete', adminCtrl.achievements.delete);

// Pages
router.get('/pages', adminCtrl.pages.list);
router.get('/pages/:id/edit', adminCtrl.pages.editForm);
router.post('/pages/:id/edit', adminCtrl.pages.update);

// Messages
router.get('/messages', adminCtrl.messagesList);
router.get('/messages/:id', adminCtrl.messageView);
router.post('/messages/:id/delete', adminCtrl.messageDelete);

// Users
router.get('/users', adminCtrl.usersList);
router.get('/users/new', adminCtrl.userNewForm);
router.post('/users/new', adminCtrl.userCreate);
router.get('/users/:id/edit', adminCtrl.userEditForm);
router.post('/users/:id/edit', adminCtrl.userUpdate);
router.post('/users/:id/delete', adminCtrl.userDelete);

module.exports = router;
