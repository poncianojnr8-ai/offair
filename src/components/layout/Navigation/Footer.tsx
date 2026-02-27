const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--bg-primary)] py-8 text-center border-t border-[var(--border-color)]">
      <p className="text-[0.75rem] sm:text-sm md:text-base text-[var(--text-muted)] px-4">
        © {year} OffAir with Ponciano. All Rights Reserved | Developed by Cymrai
        Software Solutions
      </p>
    </footer>
  );
};

export default Footer;
