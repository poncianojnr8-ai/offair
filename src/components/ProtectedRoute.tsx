import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <p className="text-white/20 animate-pulse uppercase tracking-widest text-xs">
          Authenticating...
        </p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
