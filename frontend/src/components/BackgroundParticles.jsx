import { useEffect } from "react";
import "./BackgroundParticles.css";

export default function BackgroundParticles() {
  useEffect(() => {
    const container = document.getElementById("particles-container");
    const particles = [];

    for (let i = 0; i < 35; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "vw";
      particle.style.top = Math.random() * 100 + "vh";
      particle.style.animationDuration = 10 + Math.random() * 10 + "s";
      particle.style.animationDelay = Math.random() * 10 + "s";
      container.appendChild(particle);
      particles.push(particle);
    }

    return () => particles.forEach((p) => p.remove());
  }, []);

  return <div id="particles-container"></div>;
}
