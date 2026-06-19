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
import { Trash2, Edit, Plus, ExternalLink, Star, Mic } from "lucide-react";

interface Interview {
  id: string;
  title: string;
  guest?: string;
  image?: string;
  isFeatured?: boolean;
}

const AdminInterviews = () => {
  const [items, setItems] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "interviews"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Interview[];
      setItems(data);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this interview permanently?")) {
      await deleteDoc(doc(db, "interviews", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
            MANAGE INTERVIEWS
          </h1>
          <p className="text-white/30 text-xs uppercase tracking-widest mt-1">
            Interviews shown on the Interviews page
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/interviews/create")}
          className="bg-[var(--main)] text-white px-6 py-3 font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95"
        >
          <Plus size={16} /> Create Interview
        </button>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-4">Interview</th>
                <th className="px-6 py-4 hidden sm:table-cell">Guest</th>
                <th className="px-6 py-4 hidden lg:table-cell">Flags</th>
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
                      <Mic size={28} className="text-white/10" />
                      <p className="text-white/20 italic tracking-widest text-xs uppercase">
                        No interviews yet. Create your first one.
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
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <Link
                          to={`/interviews/${item.id}`}
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
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-white/50 text-xs">
                        {item.guest || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {item.isFeatured && (
                        <span className="flex items-center gap-1 w-fit px-2 py-0.5 bg-[var(--main)]/20 text-[var(--main)] text-[9px] font-black uppercase tracking-widest rounded">
                          <Star size={9} fill="currentColor" /> Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/interviews/edit/${item.id}`)
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

export default AdminInterviews;
