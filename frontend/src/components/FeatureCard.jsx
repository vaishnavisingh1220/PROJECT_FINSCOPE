import { motion } from "framer-motion";
import "./FeatureCard.css";

export default function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      className="feature-card"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  );
}
