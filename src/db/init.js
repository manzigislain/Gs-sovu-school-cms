const pool = require('./pool');
const bcrypt = require('bcryptjs');

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS hero_slides (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200),
        subtitle TEXT,
        image_url VARCHAR(500),
        button_text VARCHAR(100),
        button_link VARCHAR(200),
        sort_order INT DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        slug VARCHAR(300) UNIQUE NOT NULL,
        content TEXT,
        excerpt TEXT,
        image_url VARCHAR(500),
        category VARCHAR(100),
        published BOOLEAN DEFAULT FALSE,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        description TEXT,
        event_date DATE,
        event_time VARCHAR(50),
        location VARCHAR(200),
        image_url VARCHAR(500),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200),
        image_url VARCHAR(500) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        sort_order INT DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        position VARCHAR(150),
        department VARCHAR(100),
        bio TEXT,
        image_url VARCHAR(500),
        email VARCHAR(150),
        phone VARCHAR(50),
        staff_type VARCHAR(50) DEFAULT 'teacher',
        sort_order INT DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        role VARCHAR(100),
        message TEXT NOT NULL,
        image_url VARCHAR(500),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS downloads (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        description TEXT,
        file_url VARCHAR(500) NOT NULL,
        category VARCHAR(100),
        file_type VARCHAR(20) DEFAULT 'pdf',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject VARCHAR(300),
        message TEXT NOT NULL,
        attachment_url VARCHAR(500),
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        content TEXT,
        priority VARCHAR(20) DEFAULT 'normal',
        active BOOLEAN DEFAULT TRUE,
        expires_at DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(200) UNIQUE NOT NULL,
        title VARCHAR(300) NOT NULL,
        content TEXT,
        meta_description TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        description TEXT,
        year INT,
        image_url VARCHAR(500),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed default settings
    const defaultSettings = [
      ['school_name', 'G.S. SOVU'],
      ['school_tagline', 'Faith • Knowledge • Discipline • Excellence'],
      ['school_email', 'nyirasafarijoyeuse06@gmail.com'],
      ['school_phone1', '+250 781 270 733'],
      ['school_phone2', '+250 783 076 704'],
      ['school_address', 'Sovu, Huye District, Southern Province, Rwanda'],
      ['school_type', 'Catholic Government-Aided Day School'],
      ['about_intro', 'G.S. SOVU is a Catholic Government-Aided Day School offering Primary, O\'Level, and A\'Level education. Founded with the mission to educate and form young people in the values of faith, knowledge, and discipline, the school has grown to become a respected institution in the region. We are committed to nurturing students academically, spiritually, morally, and socially.'],
      ['mission', 'To provide quality Catholic education that develops the whole person — intellectually, spiritually, morally, and socially — preparing students to serve God and humanity with competence and compassion.'],
      ['vision', 'To be a leading Catholic school in Rwanda, recognized for academic excellence, strong moral values, and holistic development of every student, producing responsible citizens who contribute positively to society.'],
      ['motto', 'Faith • Knowledge • Discipline • Excellence'],
      ['head_teacher_name', 'The Head Teacher'],
      ['head_teacher_message', 'Welcome to G.S. SOVU. Our school is dedicated to providing a nurturing environment where every student can grow academically, spiritually, and morally. We believe in the power of education guided by faith and discipline to transform lives and communities. Together with our dedicated staff, we work to ensure that each child receives the best possible education in a caring Catholic environment.'],
      ['head_teacher_image', ''],
      ['facebook_url', '#'],
      ['twitter_url', '#'],
      ['youtube_url', '#'],
      ['why_choose_1_title', 'Academic Excellence'],
      ['why_choose_1_desc', 'Consistently high performance in national examinations with dedicated and qualified teachers guiding every student.'],
      ['why_choose_2_title', 'Catholic Values'],
      ['why_choose_2_desc', 'Rooted in faith, we develop moral character alongside academic achievement for lifelong success.'],
      ['why_choose_3_title', 'Holistic Development'],
      ['why_choose_3_desc', 'Sports, clubs, arts, and leadership programs for well-rounded students prepared for life.'],
      ['why_choose_4_title', 'Experienced Staff'],
      ['why_choose_4_desc', 'Qualified and passionate educators committed to the success and wellbeing of every student.'],
      ['admissions_info', 'We welcome applications from students who share our commitment to academic excellence and Catholic values. Admissions are open for Primary, O\'Level, and A\'Level programs. Our application process is designed to identify students who will thrive in our nurturing academic environment.'],
      ['footer_about', 'G.S. SOVU is a Catholic Government-Aided Day School dedicated to academic excellence, faith, and character development. We serve the community of Sovu and surrounding areas with quality education from Primary through Advanced Level.'],
    ];

    for (const [key, value] of defaultSettings) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
        [key, value]
      );
    }

    // Seed comprehensive CMS pages
    const defaultPages = [
      ['history', 'Our History', `<div class="mb-4">
  <h2 style="color:var(--primary)">The History of G.S. SOVU</h2>
  <p>G.S. SOVU has a rich and inspiring history of providing quality Catholic education in Rwanda. The school was established with the mission to educate and form young people in the values of faith, knowledge, and discipline.</p>
</div>
<div class="mb-4">
  <h3 style="color:var(--primary)">Foundation & Early Years</h3>
  <p>G.S. SOVU was founded by the Catholic Church in the Sovu area of Huye District, Southern Province. From its humble beginnings, the school has grown steadily, guided by the dedication of its founders and the support of the local community. The Catholic Diocese played a pivotal role in establishing the school, ensuring that education was accessible to all children in the region regardless of their background.</p>
</div>
<div class="mb-4">
  <h3 style="color:var(--primary)">Growth & Development</h3>
  <p>Over the decades, G.S. SOVU has expanded its facilities and academic programs. What started as a small primary school has grown to offer O'Level and Advanced Level education. The school has consistently invested in qualified teachers, modern classrooms, and learning resources to provide the best possible education for its students.</p>
  <p>Key milestones in our history include:</p>
  <ul class="mt-2">
    <li>Establishment of the primary section, laying the foundation for quality education</li>
    <li>Introduction of O'Level programs, expanding opportunities for secondary education</li>
    <li>Launch of A'Level with LFK and MEG combinations, enabling university preparation</li>
    <li>Construction of modern science laboratories and computer facilities</li>
    <li>Recognition as one of the top-performing schools in the district</li>
  </ul>
</div>
<div class="mb-4">
  <h3 style="color:var(--primary)">Our Legacy</h3>
  <p>Thousands of students have passed through our doors, going on to serve their communities and nation with distinction. Our Catholic heritage continues to guide our educational philosophy and daily life, producing graduates who are not only academically competent but also morally upright and socially responsible citizens.</p>
</div>`],
      ['about', 'About Us', `<h2>About G.S. SOVU</h2><p>G.S. SOVU is a Catholic Government-Aided Day School offering education from Primary through Advanced Level. We are committed to the holistic development of every student.</p>`],
      ['admissions', 'Admissions', `<h2>Admissions</h2><p>We welcome students who are committed to academic excellence and Catholic values.</p>`],
      ['academics', 'Academics', `<h2>Academic Programs</h2><p>We offer comprehensive academic programs at Primary, O'Level, and A'Level.</p>`],
      ['clubs', 'Clubs & Activities', `<div class="mb-4">
  <h2 style="color:var(--primary)">Clubs & Extracurricular Activities</h2>
  <p class="text-muted">At G.S. SOVU, we believe that education extends beyond the classroom. Our wide range of clubs and activities help students develop their talents, build character, and learn important life skills.</p>
</div>
<div class="row g-4">
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-book-open me-2 text-warning"></i>Debate Club</h5>
      <p class="text-muted small">Students develop public speaking, critical thinking, and argumentation skills through regular debates and competitions.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-music me-2 text-warning"></i>Choir & Music</h5>
      <p class="text-muted small">Our school choir performs at church services, school events, and competitions, nurturing musical talent and teamwork.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-microscope me-2 text-warning"></i>Science Club</h5>
      <p class="text-muted small">Students explore scientific concepts through experiments, projects, and science fairs, fostering innovation and inquiry.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-palette me-2 text-warning"></i>Art & Craft Club</h5>
      <p class="text-muted small">Creative expression through painting, drawing, sculpture, and traditional crafts.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-laptop me-2 text-warning"></i>Computer/ICT Club</h5>
      <p class="text-muted small">Students learn computer skills, coding basics, and digital literacy through hands-on sessions.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-leaf me-2 text-warning"></i>Environmental Club</h5>
      <p class="text-muted small">Promoting environmental awareness through tree planting, clean-up campaigns, and sustainability projects.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-cross me-2 text-warning"></i>Religion Club</h5>
      <p class="text-muted small">Deepening Catholic faith through scripture study, prayer groups, and community service activities.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-theater-masks me-2 text-warning"></i>Drama Club</h5>
      <p class="text-muted small">Students develop acting, scriptwriting, and performance skills through plays and cultural performances.</p>
    </div>
  </div>
</div>`],
      ['sports', 'Sports & Athletics', `<div class="mb-4">
  <h2 style="color:var(--primary)">Sports & Athletics</h2>
  <p class="text-muted">Physical education and sports are integral to the holistic development of every student at G.S. SOVU. Our sports program promotes fitness, teamwork, discipline, and healthy competition.</p>
</div>
<div class="row g-4">
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-futbol me-2 text-warning"></i>Football (Soccer)</h5>
      <p class="text-muted small">Both boys and girls teams train regularly and compete in district and regional tournaments.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-basketball-ball me-2 text-warning"></i>Basketball</h5>
      <p class="text-muted small">Our basketball teams participate in inter-school competitions and develop athletic skills.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-running me-2 text-warning"></i>Athletics</h5>
      <p class="text-muted small">Track and field events including running, long jump, shot put, and relay races.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-volleyball-ball me-2 text-warning"></i>Volleyball</h5>
      <p class="text-muted small">Volleyball is a popular sport among our students with regular training and competitions.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-table-tennis me-2 text-warning"></i>Table Tennis</h5>
      <p class="text-muted small">Indoor table tennis for recreational and competitive play.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-chess me-2 text-warning"></i>Chess</h5>
      <p class="text-muted small">Strategic thinking and problem-solving through chess training and tournaments.</p>
    </div>
  </div>
</div>`],
      ['library', 'School Library', `<div class="mb-4">
  <h2 style="color:var(--primary)">School Library</h2>
  <p class="text-muted">Our school library provides a wide range of educational resources to support learning and research. Students have access to books, reference materials, and digital resources.</p>
</div>
<div class="card p-4">
  <h5 style="color:var(--primary)">Library Services</h5>
  <ul class="text-muted mt-3">
    <li class="mb-2">Lending library with fiction and non-fiction books</li>
    <li class="mb-2">Reference section with textbooks and encyclopedias</li>
    <li class="mb-2">Reading room for quiet study and research</li>
    <li class="mb-2">Computer access for digital research</li>
    <li class="mb-2">Periodicals and magazines</li>
    <li class="mb-2">Career guidance and university preparation resources</li>
  </ul>
</div>`],
      ['privacy', 'Privacy Policy', `<h2>Privacy Policy</h2>
<p class="text-muted">Last updated: January 2024</p>
<div class="mt-4">
  <h4>1. Information We Collect</h4>
  <p>G.S. SOVU collects personal information when you submit a contact form or apply for admission. This may include your name, email address, phone number, and other relevant details.</p>
  <h4 class="mt-3">2. How We Use Your Information</h4>
  <p>We use your information to respond to inquiries, process admissions, and improve our services. We do not sell or share personal information with third parties for marketing purposes.</p>
  <h4 class="mt-3">3. Data Security</h4>
  <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.</p>
  <h4 class="mt-3">4. Cookies</h4>
  <p>Our website uses essential cookies to ensure proper functionality. We do not use tracking cookies for advertising purposes.</p>
  <h4 class="mt-3">5. Contact Us</h4>
  <p>For questions about this privacy policy, please contact us at our school office.</p>
</div>`],
      ['terms', 'Terms & Conditions', `<h2>Terms & Conditions</h2>
<p class="text-muted">Last updated: January 2024</p>
<div class="mt-4">
  <h4>1. Website Use</h4>
  <p>By using the G.S. SOVU website, you agree to these terms and conditions. The information on this website is provided for general informational purposes.</p>
  <h4 class="mt-3">2. Accuracy of Information</h4>
  <p>While we strive to keep information accurate and up to date, we make no warranties about the completeness or accuracy of the content on this website.</p>
  <h4 class="mt-3">3. Intellectual Property</h4>
  <p>All content on this website, including text, images, and design, is the property of G.S. SOVU unless otherwise stated.</p>
  <h4 class="mt-3">4. External Links</h4>
  <p>Our website may contain links to external sites. We are not responsible for the content or privacy practices of these external websites.</p>
  <h4 class="mt-3">5. Changes to Terms</h4>
  <p>We reserve the right to update these terms at any time. Changes will be posted on this page.</p>
</div>`],
      ['requirements', 'School Requirements', `<div class="mb-4">
  <h2 style="color:var(--primary)">School Requirements</h2>
  <p class="text-muted">Below are the required items for students at G.S. SOVU. Please ensure all requirements are met at the beginning of each term.</p>
</div>
<div class="row g-4">
  <div class="col-lg-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-book me-2 text-warning"></i>Academic Materials</h5>
      <ul class="text-muted small mt-2">
        <li class="mb-2">School uniforms (as per school regulations)</li>
        <li class="mb-2">Exercise books and textbooks as specified by teachers</li>
        <li class="mb-2">Writing materials (pens, pencils, rulers, erasers)</li>
        <li class="mb-2">Scientific calculator (for A'Level students)</li>
        <li class="mb-2">School bag</li>
      </ul>
    </div>
  </div>
  <div class="col-lg-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-tshirt me-2 text-warning"></i>Uniform Requirements</h5>
      <ul class="text-muted small mt-2">
        <li class="mb-2">School uniform (available at approved suppliers)</li>
        <li class="mb-2">Sports kit for physical education</li>
        <li class="mb-2">School shoes (black, polished)</li>
        <li class="mb-2">School sweater/blazer</li>
        <li class="mb-2">ID card (provided by school)</li>
      </ul>
    </div>
  </div>
  <div class="col-lg-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-utensils me-2 text-warning"></i>Boarding Requirements (if applicable)</h5>
      <ul class="text-muted small mt-2">
        <li class="mb-2">Bedding (mattress, sheets, blanket, pillow)</li>
        <li class="mb-2">Toiletries (soap, toothbrush, towel)</li>
        <li class="mb-2">Personal clothing for weekends</li>
        <li class="mb-2">Sufficient personal effects</li>
      </ul>
    </div>
  </div>
  <div class="col-lg-6">
    <div class="card p-4 h-100">
      <h5 style="color:var(--primary)"><i class="fas fa-file-alt me-2 text-warning"></i>Documents</h5>
      <ul class="text-muted small mt-2">
        <li class="mb-2">Previous school report card</li>
        <li class="mb-2">Birth certificate (copy)</li>
        <li class="mb-2">Passport-size photographs</li>
        <li class="mb-2">Medical certificate</li>
        <li class="mb-2">Fee payment receipt</li>
      </ul>
    </div>
  </div>
</div>`],
      ['calendar', 'School Calendar', `<div class="mb-4">
  <h2 style="color:var(--primary)">School Calendar</h2>
  <p class="text-muted">The academic calendar for G.S. SOVU. Please note that dates may be subject to change by the Ministry of Education.</p>
</div>
<div class="card p-4">
  <h5 style="color:var(--primary)">Academic Year Structure</h5>
  <div class="table-responsive mt-3">
    <table class="table table-bordered">
      <thead><tr><th>Term</th><th>Period</th><th>Duration</th></tr></thead>
      <tbody>
        <tr><td><strong>Term 1</strong></td><td>January - April</td><td>~13 weeks</td></tr>
        <tr><td><strong>Term 2</strong></td><td>May - August</td><td>~13 weeks</td></tr>
        <tr><td><strong>Term 3</strong></td><td>September - November</td><td>~11 weeks</td></tr>
      </tbody>
    </table>
  </div>
  <p class="text-muted small mt-3"><i class="fas fa-info-circle me-1"></i>For the detailed academic calendar including holidays, examination periods, and school events, please contact the school office or check announcements regularly.</p>
</div>`],
      ['past-papers', 'Past Papers', `<div class="mb-4">
  <h2 style="color:var(--primary)">Past Papers & Examination Resources</h2>
  <p class="text-muted">Access past examination papers to help you prepare for upcoming examinations. Practice makes perfect!</p>
</div>
<div class="card p-4 text-center py-5">
  <i class="fas fa-file-pdf fa-4x text-muted mb-3"></i>
  <h5>Coming Soon</h5>
  <p class="text-muted">Past papers will be uploaded to the Downloads section. Check back soon or contact the school library for available resources.</p>
  <a href="/downloads" class="btn-gold mt-2">Browse Downloads</a>
</div>`],
      ['faqs', 'Frequently Asked Questions', `<div class="mb-4">
  <h2 style="color:var(--primary)">Frequently Asked Questions</h2>
  <p class="text-muted">Find answers to common questions about G.S. SOVU.</p>
</div>
<div class="accordion" id="faqAccordion">
  <div class="accordion-item">
    <h2 class="accordion-header"><button class="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">What levels of education does G.S. SOVU offer?</button></h2>
    <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion"><div class="accordion-body text-muted">G.S. SOVU offers three levels of education: Primary School (P1-P6), Ordinary Level or O'Level (S1-S3), and Advanced Level or A'Level (S4-S6). At A'Level, we offer two combinations: LFK (Literature, French, Kinyarwanda) and MEG (Mathematics, Economics, Geography).</div></div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header"><button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">How do I apply for admission?</button></h2>
    <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion"><div class="accordion-body text-muted">Visit our Admissions page for detailed information about the application process. You can obtain an application form from the school office or download it from our website. Complete the form and submit it with the required documents to the school office.</div></div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header"><button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">Is G.S. SOVU a government school?</button></h2>
    <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion"><div class="accordion-body text-muted">Yes, G.S. SOVU is a Catholic Government-Aided Day School. This means we receive government support while maintaining our Catholic identity and values. Our fees are structured to be accessible while maintaining high quality education.</div></div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header"><button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">What are the school hours?</button></h2>
    <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#faqAccordion"><div class="accordion-body text-muted">School hours are from 7:00 AM to 4:00 PM, Monday through Friday. Students are expected to arrive at least 15 minutes before school starts. There are scheduled breaks and a lunch period during the day.</div></div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header"><button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">Does the school provide meals?</button></h2>
    <div id="faq5" class="accordion-collapse collapse" data-bs-parent="#faqAccordion"><div class="accordion-body text-muted">G.S. SOVU is primarily a day school. Students are expected to bring their own lunch or purchase meals from the school canteen where available. We ensure a safe and hygienic dining environment.</div></div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header"><button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq6">What sports and activities are available?</button></h2>
    <div id="faq6" class="accordion-collapse collapse" data-bs-parent="#faqAccordion"><div class="accordion-body text-muted">We offer a wide range of sports including football, basketball, volleyball, athletics, and table tennis. Additionally, we have numerous clubs including debate, science, choir, drama, ICT, and environmental clubs. Visit our Sports and Clubs pages for more details.</div></div>
  </div>
</div>`],
      ['fee-structure', 'School Fees', `<div class="mb-4">
  <h2 style="color:var(--primary)">School Fees Structure</h2>
  <p class="text-muted">G.S. SOVU is committed to providing affordable quality education. Below is an overview of our fee structure.</p>
</div>
<div class="card p-4">
  <p class="text-muted"><i class="fas fa-info-circle me-2 text-warning"></i>For the most current fee structure, please contact the school administration or visit the school office. Fees may vary by academic year and grade level.</p>
  <div class="table-responsive mt-3">
    <table class="table table-bordered">
      <thead><tr><th>Level</th><th>Description</th><th>Fee Category</th></tr></thead>
      <tbody>
        <tr><td><strong>Primary</strong></td><td>P1 - P6</td><td>Government-Aided Rates</td></tr>
        <tr><td><strong>O'Level</strong></td><td>S1 - S3</td><td>Government-Aided Rates</td></tr>
        <tr><td><strong>A'Level</strong></td><td>S4 - S6</td><td>Government-Aided Rates</td></tr>
      </tbody>
    </table>
  </div>
  <h5 class="mt-4" style="color:var(--primary)">Payment Information</h5>
  <ul class="text-muted mt-2">
    <li class="mb-2">Fees can be paid at the school office or through approved bank channels</li>
    <li class="mb-2">Payment plans may be available upon request</li>
    <li class="mb-2">Scholarships may be available for outstanding students in need</li>
    <li class="mb-2">Contact the school office for detailed fee information</li>
  </ul>
</div>`],
    ];

    for (const [slug, title, content] of defaultPages) {
      await client.query(
        `INSERT INTO pages (slug, title, content) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`,
        [slug, title, content]
      );
    }

    // Seed hero slides
    const slides = [
      ['Welcome to G.S. SOVU', 'Faith \u2022 Knowledge \u2022 Discipline \u2022 Excellence — A Catholic Government-Aided Day School nurturing tomorrow\'s leaders.', '/uploads/images/slide1.jpg', 'Learn More', '/about', 1],
      ['Academic Excellence', 'Empowering minds through quality education from Primary through Advanced Level with dedicated teachers.', '/uploads/images/slide2.jpeg', 'Our Programs', '/academics', 2],
      ['Catholic Values & Character', 'Rooted in faith, we build strong moral character alongside academic achievement for lifelong success.', '/uploads/images/slide3.jpg', 'About Us', '/about', 3],
      ['Holistic Student Development', 'Sports, arts, leadership, and clubs for well-rounded students prepared for the challenges of tomorrow.', '/uploads/images/slide4.jpg', 'Gallery', '/gallery', 4],
      ['Join Our Community', 'Applications open for Primary, O\'Level, and A\'Level. Start your journey to excellence today.', '/uploads/images/slide5.jpg', 'Apply Now', '/admissions', 5],
    ];

    for (const [title, subtitle, image_url, button_text, button_link, sort_order] of slides) {
      await client.query(
        `INSERT INTO hero_slides (title, subtitle, image_url, button_text, button_link, sort_order) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [title, subtitle, image_url, button_text, button_link, sort_order]
      );
    }

    // Seed gallery
    const galleryItems = [
      ['School Activities', '/uploads/images/gallery1.jpg', 'activities'],
      ['School Events', '/uploads/images/gallery2.jpeg', 'events'],
      ['Campus Life', '/uploads/images/gallery3.jpg', 'campus'],
      ['Students at Work', '/uploads/images/gallery4.jpg', 'students'],
      ['School Programs', '/uploads/images/gallery5.jpg', 'programs'],
    ];
    for (const [title, image_url, category] of galleryItems) {
      await client.query(
        `INSERT INTO gallery (title, image_url, category) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [title, image_url, category]
      );
    }

    // Seed default admin user
    const hash = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING`,
      ['Administrator', 'admin@gsovu.rw', hash, 'admin']
    );

    // Seed sample news
    await client.query(`
      INSERT INTO news (title, slug, content, excerpt, category, published, featured)
      VALUES 
        ('Welcome to the New School Year', 'welcome-new-school-year', '<p>We are excited to welcome all students back for a new academic year full of opportunities and growth. Our teachers have prepared engaging lessons and activities to help every student reach their potential.</p><p>This year, we are introducing new extracurricular programs and upgrading our facilities to provide an even better learning environment. We look forward to a successful year of academic excellence and character development.</p>', 'We are excited to welcome all students back for a new academic year.', 'School News', true, true),
        ('National Examination Results', 'national-examination-results', '<p>We are proud to announce excellent results in the national examinations. Our students have performed exceptionally well, achieving above-average pass rates across all subjects.</p><p>The Head Teacher congratulated all students and teachers for their hard work and dedication. These results reflect our commitment to academic excellence and the supportive learning environment at G.S. SOVU.</p>', 'Our students achieved excellent results in national examinations.', 'Academics', true, false),
        ('Annual Sports Day', 'annual-sports-day', '<p>Join us for our Annual Sports Day celebration featuring competitions, performances, and community activities. Students from all levels will participate in various sports including football, basketball, athletics, and volleyball.</p><p>Parents and community members are warmly invited to attend and support our young athletes. The event will conclude with an awards ceremony recognizing outstanding performances.</p>', 'Join us for our Annual Sports Day celebration.', 'Events', true, false)
      ON CONFLICT (slug) DO NOTHING
    `);

    // Seed sample events
    await client.query(`
      INSERT INTO events (title, description, event_date, event_time, location, active)
      VALUES 
        ('Parent-Teacher Meeting', 'Annual parent-teacher meeting to discuss student progress, academic performance, and ways to support learning at home. All parents and guardians are encouraged to attend.', CURRENT_DATE + INTERVAL '14 days', '9:00 AM - 12:00 PM', 'School Hall', true),
        ('Sports Day', 'Annual sports competition for all students featuring football, basketball, volleyball, athletics, and other sporting events. Come and support our young athletes!', CURRENT_DATE + INTERVAL '30 days', '8:00 AM - 4:00 PM', 'School Grounds', true),
        ('Graduation Ceremony', 'Graduation ceremony for completing students. A celebration of academic achievement and the beginning of a new chapter in their educational journey.', CURRENT_DATE + INTERVAL '60 days', '10:00 AM', 'School Auditorium', true)
      ON CONFLICT DO NOTHING
    `);

    // Seed announcements
    await client.query(`
      INSERT INTO announcements (title, content, priority, active)
      VALUES 
        ('School Fees Deadline', 'Please ensure all school fees are paid by the end of this month. Contact the school office for any payment inquiries or to arrange a payment plan.', 'high', true),
        ('New Academic Calendar', 'The new academic calendar is now available for download. Please check the Downloads section or visit the school office for a printed copy.', 'normal', true),
        ('Science Laboratory Opening', 'We are pleased to announce the opening of our new science laboratory. Students will now have enhanced practical learning opportunities in Chemistry, Physics, and Biology.', 'normal', true)
      ON CONFLICT DO NOTHING
    `);

    // Seed achievements
    await client.query(`
      INSERT INTO achievements (title, description, year, active)
      VALUES 
        ('Best School in District', 'Awarded best performing school in the district for outstanding academic results and holistic development.', 2024, true),
        ('100% Pass Rate', 'Achieved 100% pass rate in national O''Level examinations, a testament to our dedicated teachers and hardworking students.', 2023, true),
        ('Regional Sports Champions', 'Won the regional inter-school sports championship in football and athletics.', 2024, true),
        ('Science Fair Excellence', 'Students won multiple awards at the National Science Fair for innovative projects.', 2023, true),
        ('Community Service Award', 'Recognized for outstanding community service and social responsibility programs.', 2024, true)
      ON CONFLICT DO NOTHING
    `);

    // Seed testimonials
    await client.query(`
      INSERT INTO testimonials (name, role, message, active)
      VALUES 
        ('Parent', 'Parent of S3 Student', 'G.S. SOVU has been a blessing for our family. Our child has grown academically and morally. The teachers truly care about every student.', true),
        ('Alumni', 'Class of 2022', 'My time at G.S. SOVU shaped who I am today. The Catholic values and excellent education prepared me well for university.', true),
        ('Parent', 'Parent of P4 Student', 'The school provides a safe and nurturing environment. I am confident that my child is receiving the best education guided by strong moral values.', true)
      ON CONFLICT DO NOTHING
    `);

    // Seed staff
    await client.query(`
      INSERT INTO staff (name, position, department, staff_type, sort_order, active)
      VALUES 
        ('Head Teacher', 'Head Teacher', 'Administration', 'admin', 1, true),
        ('Deputy Head Teacher', 'Deputy Head Teacher', 'Administration', 'admin', 2, true),
        ('Bursar', 'School Bursar', 'Administration', 'admin', 3, true),
        ('Senior Teacher', 'Senior Teacher', 'Academic', 'teacher', 4, true)
      ON CONFLICT DO NOTHING
    `);

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

module.exports = initDB;
