import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './App.css'

// Translations
const translations = {
  ar: {
    // Navigation
    nav: {
      features: 'المميزات',
      howItWorks: 'كيف يعمل',
      services: 'الخدمات',
      contact: 'تواصل معنا',
      getStarted: 'ابدأ الآن',
      langSwitch: 'EN'
    },
    // Hero
    hero: {
      badge: 'صُنع للجزائر',
      title: 'صحتك،',
      titleHighlight: 'أسهل',
      description: 'تبرا تربطك بفحص الأعراض بالذكاء الاصطناعي، الأطباء، العيادات، وأدوات الصحة الرقمية — كل ذلك في منصة واحدة مصممة للجزائريين.',
      btnPrimary: 'افحص أعراضك الآن',
      btnSecondary: 'ابحث عن طبيب',
      stats: {
        doctors: 'طبيب',
        wilayas: 'ولاية',
        support: 'دعم متواصل'
      }
    },
    // Chat Demo
    chat: {
      assistant: 'مساعد تبرا',
      online: 'متصل الآن',
      userMsg1: 'عندي صداع وتعب شديد',
      botMsg1: 'أفهم ذلك. دعني أسألك بعض الأسئلة لمساعدتك بشكل أفضل. منذ متى وأنت تعاني من هذه الأعراض؟',
      userMsg2: 'من صباح أمس',
      botMsg2: 'بناءً على أعراضك، أنصحك بزيارة طبيب عام. وجدت 12 طبيب بالقرب منك متاحين اليوم.'
    },
    // Features
    features: {
      label: 'المميزات',
      title: 'كل ما تحتاجه',
      titleHighlight: 'لصحة أفضل',
      description: 'من التشخيص بالذكاء الاصطناعي إلى حجز المواعيد، تبرا تجلب حلول الرعاية الصحية الحديثة للجزائر.',
      items: [
        {
          number: '01',
          title: 'فحص الأعراض بالذكاء الاصطناعي',
          description: 'صف أعراضك بالعربية أو الفرنسية. الذكاء الاصطناعي يحللها ويقدم إرشادات أولية عن الحالات المحتملة.'
        },
        {
          number: '02',
          title: 'دليل الأطباء',
          description: 'اعثر على أطباء ومختصين مؤهلين في جميع الـ48 ولاية. فلتر حسب التخصص، الموقع، والتوفر.'
        },
        {
          number: '03',
          title: 'البحث عن العيادات',
          description: 'حدد موقع العيادات والمستشفيات القريبة مع عرض خريطة تفاعلية. شاهد التقييمات والخدمات ومعلومات الاتصال.'
        },
        {
          number: '04',
          title: 'البحث الذكي',
          description: 'بحث قوي يفهم ما تحتاجه. اعثر على الأطباء، العيادات، أو الخدمات الطبية فوراً.'
        },
        {
          number: '05',
          title: 'حجز المواعيد',
          description: 'احجز مواعيدك عبر الإنترنت مع التوفر في الوقت الفعلي. استلم التأكيدات والتذكيرات عبر الرسائل القصيرة.'
        },
        {
          number: '06',
          title: 'البطاقات الصحية الرقمية',
          description: 'احفظ تاريخك الطبي، الوصفات، والسجلات الصحية رقمياً. الوصول إليها في أي مكان وزمان.'
        }
      ]
    },
    // How It Works
    howItWorks: {
      label: 'كيف يعمل',
      title: 'احصل على الرعاية في',
      titleHighlight: 'أربع خطوات بسيطة',
      description: 'من أول عرض إلى زيارة الطبيب، تبرا ترشدك في كل خطوة من رحلتك الصحية.',
      steps: [
        { number: 1, title: 'صف الأعراض', description: 'أخبر تبرا كيف تشعر بكلماتك الخاصة' },
        { number: 2, title: 'تحليل الذكاء الاصطناعي', description: 'احصل على رؤى فورية عن حالتك' },
        { number: 3, title: 'اعثر على طبيب', description: 'تصفح المختصين الموصى بهم بالقرب منك' },
        { number: 4, title: 'احجز وزُر', description: 'حدد موعدك في ثوانٍ' }
      ]
    },
    // Services
    services: {
      label: 'الخدمات',
      title: 'اكتشف',
      titleHighlight: 'خدماتنا الأساسية',
      description: 'أدوات رعاية صحية شاملة مصممة خصيصاً لنظام الرعاية الصحية الجزائري.',
      directory: {
        title: 'دليل الأطباء والعيادات',
        description: 'اعثر على مقدم الرعاية الصحية المناسب في أي مكان بالجزائر مع دليلنا الشامل.',
        features: [
          'عرض خريطة تفاعلية لجميع المواقع',
          'فلتر حسب التخصص والتوفر',
          'تقييمات وآراء حقيقية من المرضى',
          'معلومات الاتصال المباشر'
        ]
      },
      booking: {
        title: 'حجز المواعيد',
        description: 'احجز مواعيد مع أي طبيب أو عيادة في شبكتنا فوراً عبر الإنترنت.',
        features: [
          'تقويم التوفر في الوقت الفعلي',
          'تأكيد وتذكيرات عبر SMS',
          'خيارات إعادة جدولة سهلة',
          'بدون مكالمات هاتفية'
        ]
      },
      healthCards: {
        title: 'البطاقات الصحية الرقمية',
        description: 'احفظ سجلاتك الطبية، الوصفات، وتاريخك الصحي في بطاقة رقمية آمنة واحدة.',
        features: [
          'تخزين مشفر وآمن',
          'شارك مع أي طبيب فوراً',
          'تتبع تاريخك الصحي',
          'ميزة الوصول في حالات الطوارئ'
        ],
        cardHolder: 'حامل البطاقة',
        validThru: 'صالحة حتى'
      },
      search: {
        title: 'البحث الذكي',
        description: 'اعثر على ما تحتاجه بالضبط مع بحثنا الذكي الذي يفهم اللغة الطبيعية.',
        features: [
          'البحث بالعربية، الفرنسية، أو الإنجليزية',
          'اقتراحات الإكمال التلقائي',
          'فلتر حسب المسافة، السعر، التقييم',
          'حفظ عمليات البحث المفضلة'
        ],
        recentSearches: 'عمليات البحث الأخيرة:'
      }
    },
    // CTA
    cta: {
      title: 'مستعد للتحكم في',
      titleHighlight: 'صحتك',
      description: 'انضم إلى آلاف الجزائريين الذين يثقون بتبرا لاحتياجاتهم الصحية. ابدأ بفحص أعراض مجاني اليوم.',
      btnPrimary: 'ابدأ استشارة مجانية',
      btnSecondary: 'تواصل معنا'
    },
    // Footer
    footer: {
      description: 'نجعل الحياة الصحية أسهل للجزائريين. حلول رعاية صحية مدعومة بالذكاء الاصطناعي في متناول يدك.',
      product: {
        title: 'المنتج',
        links: ['فحص الأعراض بالذكاء الاصطناعي', 'البحث عن أطباء', 'حجز المواعيد', 'البطاقات الصحية']
      },
      company: {
        title: 'الشركة',
        links: ['من نحن', 'الوظائف', 'الصحافة', 'الشركاء']
      },
      support: {
        title: 'الدعم',
        links: ['مركز المساعدة', 'تواصل معنا', 'للأطباء', 'للعيادات']
      },
      bottom: {
        copyright: '© 2024 تبرا. جميع الحقوق محفوظة. صُنع بعناية في الجزائر.',
        privacy: 'سياسة الخصوصية',
        terms: 'شروط الخدمة',
        cookies: 'سياسة ملفات تعريف الارتباط'
      }
    }
  },
  en: {
    // Navigation
    nav: {
      features: 'Features',
      howItWorks: 'How it Works',
      services: 'Services',
      contact: 'Contact',
      getStarted: 'Get Started',
      langSwitch: 'عربي'
    },
    // Hero
    hero: {
      badge: 'Made for Algeria',
      title: 'Your Health,',
      titleHighlight: 'Simplified',
      description: 'Tabra connects you with AI-powered symptom checking, doctors, clinics, and digital health tools — all in one platform designed for Algerians.',
      btnPrimary: 'Check Symptoms Now',
      btnSecondary: 'Find a Doctor',
      stats: {
        doctors: 'Doctors',
        wilayas: 'Wilayas',
        support: 'AI Support'
      }
    },
    // Chat Demo
    chat: {
      assistant: 'Tabra Assistant',
      online: 'Online now',
      userMsg1: 'I have a headache and feeling tired',
      botMsg1: 'I understand. Let me ask a few questions to help you better. How long have you had these symptoms?',
      userMsg2: 'Since yesterday morning',
      botMsg2: 'Based on your symptoms, I recommend consulting a general practitioner. I found 12 doctors near you available today.'
    },
    // Features
    features: {
      label: 'Features',
      title: 'Everything you need for',
      titleHighlight: 'better health',
      description: 'From AI-powered diagnosis to appointment booking, Tabra brings modern healthcare solutions to Algeria.',
      items: [
        {
          number: '01',
          title: 'AI Symptom Checker',
          description: 'Describe your symptoms in Arabic or French. Our AI analyzes them and provides initial guidance on potential conditions.'
        },
        {
          number: '02',
          title: 'Doctor Directory',
          description: 'Find qualified doctors and specialists across all 48 wilayas. Filter by specialty, location, and availability.'
        },
        {
          number: '03',
          title: 'Clinic Finder',
          description: 'Locate nearby clinics and hospitals with interactive map view. See ratings, services, and contact information.'
        },
        {
          number: '04',
          title: 'Smart Search',
          description: 'Powerful search that understands what you need. Find doctors, clinics, or medical services instantly.'
        },
        {
          number: '05',
          title: 'Book Appointments',
          description: 'Schedule appointments online with real-time availability. Receive confirmations and reminders via SMS.'
        },
        {
          number: '06',
          title: 'Digital Health Cards',
          description: 'Store your medical history, prescriptions, and health records digitally. Access them anywhere, anytime.'
        }
      ]
    },
    // How It Works
    howItWorks: {
      label: 'How It Works',
      title: 'Get care in',
      titleHighlight: 'four simple steps',
      description: 'From first symptom to doctor visit, Tabra guides you through every step of your healthcare journey.',
      steps: [
        { number: 1, title: 'Describe Symptoms', description: 'Tell Tabra how you feel in your own words' },
        { number: 2, title: 'Get AI Analysis', description: 'Receive instant insights about your condition' },
        { number: 3, title: 'Find a Doctor', description: 'Browse recommended specialists near you' },
        { number: 4, title: 'Book & Visit', description: 'Schedule your appointment in seconds' }
      ]
    },
    // Services
    services: {
      label: 'Services',
      title: 'Explore our',
      titleHighlight: 'core services',
      description: 'Comprehensive healthcare tools designed specifically for the Algerian healthcare system.',
      directory: {
        title: 'Doctor & Clinic Directory',
        description: 'Find the right healthcare provider anywhere in Algeria with our comprehensive directory.',
        features: [
          'Interactive map view of all locations',
          'Filter by specialty and availability',
          'Real patient reviews and ratings',
          'Direct contact information'
        ]
      },
      booking: {
        title: 'Appointment Booking',
        description: 'Schedule appointments with any doctor or clinic in our network instantly online.',
        features: [
          'Real-time availability calendar',
          'SMS confirmation and reminders',
          'Easy rescheduling options',
          'No phone calls needed'
        ]
      },
      healthCards: {
        title: 'Digital Health Cards',
        description: 'Keep your medical records, prescriptions, and health history in one secure digital card.',
        features: [
          'Secure encrypted storage',
          'Share with any doctor instantly',
          'Track your health history',
          'Emergency access feature'
        ],
        cardHolder: 'Card Holder',
        validThru: 'Valid Thru'
      },
      search: {
        title: 'Smart Search',
        description: 'Find exactly what you need with our intelligent search that understands natural language.',
        features: [
          'Search in Arabic, French, or English',
          'Auto-complete suggestions',
          'Filter by distance, price, rating',
          'Save favorite searches'
        ],
        recentSearches: 'Recent searches:'
      }
    },
    // CTA
    cta: {
      title: 'Ready to take control of your',
      titleHighlight: 'health',
      description: 'Join thousands of Algerians who trust Tabra for their healthcare needs. Start with a free symptom check today.',
      btnPrimary: 'Start Free Consultation',
      btnSecondary: 'Contact Us'
    },
    // Footer
    footer: {
      description: 'Making health life easier for Algerians. AI-powered healthcare solutions at your fingertips.',
      product: {
        title: 'Product',
        links: ['AI Symptom Checker', 'Find Doctors', 'Book Appointments', 'Health Cards']
      },
      company: {
        title: 'Company',
        links: ['About Us', 'Careers', 'Press', 'Partners']
      },
      support: {
        title: 'Support',
        links: ['Help Center', 'Contact Us', 'For Doctors', 'For Clinics']
      },
      bottom: {
        copyright: '© 2024 Tabra. All rights reserved. Made with care in Algeria.',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        cookies: 'Cookie Policy'
      }
    }
  }
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

function App() {
  const [lang, setLang] = useState('ar') // Default to Arabic
  const [scrolled, setScrolled] = useState(false)
  const [chatStep, setChatStep] = useState(0)

  const t = translations[lang]
  const isRTL = lang === 'ar'

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang, isRTL])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animate chat demo
  useEffect(() => {
    const timer = setInterval(() => {
      setChatStep(prev => (prev < 3 ? prev + 1 : 0))
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar')
  }

  return (
    <div className={`app ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <a href="#" className="logo">
            <div className="logo-circle">
              <img src="/logo.png" alt="Tabra" />
            </div>
            <span className="logo-text">Tabra</span>
          </a>
          <nav className="nav">
            <ul className="nav-links">
              <li><a href="#features" className="nav-link">{t.nav.features}</a></li>
              <li><a href="#how-it-works" className="nav-link">{t.nav.howItWorks}</a></li>
              <li><a href="#services" className="nav-link">{t.nav.services}</a></li>
              <li><a href="#contact" className="nav-link">{t.nav.contact}</a></li>
            </ul>
            <button onClick={toggleLang} className="btn btn-lang">
              {t.nav.langSwitch}
            </button>
            <a href="#" className="btn btn-primary">{t.nav.getStarted}</a>
          </nav>
          <div className="mobile-actions">
            <button onClick={toggleLang} className="btn btn-lang btn-lang-mobile">
              {t.nav.langSwitch}
            </button>
            <button className="mobile-menu-btn" aria-label="Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <motion.div
            className="hero-text"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span className="hero-badge" variants={fadeInUp}>
              {t.hero.badge}
            </motion.span>
            <motion.h1 className="hero-title" variants={fadeInUp}>
              {t.hero.title} <em>{t.hero.titleHighlight}</em>
            </motion.h1>
            <motion.p className="hero-description" variants={fadeInUp}>
              {t.hero.description}
            </motion.p>
            <motion.div className="hero-buttons" variants={fadeInUp}>
              <a href="#" className="btn btn-primary btn-large">{t.hero.btnPrimary}</a>
              <a href="#" className="btn btn-outline btn-large">{t.hero.btnSecondary}</a>
            </motion.div>
            <motion.div className="hero-stats" variants={fadeInUp}>
              <div className="stat-item">
                <h4>+5000</h4>
                <p>{t.hero.stats.doctors}</p>
              </div>
              <div className="stat-item">
                <h4>48</h4>
                <p>{t.hero.stats.wilayas}</p>
              </div>
              <div className="stat-item">
                <h4>24/7</h4>
                <p>{t.hero.stats.support}</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="hero-card">
              <div className="chat-header">
                <div className="chat-avatar">
                  <img src="/logo.png" alt="Tabra" />
                </div>
                <div className="chat-info">
                  <h4>{t.chat.assistant}</h4>
                  <p>{t.chat.online}</p>
                </div>
              </div>
              <div className="chat-messages">
                <motion.div
                  className="message message-user"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: chatStep >= 0 ? 1 : 0, y: 0 }}
                >
                  {t.chat.userMsg1}
                </motion.div>
                {chatStep >= 1 && (
                  <motion.div
                    className="message message-bot"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {t.chat.botMsg1}
                  </motion.div>
                )}
                {chatStep >= 2 && (
                  <motion.div
                    className="message message-user"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {t.chat.userMsg2}
                  </motion.div>
                )}
                {chatStep >= 3 && (
                  <motion.div
                    className="message message-bot"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {t.chat.botMsg2}
                  </motion.div>
                )}
                {chatStep < 1 && (
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="section-label">{t.features.label}</span>
            <h2 className="section-title">{t.features.title} <em>{t.features.titleHighlight}</em></h2>
            <p className="section-description">{t.features.description}</p>
          </motion.div>

          <motion.div
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {t.features.items.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                variants={fadeInUp}
              >
                <div className="feature-number">{feature.number}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="section-label">{t.howItWorks.label}</span>
            <h2 className="section-title">{t.howItWorks.title} <em>{t.howItWorks.titleHighlight}</em></h2>
            <p className="section-description">{t.howItWorks.description}</p>
          </motion.div>

          <motion.div
            className="steps-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {t.howItWorks.steps.map((step, index) => (
              <motion.div key={index} className="step-card" variants={fadeInUp}>
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="services" id="services">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="section-label">{t.services.label}</span>
            <h2 className="section-title">{t.services.title} <em>{t.services.titleHighlight}</em></h2>
            <p className="section-description">{t.services.description}</p>
          </motion.div>

          <div className="services-grid">
            {/* Doctor & Clinic Directory */}
            <motion.div
              className="service-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="service-content">
                <h3>{t.services.directory.title}</h3>
                <p>{t.services.directory.description}</p>
                <ul className="service-features">
                  {t.services.directory.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="service-visual">
                <div className="map-preview">
                  <div className="map-pin pin-1"></div>
                  <div className="map-pin pin-2"></div>
                  <div className="map-pin pin-3"></div>
                </div>
              </div>
            </motion.div>

            {/* Appointment Booking */}
            <motion.div
              className="service-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="service-content">
                <h3>{t.services.booking.title}</h3>
                <p>{t.services.booking.description}</p>
                <ul className="service-features">
                  {t.services.booking.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="service-visual">
                <div className="calendar-preview">
                  {[...Array(28)].map((_, i) => (
                    <div
                      key={i}
                      className={`calendar-day ${i === 14 ? 'active' : ''} ${[5, 8, 12, 18, 22, 25].includes(i) ? 'available' : ''}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Digital Health Cards */}
            <motion.div
              className="service-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="service-content">
                <h3>{t.services.healthCards.title}</h3>
                <p>{t.services.healthCards.description}</p>
                <ul className="service-features">
                  {t.services.healthCards.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="service-visual">
                <div className="health-card-preview">
                  <div className="card-header">
                    <span className="card-brand">{isRTL ? 'تبرا الصحية' : 'Tabra Health'}</span>
                    <div className="card-chip"></div>
                  </div>
                  <div className="card-number">•••• •••• •••• 4521</div>
                  <div className="card-info">
                    <div className="card-info-item">
                      <label>{t.services.healthCards.cardHolder}</label>
                      <span>{isRTL ? 'أحمد بن علي' : 'Ahmed Benali'}</span>
                    </div>
                    <div className="card-info-item">
                      <label>{t.services.healthCards.validThru}</label>
                      <span>12/28</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Smart Search */}
            <motion.div
              className="service-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="service-content">
                <h3>{t.services.search.title}</h3>
                <p>{t.services.search.description}</p>
                <ul className="service-features">
                  {t.services.search.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="service-visual">
                <div className="search-preview">
                  <div className="search-input">
                    طبيب أسنان في الجزائر العاصمة
                  </div>
                  <div className="search-label">
                    {t.services.search.recentSearches}
                  </div>
                  <div className="search-item">
                    Cardiologue Oran
                  </div>
                  <div className="search-item">
                    Pédiatre disponible ce weekend
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="container">
          <motion.div
            className="cta-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="cta-title" variants={fadeInUp}>
              {t.cta.title} <em>{t.cta.titleHighlight}</em>؟
            </motion.h2>
            <motion.p className="cta-description" variants={fadeInUp}>
              {t.cta.description}
            </motion.p>
            <motion.div className="cta-buttons" variants={fadeInUp}>
              <a href="#" className="btn btn-white btn-large">{t.cta.btnPrimary}</a>
              <a href="#" className="btn btn-outline-white btn-large">{t.cta.btnSecondary}</a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="logo">
                <div className="logo-circle">
                  <img src="/logo.png" alt="Tabra" />
                </div>
                <span className="logo-text">Tabra</span>
              </a>
              <p>{t.footer.description}</p>
            </div>
            <div className="footer-column">
              <h4>{t.footer.product.title}</h4>
              <ul className="footer-links">
                {t.footer.product.links.map((link, i) => (
                  <li key={i}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t.footer.company.title}</h4>
              <ul className="footer-links">
                {t.footer.company.links.map((link, i) => (
                  <li key={i}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t.footer.support.title}</h4>
              <ul className="footer-links">
                {t.footer.support.links.map((link, i) => (
                  <li key={i}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t.footer.bottom.copyright}</p>
            <div className="footer-legal">
              <a href="#">{t.footer.bottom.privacy}</a>
              <a href="#">{t.footer.bottom.terms}</a>
              <a href="#">{t.footer.bottom.cookies}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
