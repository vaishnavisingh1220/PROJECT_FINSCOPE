import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import FeatureCard from "../components/FeatureCard";
import hero from "../assets/hero.png";
import "./LandingDark.css";
import BackgroundParticles from "../components/BackgroundParticles";
import FloatingShapes from "../components/FloatingShapes";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaRobot, FaChartLine } from "react-icons/fa";

export default function Landing() {
    const navigate = useNavigate(); 
  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section className="hero-dark">
        <BackgroundParticles /> {/* 👈 floating AI glow background */}
        <FloatingShapes /> {/* 👈 New glowing shapes */}
        <div className="hero-text">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span>FinScope AI</span> — your digital analyst.
          </motion.h1>

          <p className="hero-sub">
            Analyze. Visualize. Predict.<br />
            Turning raw reports into real-time insight — with precision.
          </p>

          <div className="hero-btns">
            <button className="btn-blue" onClick={() => navigate("/register")}>Get Started</button>
            <button className="btn-outline" onClick={() =>document.getElementById("features").scrollIntoView({ behavior: "smooth"})}>
                Explore Features
                </button>
          </div>
        </div>

        <motion.img
          src={hero}
          alt="AI dashboard"
          className="hero-image"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        />
      </section>

    <svg
  className="wave-divider"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1440 320"
>
  <path
    fill="#1e293b"
    fillOpacity="1"
    d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,165.3C672,149,768,139,864,133.3C960,128,1056,128,1152,122.7C1248,117,1344,107,1392,101.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
  ></path>
</svg>

      {/* FEATURES */}
      <section id="features" className="features-dark">
        <h2>How FinScope Works</h2>
        <div className="feature-grid-dark">
          <FeatureCard
            icon={<FaCloudUploadAlt />}
            title="Upload"
            desc="Securely upload PDFs and scanned statements."
          />
          <FeatureCard
            icon={<FaRobot />}
            title="Analyze"
            desc="AI extracts KPIs, metrics, and sentiments instantly."
          />
          <FeatureCard
            icon={<FaChartLine />}
            title="Visualize"
            desc="Interactive dashboards reveal trends & anomalies."
          />
        </div>
      </section>

    <svg
  className="wave-divider"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1440 320"
>
  <path
    fill="#0f172a"
    fillOpacity="1"
    d="M0,256L60,250.7C120,245,240,235,360,234.7C480,235,600,245,720,256C840,267,960,277,1080,250.7C1200,224,1320,160,1380,128L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
  ></path>
</svg>

      {/* CTA */}
      <section className="cta-dark">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Unlock data-driven clarity with <span>FinScope AI</span>.
        </motion.h2>
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/register")}
        > Try Now
        
        </motion.button>
      </section>

      <footer className="footer-dark">
        <p>© 2025 FinScope AI · Empowering Financial Intelligence</p>
      </footer>
    </div>
  );
}
