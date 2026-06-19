import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Trash2,
  Edit,
  Plus,
  ExternalLink,
  Video,
  TrendingUp,
} from "lucide-react";

interface TrendingItem {
  id: string;
  title: string;
  rank: number;
  image?: string;
  category?: string;
  hasVideo?: boolean;
}

const AdminTrending = () => {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "trending"), orderBy("rank", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrendingItem[];
      setItems(data);
    } catch (error) {
      console.error("Error fetching trending items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this trending item?")) {
      await deleteDoc(doc(db, "trending", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
            TRENDING
          </h1>
          <p className="text-white/30 text-xs uppercase tracking-widest mt-1">
            Featured trending stories on the home page
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/trending/create")}
          className="bg-[var(--main)] text-white px-6 py-3 font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95"
        >
          <Plus size={16} /> Create Trending
        </button>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Story</th>
                <th className="px-6 py-4 hidden sm:table-cell">Category</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-white/20 animate-pulse uppercase tracking-widest text-xs"
                  >
                    Receiving Signal...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <TrendingUp size={28} className="text-white/10" />
                      <p className="text-white/20 italic tracking-widest text-xs uppercase">
                        No trending items yet. Create your first one.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="text-[var(--main)] font-black text-sm">
                        #{item.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/trending/${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-medium group-hover:text-[var(--main)] transition-colors line-clamp-1 flex items-center gap-2"
                          >
                            {item.title}
                            <ExternalLink
                              size={12}
                              className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0"
                            />
                          </Link>
                          {item.hasVideo && (
                            <Video
                              size={14}
                              className="text-[var(--main)] shrink-0"
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="px-2 py-1 bg-white/5 text-white/60 text-[10px] rounded uppercase font-bold">
                        {item.category || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/trending/edit/${item.id}`)
                          }
                          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTrending;
