import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  FileText,
  Tv,
  Mic,
  Tag,
  Mail,
  Plus,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

interface RecentPost {
  id: string;
  title: string;
  category?: string;
  image?: string;
  date?: string;
}

type Stat = {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  to: string;
};

const Overview = () => {
  const [counts, setCounts] = useState<Record<string, number | null>>({
    posts: null,
    videos: null,
    interviews: null,
    categories: null,
    newsletter: null,
  });
  const [recent, setRecent] = useState<RecentPost[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    const countOf = async (name: string) => {
      try {
        const snap = await getCountFromServer(collection(db, name));
        return snap.data().count;
      } catch (err) {
        console.error(`Error counting ${name}:`, err);
        return 0;
      }
    };

    const loadCounts = async () => {
      const [posts, videos, interviews, categories, newsletter] =
        await Promise.all([
          countOf("posts"),
          countOf("videos"),
          countOf("interviews"),
          countOf("categories"),
          countOf("newsletter"),
        ]);
      setCounts({ posts, videos, interviews, categories, newsletter });
    };

    const loadRecent = async () => {
      try {
        const q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        setRecent(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as RecentPost[]
        );
      } catch (err) {
        console.error("Error loading recent posts:", err);
      } finally {
        setLoadingRecent(false);
      }
    };

    loadCounts();
    loadRecent();
  }, []);

  const stats: Stat[] = [
    {
      label: "Articles",
      value: counts.posts,
      icon: <FileText size={20} />,
      to: "/admin/posts",
    },
    {
      label: "Videos",
      value: counts.videos,
      icon: <Tv size={20} />,
      to: "/admin/videos",
    },
    {
      label: "Interviews",
      value: counts.interviews,
      icon: <Mic size={20} />,
      to: "/admin/interviews",
    },
    {
      label: "Categories",
      value: counts.categories,
      icon: <Tag size={20} />,
      to: "/admin/categories",
    },
    {
      label: "Newsletter signups",
      value: counts.newsletter,
      icon: <Mail size={20} />,
      to: "/admin/posts",
    },
  ];

  const quickActions = [
    { label: "New Article", to: "/admin/posts/create", icon: <FileText size={16} /> },
    { label: "Add Video", to: "/admin/videos/create", icon: <Tv size={16} /> },
    { label: "New Interview", to: "/admin/interviews/create", icon: <Mic size={16} /> },
    { label: "Add Category", to: "/admin/categories", icon: <Tag size={16} /> },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
          OVERVIEW
        </h1>
        <p className="text-white/40 text-sm mt-2">
          Everything happening across Off Air at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group bg-[var(--bg-secondary)] border border-white/5 p-5 no-underline hover:border-[var(--main)] transition-all"
          >
            <div className="flex items-center justify-between text-white/40 group-hover:text-[var(--main)] transition-colors">
              {s.icon}
              <ArrowUpRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <p className="text-white text-3xl font-black mt-4">
              {s.value === null ? (
                <Loader2 size={20} className="animate-spin text-white/30" />
              ) : (
                s.value
              )}
            </p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1 font-bold">
              {s.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-white/10 px-5 py-3 text-white/70 hover:text-white hover:border-[var(--main)] transition-all no-underline text-xs uppercase tracking-widest font-bold"
            >
              <Plus size={14} />
              {a.icon}
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent articles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
            Recent articles
          </h2>
          <Link
            to="/admin/posts"
            className="text-[var(--main)] text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-white/5 divide-y divide-white/5">
          {loadingRecent ? (
            <div className="p-8 flex justify-center">
              <Loader2 size={20} className="animate-spin text-white/20" />
            </div>
          ) : recent.length === 0 ? (
            <p className="p-8 text-center text-white/20 text-xs uppercase tracking-widest">
              No articles yet.
            </p>
          ) : (
            recent.map((p) => (
              <Link
                key={p.id}
                to={`/admin/posts/edit/${p.id}`}
                className="flex items-center gap-4 p-4 no-underline group hover:bg-white/[0.02] transition-colors"
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt=""
                    className="w-12 h-12 object-cover rounded shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-[var(--main)] transition-colors">
                    {p.title}
                  </p>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mt-1">
                    {[p.category, p.date].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-white/20 group-hover:text-white transition-colors shrink-0"
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
