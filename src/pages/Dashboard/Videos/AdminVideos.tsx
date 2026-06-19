import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { Trash2, Edit, Plus, Star, Tv } from "lucide-react";

interface Video {
  id: string;
  title: string;
  artist: string;
  category: string;
  duration: string;
  embedId: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setVideos(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Video[]
      );
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this video permanently?")) {
      await deleteDoc(doc(db, "videos", id));
      setVideos((prev) => prev.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
            MANAGE VIDEOS
          </h1>
          <p className="text-white/30 text-xs uppercase tracking-widest mt-1">
            YouTube videos shown on the Videos page
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/videos/create")}
          className="bg-[var(--main)] text-white px-6 py-3 font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95"
        >
          <Plus size={16} /> Add Video
        </button>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-4">Video</th>
                <th className="px-6 py-4 hidden sm:table-cell">Category</th>
                <th className="px-6 py-4 hidden md:table-cell">Duration</th>
                <th className="px-6 py-4 hidden lg:table-cell">Flags</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-white/20 animate-pulse uppercase tracking-widest text-xs"
                  >
                    Receiving Signal...
                  </td>
                </tr>
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Tv size={28} className="text-white/10" />
                      <p className="text-white/20 italic tracking-widest text-xs uppercase">
                        No videos yet. Add your first one.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr
                    key={video.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Thumbnail + title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={`https://img.youtube.com/vi/${video.embedId}/mqdefault.jpg`}
                            alt=""
                            className="w-16 h-10 object-cover rounded grayscale group-hover:grayscale-0 transition-all"
                          />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm leading-tight line-clamp-1 group-hover:text-[var(--main)] transition-colors">
                            {video.title}
                          </p>
                          <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">
                            {video.artist}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="px-2 py-1 bg-white/5 text-white/60 text-[10px] rounded uppercase font-bold">
                        {video.category}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-white/40 text-xs font-mono">
                        {video.duration}
                      </span>
                    </td>

                    {/* Flags */}
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {video.isFeatured && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--main)]/20 text-[var(--main)] text-[9px] font-black uppercase tracking-widest rounded">
                            <Star size={9} fill="currentColor" /> Featured
                          </span>
                        )}
                        {video.isNew && (
                          <span className="px-2 py-0.5 bg-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest rounded">
                            New
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/videos/edit/${video.id}`)
                          }
                          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                          title="Edit video"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete video"
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

export default AdminVideos;
