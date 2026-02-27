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
import { Plus, Trash2, Loader2, Star, Image as ImageIcon } from "lucide-react";

interface PickItem {
  id: string;
  title: string;
  image: string;
  link?: string;
}

const AdminPicks = () => {
  const [picks, setPicks] = useState<PickItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchPicks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "picks"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PickItem[];
      setPicks(data);
    } catch (error) {
      console.error("Error fetching picks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPicks();
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
    if (!imageFile) return alert("Please select an image.");

    setIsSubmitting(true);
    try {
      const storageRef = ref(storage, `picks/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "picks"), {
        title: title.trim(),
        image: url,
        link: link.trim() || null,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setLink("");
      setImageFile(null);
      setImagePreview("");
      fetchPicks();
    } catch (error) {
      console.error("Error creating pick:", error);
      alert("Failed to create pick.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this pick?")) {
      await deleteDoc(doc(db, "picks", id));
      setPicks((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
          PJ'S PICKS
        </h1>
        <p className="text-white/30 text-xs uppercase tracking-widest mt-1">
          One pick shown at a time on the home page, rotating every 10 seconds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl p-6 space-y-5">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold">
              New Pick
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Title
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Late Night Sessions"
                  className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Link <span className="text-white/20 normal-case">(optional)</span>
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Image
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover grayscale mb-2 rounded"
                  />
                )}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 p-5 hover:border-[var(--main)] cursor-pointer transition-all rounded">
                  <ImageIcon className="text-white/20 mb-2" size={22} />
                  <span className="text-xs text-white/40 text-center">
                    {imageFile ? imageFile.name : "Select JPG or PNG"}
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
                    <Plus size={14} /> Add Pick
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
                    <th className="px-6 py-4">Pick</th>
                    <th className="px-6 py-4 hidden md:table-cell">Link</th>
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
                  ) : picks.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Star size={28} className="text-white/10" />
                          <p className="text-white/20 italic tracking-widest text-xs uppercase">
                            No picks yet. Add your first one.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    picks.map((pick) => (
                      <tr
                        key={pick.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={pick.image}
                              alt=""
                              className="w-10 h-10 object-cover rounded grayscale"
                            />
                            <span className="text-white font-medium text-sm line-clamp-1">
                              {pick.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {pick.link ? (
                            <a
                              href={pick.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--main)] text-xs hover:text-white transition-colors truncate block max-w-[180px]"
                            >
                              {pick.link}
                            </a>
                          ) : (
                            <span className="text-white/20 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(pick.id)}
                            className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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

export default AdminPicks;
