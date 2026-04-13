import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Navigate } from "react-router-dom";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in — send straight to dashboard
  if (!loading && user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin", { replace: true });
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo / wordmark */}
        <div className="space-y-1">
          <h1 className="text-4xl font-[var(--style-font)] text-white tracking-tighter">
            OFF AIR
          </h1>
          <p className="text-xs uppercase tracking-widest text-white/30">
            Admin Dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@offair.com"
              className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-white outline-none focus:border-[var(--main)] transition-all placeholder:text-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-white outline-none focus:border-[var(--main)] transition-all placeholder:text-white/20"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 tracking-wide">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--main)] py-4 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
