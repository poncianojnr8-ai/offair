import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoMain from "../../../assets/images/logo-main.png";

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
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          forceDark || isScrolled || open
            ? "bg-(--bg-primary) border-b border-transparent shadow-[0_4px_30px_rgba(0,0,0,0.35)]"
            : "bg-transparent border-b border-transparent"
        }`}
        style={{
          paddingTop: "5px",
          paddingBottom: "5px",
          paddingLeft: "var(--section-px)",
          paddingRight: "var(--section-px)",
          height: "auto",
        }}
      >
        <div className="relative flex items-center justify-between w-full">
          <div className="hidden lg:flex items-center justify-between w-full">
            <div className="px-4">
              <Link className="text-sm uppercase tracking-widest font-bold no-underline" to="/">
                Home
              </Link>
            </div>
            <div className="px-4">
              <Link className="text-sm uppercase tracking-widest font-bold no-underline" to="/interviews">
                Interviews
              </Link>
            </div>
            <div className="px-4 shrink-0">
              <Link to="/">
                <img
                  src={logoMain}
                  alt="Logo"
                  className={`transition-all duration-500 object-contain ${
                    isScrolled ? "h-16" : "h-24"
                  }`}
                />
              </Link>
            </div>
            <div className="px-4">
              <Link className="text-sm uppercase tracking-widest font-bold no-underline" to="/videos">
                Videos
              </Link>
            </div>
            <div className="px-4">
              <Link className="text-sm uppercase tracking-widest font-bold no-underline" to="/contact">
                Contact
              </Link>
            </div>
          </div>

          {/* Mobile navbar */}
          <div className="lg:hidden flex items-center justify-between w-full">
            {/* Logo on left */}
            <Link to="/" className="shrink-0">
              <img
                src={logoMain}
                alt="Logo"
                className={`transition-all duration-500 object-contain ${
                  isScrolled ? "h-12" : "h-16"
                }`}
              />
            </Link>

            {/* Menu button / Close button */}
            <button
              onClick={() => setOpen(!open)}
              className="text-white p-1 z-50"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 flex flex-col transition-transform duration-500 ease-in-out
        ${open ? "translate-y-0" : "-translate-y-full"}`}
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        {/* Top bar mirrors the navbar */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: "5px var(--section-px)",
            height: "auto",
          }}
        >
          <Link to="/" onClick={() => setOpen(false)}>
            <img
              src={logoMain}
              alt="Logo"
              className="h-16 object-contain"
            />
          </Link>

          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex items-center justify-center rounded-full border border-white/30 text-white"
            style={{ width: 44, height: 44 }}
          >
            <span className="text-2xl leading-none select-none" style={{ marginTop: -2 }}>−</span>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col justify-center" style={{ paddingLeft: "var(--section-px)", paddingRight: "var(--section-px)" }}>
          {[
            { label: "Home", to: "/" },
            { label: "Interviews", to: "/interviews" },
            { label: "Videos", to: "/videos" },
            { label: "Contact", to: "/contact" },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="no-underline leading-tight"
              style={{
                fontSize: "clamp(2.5rem, 12vw, 4rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.15em",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom contact info */}
        <div
          className="shrink-0 pb-6"
          style={{ paddingLeft: "var(--section-px)", paddingRight: "var(--section-px)" }}
        >
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
            Get in touch
          </p>
          <a
            href="mailto:hello@offair.com"
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: "var(--text-primary)", textDecoration: "underline", textUnderlineOffset: "4px" }}
          >
            Email Us
          </a>

          <hr className="mt-6 mb-4" style={{ borderColor: "var(--border-color)" }} />

          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              ©{new Date().getFullYear()} OffAir
            </span>
            <span className="text-[0.65rem] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              By Cymrai
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
