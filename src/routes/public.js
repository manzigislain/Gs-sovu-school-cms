const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const publicCtrl = require('../controllers/publicController');

// Configure multer for file uploads
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
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('File type not allowed'));
  }
});

// Public pages
router.get('/', publicCtrl.home);
router.get('/about', publicCtrl.about);
router.get('/academics', publicCtrl.academics);
router.get('/admissions', publicCtrl.admissions);
router.get('/contact', publicCtrl.contact);
router.post('/contact', uploadFile.single('attachment'), publicCtrl.contactPost);
router.get('/news', publicCtrl.news);
router.get('/news/:slug', publicCtrl.newsSingle);
router.get('/gallery', publicCtrl.gallery);
router.get('/events', publicCtrl.events);
router.get('/staff', publicCtrl.staff);
router.get('/parents', publicCtrl.parents);
router.get('/downloads', publicCtrl.downloads);
router.get('/announcements', publicCtrl.announcements);
router.get('/achievements', publicCtrl.achievements);
router.get('/library', publicCtrl.library);

// CMS pages (history, requirements, calendar, past-papers, clubs, sports, faqs, privacy, terms, etc.)
router.get('/:slug', publicCtrl.cmsPage);

module.exports = router;
