import React from "react";
import "./home.css";
import Navbar from "../../components/layout/navbar";
import Footer from "../../components/layout/Footer";
import trainingImg from "../../assets/training-about.png";
import PricingPackages from "../../components/shared/PricingPackages";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Clock, 
  Star, 
  Phone, 
  MapPin, 
  Mail, 
  Car, 
  BookOpen, 
  Users, 
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function Home() {
  const stats = [
    { value: "15,000+", label: "Licensed Graduates", icon: Users },
    { value: "99.4%", label: "First-Time Pass Rate", icon: Award },
    { value: "12+ Years", label: "Industry Excellence", icon: Clock },
    { value: "100%", label: "Dual-Control Fleet", icon: ShieldCheck },
  ];

  const fleetServices = [
    {
      title: "Light Motor Vehicles",
      category: "Car (Auto & Manual)",
      image: "/assets/fleet/vios.png",
      tag: "Most Popular",
      description: "Dual-pedal training in modern sedans. Complete mastery of hill starts, tight parallel parking, and busy Colombo traffic.",
      specs: ["Toyota Vios & Aqua", "Dual-Pedal Safety", "Night Driving Included"]
    },
    {
      title: "Motorbike & Scooter",
      category: "Class A & B Geared / Auto",
      image: "/assets/fleet/apache.png",
      tag: "High Demand",
      description: "Comprehensive motorcycle agility, slalom handling, tight figure-8 turns, and defensive balance under certified riders.",
      specs: ["TVS Apache RTR & Scooters", "Private Practice Track", "Safety Gear Provided"]
    },
    {
      title: "Dual Purpose & Van",
      category: "Light Commercial Transport",
      image: "/assets/fleet/hiace.png",
      tag: "Commercial",
      description: "Specialized passenger van maneuvering, extended wheelbase turning, loading considerations, and commercial driver certification.",
      specs: ["Toyota HiAce Fleet", "Blind-Spot Management", "Commercial Highway Prep"]
    },
    {
      title: "Three Wheeler",
      category: "Auto-Rickshaw Training",
      image: "/assets/fleet/bajaj.png",
      tag: "Essential",
      description: "Safe handling of three-wheel vehicles, sharp cornering control, incline braking, and urban road etiquette for day-to-day driving.",
      specs: ["Bajaj 4-Stroke Fleet", "Urban Maneuvering", "Express Test Prep"]
    }
  ];

  const whyChooseUs = [
    {
      title: "Government Certified Instructors",
      description: "Our instructors are formally registered with the Department of Motor Traffic with extensive patience and professional coaching techniques.",
      icon: Award
    },
    {
      title: "100% Dual-Pedal Safety Fleet",
      description: "Every training car is outfitted with verified passenger-side dual brake and clutch controls for absolute emergency override peace of mind.",
      icon: ShieldCheck
    },
    {
      title: "Flexible Scheduling (7 Days)",
      description: "Train around your work or school schedule with early morning, evening, and weekend time slots tailored to your convenience.",
      icon: Clock
    },
    {
      title: "Complete RMV Exam Guidance",
      description: "From medical test scheduling and learner permit paperwork to mock trial driving tests on official trial grounds.",
      icon: CheckCircle2
    }
  ];

  return (
    <div className="home-wrapper">
      <Navbar />

      {/* HERO SECTION */}
      <section id="home" className="hero-section">
        <div className="hero-overlay"></div>
        
        <div className="container hero-container">
          <div className="hero-content">
            {/* Top Pill Tag */}
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              <span className="badge-text">Sri Lanka's Premier Driving Academy</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-title">
              Drive With Absolute <br />
              <span className="hero-title-gradient">Confidence & Skill</span>
            </h1>

            {/* Hero Subtitle */}
            <p className="hero-description">
              Professional, patient, and modern driving tuition with government-certified instructors. 
              Step behind the wheel of dual-controlled modern vehicles and earn your freedom on the road.
            </p>

            {/* Hero Actions */}
            <div className="hero-actions">
              <a href="#pricing" className="btn-primary">
                <span>View Tuition Packages</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#services" className="btn-secondary">
                <span>Explore Fleet & Courses</span>
              </a>
            </div>

            {/* Trust Signals */}
            <div className="hero-trust-bar">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-200">
                  4.9/5 Rating (1,200+ Reviews)
                </span>
              </div>
              <span className="trust-divider"></span>
              <span className="text-sm text-slate-300">
                Registered Driving Institute No. DS-1048
              </span>
            </div>
          </div>
        </div>

        {/* Floating Stats Bar */}
        <div className="hero-stats-wrapper">
          <div className="container">
            <div className="hero-stats-grid">
              {stats.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="stat-card">
                    <div className="stat-icon-wrapper">
                      <Icon className="w-6 h-6 text-[#E11B22]" />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{item.value}</span>
                      <span className="stat-label">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="section bg-dark-secondary">
        <div className="container">
          <div className="about-grid">
            
            {/* Left Content */}
            <div className="about-text-column">
              <div className="section-pill">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Why Choose Thisara</span>
              </div>
              
              <h2 className="section-heading">
                Building Confident, Safety-Conscious <br />
                <span className="text-gradient-red">Drivers for Life</span>
              </h2>

              <p className="section-lead">
                At Thisara Driving School, learning to drive isn't just about passing a test — it's about 
                instilling defensive instincts, road etiquette, and calm decision-making behind the wheel.
              </p>

              <div className="why-grid">
                {whyChooseUs.map((feat, index) => {
                  const Icon = feat.icon;
                  return (
                    <div key={index} className="why-item">
                      <div className="why-icon-box">
                        <Icon className="w-5 h-5 text-[#E11B22]" />
                      </div>
                      <div className="why-content">
                        <h4>{feat.title}</h4>
                        <p>{feat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="about-cta-row">
                <a href="#contact" className="btn-primary">
                  <span>Speak With An Instructor</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>100% Insured Practice Sessions</span>
                </div>
              </div>
            </div>

            {/* Right Media Display */}
            <div className="about-media-column">
              <div className="about-image-card">
                <img 
                  src={trainingImg} 
                  alt="Thisara Professional Driving Training" 
                  className="about-main-image"
                />
                
                {/* Floating Badge Top */}
                <div className="floating-badge badge-top">
                  <div className="badge-icon-red">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="badge-number">99.4%</p>
                    <p className="badge-caption">First-Try Exam Pass Rate</p>
                  </div>
                </div>

                {/* Floating Badge Bottom */}
                <div className="floating-badge badge-bottom">
                  <div className="badge-icon-dark">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="badge-number">Certified RMV Center</p>
                    <p className="badge-caption">Kalagedihena & Naiwala</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SERVICES & FLEET SECTION */}
      <section id="services" className="section bg-dark-primary">
        <div className="container">
          
          {/* Header */}
          <div className="home-section-header">
            <div className="section-pill mx-auto">
              <Car className="w-3.5 h-3.5" />
              <span>Training Programs & Modern Fleet</span>
            </div>
            <h2 className="section-heading centered">
              World-Class Training For Every Vehicle Category
            </h2>
            <p className="section-subheading">
              Select your license category and train in comfortable, air-conditioned dual-pedal vehicles 
              with dedicated one-on-one attention from experienced instructors.
            </p>
          </div>

          {/* Fleet Grid */}
          <div className="fleet-grid">
            {fleetServices.map((service, index) => (
              <div key={index} className="fleet-card group">
                <div className="fleet-card-header">
                  <span className="fleet-tag">{service.tag}</span>
                  <span className="fleet-category">{service.category}</span>
                </div>

                <div className="fleet-image-wrap">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="fleet-image" 
                    loading="lazy"
                  />
                </div>

                <div className="fleet-card-body">
                  <h3 className="fleet-title">{service.title}</h3>
                  <p className="fleet-desc">{service.description}</p>
                  
                  <div className="fleet-specs">
                    {service.specs.map((spec, sIdx) => (
                      <span key={sIdx} className="spec-chip">
                        <CheckCircle2 className="w-3 h-3 text-[#E11B22]" />
                        {spec}
                      </span>
                    ))}
                  </div>

                  <a href="#pricing" className="fleet-link">
                    <span>View Pricing & Details</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Theory Feature Banner */}
          <div className="theory-banner">
            <div className="theory-content">
              <div className="theory-badge">
                <BookOpen className="w-4 h-4 text-[#E11B22]" />
                <span>RMV Written Test Preparation</span>
              </div>
              <h3>Master Highway Code & Theory Exam In First Attempt</h3>
              <p>
                Get access to our complete question bank, road sign diagrams, and computer-based mock trial tests 
                so you walk into the Department of Motor Traffic with absolute confidence.
              </p>
            </div>
            <div className="theory-action">
              <a href="/register" className="btn-primary whitespace-nowrap">
                <span>Start Learning Today</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="section bg-dark-secondary">
        <div className="container">
          <div className="home-section-header">
            <div className="section-pill mx-auto">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transparent Tuition</span>
            </div>
            <h2 className="section-heading centered">
              Affordable Tuition Packages Designed For Success
            </h2>
            <p className="section-subheading">
              Transparent pricing with no hidden charges. Flexible installment plans available for all student courses.
            </p>
          </div>

          <div className="pricing-container-wrap">
            <PricingPackages />
          </div>
        </div>
      </section>

      {/* CONTACT US SECTION */}
      <section id="contact" className="section bg-dark-primary">
        <div className="container">
          
          <div className="home-section-header">
            <div className="section-pill mx-auto">
              <Phone className="w-3.5 h-3.5" />
              <span>Get In Touch</span>
            </div>
            <h2 className="section-heading centered">
              Visit Our Branches Or Call An Instructor Today
            </h2>
            <p className="section-subheading">
              Have questions about learner permits, medical tests, or training schedules? Our team is available 7 days a week.
            </p>
          </div>

          <div className="contact-hub-grid">
            
            {/* Card 1: Telephone */}
            <div className="contact-hub-card">
              <div className="contact-icon-bubble">
                <Phone className="w-6 h-6 text-[#E11B22]" />
              </div>
              <h3>Hotlines & Direct Calls</h3>
              <p className="contact-card-sub">Direct support from 8:00 AM to 6:30 PM</p>
              
              <div className="contact-links-group">
                <a href="tel:+94777470048" className="contact-action-link">
                  <span className="font-bold text-white text-lg">+94 777 47 00 48</span>
                  <span className="contact-tag">Hotline / WhatsApp</span>
                </a>
                <a href="tel:+94332297325" className="contact-action-link">
                  <span className="font-bold text-white text-lg">+94 33 229 73 25</span>
                  <span className="contact-tag">Head Office</span>
                </a>
              </div>
            </div>

            {/* Card 2: Branches */}
            <div className="contact-hub-card active-hub">
              <div className="contact-icon-bubble">
                <MapPin className="w-6 h-6 text-[#E11B22]" />
              </div>
              <h3>Our Training Centers</h3>
              <p className="contact-card-sub">Private trial practice tracks & classrooms</p>
              
              <div className="branch-list">
                <div className="branch-item">
                  <span className="branch-title">Kalagedihena Branch</span>
                  <span className="branch-desc">Colombo - Kandy Main Road, Kalagedihena</span>
                </div>
                <div className="branch-item">
                  <span className="branch-title">Naiwala Branch</span>
                  <span className="branch-desc">Veyangoda Road, Naiwala Junction</span>
                </div>
              </div>
            </div>

            {/* Card 3: Email & Online */}
            <div className="contact-hub-card">
              <div className="contact-icon-bubble">
                <Mail className="w-6 h-6 text-[#E11B22]" />
              </div>
              <h3>Online Registration</h3>
              <p className="contact-card-sub">Inquire or submit documents anytime</p>
              
              <div className="contact-links-group">
                <a href="mailto:thisaradrivingschool1@gmail.com" className="contact-action-link">
                  <span className="font-bold text-white text-sm break-all">thisaradrivingschool1@gmail.com</span>
                  <span className="contact-tag">Email Support</span>
                </a>
                <a href="/register" className="btn-secondary w-full text-center mt-3">
                  <span>Create Student Account</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
