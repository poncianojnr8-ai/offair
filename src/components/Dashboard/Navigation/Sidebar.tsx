import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Star,
  Tag,
  LogOut,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/admin/login", { replace: true });
  };

  const menuItems = [
    { name: "Overview", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Posts", path: "/admin/posts", icon: <FileText size={20} /> },
    { name: "Hero Posts", path: "/admin/hero-posts", icon: <FileText size={20} /> },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <Tag size={20} />,
    },
    {
      name: "Trending",
      path: "/admin/trending",
      icon: <TrendingUp size={20} />,
    },
  ];

  return (
    <aside className="w-64 h-screen bg-[var(--bg-secondary)] border-r border-white/5 fixed left-0 top-0 flex flex-col">
      <div className="p-8">
        <h2 className="text-[var(--main)] font-[var(--style-font)] text-2xl tracking-tighter">
          OFF AIR
        </h2>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mt-1">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 uppercase text-xs tracking-widest font-bold ${
                isActive
                  ? "bg-[var(--main)] text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 px-4 py-3 w-full text-red-500 hover:bg-red-500/10 rounded-lg transition-all uppercase text-xs tracking-widest font-bold"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
