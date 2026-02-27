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
import { Plus, Trash2, Loader2, TrendingUp, Image as ImageIcon } from "lucide-react";

interface TrendingItem {
  id: string;
  title: string;
  rank: number;
  image: string;
}

const AdminTrending = () => {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [rank, setRank] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      const storageRef = ref(storage, `trending/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "trending"), {
        title: title.trim(),
        rank: Number(rank),
        image: url,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setRank("");
      setImageFile(null);
      setImagePreview("");
      fetchItems();
    } catch (error) {
      console.error("Error creating trending item:", error);
      alert("Failed to create trending item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this trending item?")) {
      await deleteDoc(doc(db, "trending", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
          TRENDING
        </h1>
        <p className="text-white/30 text-xs uppercase tracking-widest mt-1">
          Manage trending items on the home page
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl p-6 space-y-5">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold">
              New Trending Item
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
                  placeholder="e.g. Blood & Vinyl"
                  className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Rank
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={rank}
                  onChange={(e) =>
                    setRank(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="1"
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
                    <Plus size={14} /> Add Item
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
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Item</th>
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
                          <TrendingUp size={28} className="text-white/10" />
                          <p className="text-white/20 italic tracking-widest text-xs uppercase">
                            No trending items yet.
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
                            <img
                              src={item.image}
                              alt=""
                              className="w-10 h-10 object-cover rounded grayscale"
                            />
                            <span className="text-white font-medium text-sm line-clamp-1">
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(item.id)}
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

export default AdminTrending;
