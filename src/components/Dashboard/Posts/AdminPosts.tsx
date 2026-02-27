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
import { Trash2, Edit, Plus, ExternalLink } from "lucide-react";

interface Post {
  id: string;
  title: string;
  category: string;
  date: string;
  image?: string;
}

const AdminPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      setPosts(data);
    } catch (error) {
      console.error("Error fetching admin posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this post permanently?")) {
      await deleteDoc(doc(db, "posts", id));
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
            MANAGE ARTICLES
          </h1>
        </div>
        <button
          onClick={() => navigate("/admin/posts/create")}
          className="bg-[var(--main)] text-white px-6 py-3 font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95"
        >
          <Plus size={16} /> Create New Post
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-white/20 animate-pulse uppercase tracking-widest text-xs"
                  >
                    Receiving Signal...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-white/20 italic tracking-widest text-xs"
                  >
                    No articles found in the database.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={post.image}
                          alt=""
                          className="w-10 h-10 object-cover rounded grayscale"
                        />
                        <Link
                          to={`/posts/${post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-medium group-hover:text-[var(--main)] transition-colors line-clamp-1 flex items-center gap-2"
                        >
                          {post.title}
                          <ExternalLink
                            size={12}
                            className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0"
                          />
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/5 text-white/60 text-[10px] rounded uppercase font-bold">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/posts/edit/${post.id}`)
                          }
                          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                          title="Edit post"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete post"
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

export default AdminPosts;
