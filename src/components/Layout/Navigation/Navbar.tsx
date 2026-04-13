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
              <Link className="text-sm uppercase tracking-widest font-bold no-underline" to="/about">
                About
              </Link>
            </div>
            <div className="px-4 shrink-0">
              <Link to="/">
                <img
                  src={logo}
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
            {/* Menu button / Close button */}
            <button
              onClick={() => setOpen(!open)}
              className="text-white p-1 z-50"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Logo on right */}
            <Link to="/" className="shrink-0">
              <img
                src={logo}
                alt="Logo"
                className={`transition-all duration-500 object-contain ${
                  isScrolled ? "h-12" : "h-16"
                }`}
              />
            </Link>
          </div>
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

        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-6 sm:gap-10 text-xl sm:text-2xl uppercase tracking-widest">
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link to="/videos" onClick={() => setOpen(false)}>
            Videos
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
