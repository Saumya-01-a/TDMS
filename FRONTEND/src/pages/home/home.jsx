import "./home.css";
import Navbar from "../../components/layout/navbar";
import Footer from "../../components/layout/Footer";
import trainingImg from "../../assets/training-about.png";
import PricingPackages from "../../components/shared/PricingPackages";


export default function Home() {
  return (
    <div className="home">
      <Navbar />

      {/* HOME SECTION */}
      <section id="home" className="hero">
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>Drive With Confidence</h1>
          <p>
            Professional driving lessons tailored to your needs with certified instructors.
            <br />
            Take the first step towards freedom on the road.
          </p>
          <div className="actions">
            <a href="#about" className="primary" style={{ textDecoration: 'none' }}>Get Started</a>
            <a href="#services" className="secondary" style={{ textDecoration: 'none' }}>Our Services</a>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="section color-bg">
        <div className="container about-container">
          <div className="about-content">
            <h2 className="section-title">Drive With Confidence</h2>
            <p className="about-text">
              At Thisara Driving School, we believe that learning to drive is a milestone for life. 
              Our professional training program is designed to build not just your skill, but your confidence. 
              With over a decade of experience in Sri Lanka, our certified instructors use modern methods 
              to ensure you are road-ready and safety-conscious.
            </p>
            <button className="primary">Learn More About Us</button>
          </div>
          <div className="about-image">
            <img src={trainingImg} alt="Professional Driving Training" />
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="section">
        <div className="container">
          <h2 className="section-title centered">Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🚗</div>
              <h3>Light Vehicles</h3>
              <p>Manual and Auto training for cars, vans, and dual-purpose vehicles.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏍️</div>
              <h3>Motorbike</h3>
              <p>Comprehensive training for all classes of motorbikes with safety gear guidance.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📖</div>
              <h3>Theory Sessions</h3>
              <p>Expert guidance for your written exam with trial questions and highway code mastery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="section color-bg">
        <div className="container">
          <h2 className="section-title centered text-white mb-12">Our Pricing Packages</h2>
          <PricingPackages />
        </div>
      </section>


      {/* CONTACT US SECTION */}
      <section id="contact" className="section color-bg">
        <div className="container">
          <h2 className="section-title centered">Contact Us</h2>
          <div className="contact-info-grid">
            <div className="contact-card">
              <h4>📞 Hotline</h4>
              <p>+94 777 47 00 48</p>
            </div>
            <div className="contact-card">
              <h4>📍 Office / Branches</h4>
              <p>Head Office: +94 33 229 73 25</p>
              <p>Kalagedihena & Naiwala</p>
            </div>
            <div className="contact-card">
              <h4>✉️ Email Address</h4>
              <p>thisaradrivingschool1@gmail.com</p>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}

