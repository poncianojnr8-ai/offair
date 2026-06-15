import { useState } from "react";

const Footer = () => {
  const year = new Date().getFullYear();
  const [hovered, setHovered] = useState(false);

  return (
    <footer className="w-full bg-[var(--bg-primary)] py-8 text-center border-t border-[var(--border-color)]">
      <p className="text-[0.75rem] sm:text-sm md:text-base text-[var(--text-muted)] px-4">
        © {year} OffAir with Ponciano. All Rights Reserved | Developed by{" "}
        <a
          href="https://cymrai.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="underline transition-colors"
          style={{ color: hovered ? "#ffffff" : "var(--text-muted)" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Cymrai Software Solutions
        </a>
      </p>
    </footer>
  );
};

export default Footer;
