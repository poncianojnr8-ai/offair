import { useEffect, useState, useCallback } from "react";
import { db, storage } from "../../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Plus, Trash2, Loader2, Share2, Image as ImageIcon } from "lucide-react";

interface SocialPost {
  id: string;
  platform: "tiktok" | "instagram";
  image: string;
  caption?: string;
  link: string;
}

const AdminSocial = () => {
  const [items, setItems] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [platform, setPlatform] = useState<"tiktok" | "instagram">("tiktok");
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "socialPosts"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SocialPost[];
      setItems(data);
    } catch (error) {
      console.error("Error fetching social posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setImageFile(file);
      if (file) setImagePreview(URL.createObjectURL(file));
    },
    []
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select a thumbnail image.");
    if (!link.trim()) return alert("Please paste the post link.");

    setIsSubmitting(true);
    try {
      const storageRef = ref(storage, `social/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "socialPosts"), {
        platform,
        image: url,
        caption: caption.trim(),
        link: link.trim(),
        createdAt: serverTimestamp(),
      });

      setPlatform("tiktok");
      setCaption("");
      setLink("");
      setImageFile(null);
      setImagePreview("");
      fetchItems();
    } catch (error) {
      console.error("Error creating social post:", error);
      alert("Failed to create social post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this social post?")) {
      await deleteDoc(doc(db, "socialPosts", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
          SOCIAL
        </h1>
        <p className="text-white/30 text-xs uppercase tracking-widest mt-1">
          TikTok &amp; Instagram post cards shown on the home page
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl p-6 space-y-5">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold">
              New Social Post
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Platform */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) =>
                    setPlatform(e.target.value as "tiktok" | "instagram")
                  }
                  className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm cursor-pointer appearance-none"
                >
                  <option value="tiktok" className="bg-[var(--bg-secondary)]">
                    TikTok
                  </option>
                  <option value="instagram" className="bg-[var(--bg-secondary)]">
                    Instagram
                  </option>
                </select>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Caption
                </label>
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Short caption (optional)"
                  className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm"
                />
              </div>

              {/* Link */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Post Link
                </label>
                <input
                  required
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://tiktok.com/@.../video/..."
                  className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm"
                />
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Thumbnail
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover mb-2 rounded"
                  />
                )}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 p-5 hover:border-[var(--main)] cursor-pointer transition-all rounded">
                  <ImageIcon className="text-white/20 mb-2" size={22} />
                  <span className="text-xs text-white/40 text-center">
                    {imageFile ? imageFile.name : "Select a screenshot / cover"}
                  </span>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--main)] py-3 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <Plus size={14} /> Add Post
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                    <th className="px-6 py-4">Post</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Platform</th>
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
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Share2 size={28} className="text-white/10" />
                          <p className="text-white/20 italic tracking-widest text-xs uppercase">
                            No social posts yet. Add your first one.
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
                            <img
                              src={item.image}
                              alt=""
                              className="w-10 h-10 object-cover rounded"
                            />
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white font-medium text-sm line-clamp-1 group-hover:text-[var(--main)] transition-colors"
                            >
                              {item.caption || item.link}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="px-2 py-1 bg-white/5 text-white/60 text-[10px] rounded uppercase font-bold">
                            {item.platform}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSocial;
