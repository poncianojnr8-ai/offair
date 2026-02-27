import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../../assets/images/logo.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const forceDark = location.pathname.startsWith("/posts/");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 py-2 ${
          forceDark || isScrolled || open
            ? "bg-[var(--bg-primary)] border-b border-[var(--border-color)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent border-b border-transparent"
        }`}
        style={{
          paddingLeft: "var(--section-px)",
          paddingRight: "var(--section-px)",
        }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="hidden lg:flex gap-8">
            <Link className="text-sm uppercase tracking-widest" to="/">
              Home
            </Link>
          </div>
          <div>
            <Link className="text-sm uppercase tracking-widest" to="/about">
              About
            </Link>
          </div>
          <Link to="/" className="flex-shrink-0">
            <img
              src={logo}
              alt="Logo"
              className={`transition-all duration-500 object-contain ${
                isScrolled ? "h-16" : "h-24"
              }`}
            />
          </Link>
          <div className="hidden lg:flex gap-8">
            <Link className="text-sm uppercase tracking-widest" to="/team">
              Meet The Team
            </Link>
          </div>
          <div>
            <Link className="text-sm uppercase tracking-widest" to="/contact">
              Contact
            </Link>
          </div>

          {/* Mobile menu */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-white"
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 transition-transform duration-500 ease-in-out
        ${open ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.04),
                rgba(255,255,255,0.04) 1px,
                transparent 1px,
                transparent 80px
              )
            `,
            backgroundColor: "var(--bg-primary)",
          }}
        />

        <button
          onClick={() => setOpen(false)}
          className="absolute top-6 right-6 z-50 text-white"
          aria-label="Close menu"
        >
          <X size={34} />
        </button>

        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-10 text-2xl uppercase tracking-widest">
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link to="/team" onClick={() => setOpen(false)}>
            Meet The Team
          </Link>
          <Link to="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
