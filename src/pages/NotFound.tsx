import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <>
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-white">
        <h1 className="text-9xl font-black text-[var(--main)]">404</h1>
        <p className="text-xl uppercase tracking-widest mt-4">
          Static in the Signal
        </p>
        <Link
          to="/"
          className="mt-8 px-6 py-2 border border-[var(--main)] hover:bg-[var(--main)] transition-all"
        >
          Return Home
        </Link>
      </div>
    </>
  );
};

export default NotFound;
