import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Plus, Trash2, Loader2, Tag, Edit, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "categories"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate slug from name unless manually edited
  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(toSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(toSlug(value));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSlug("");
    setSlugManuallyEdited(false);
    setEditingId(null);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setSlug(cat.slug || "");
    setSlugManuallyEdited(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        slug: slug || toSlug(name),
      };

      if (editingId) {
        await updateDoc(doc(db, "categories", editingId), payload);
      } else {
        await addDoc(collection(db, "categories"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this category?")) {
      await deleteDoc(doc(db, "categories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
          CATEGORIES
        </h1>
        <p className="text-white/30 text-xs uppercase tracking-widest mt-1">
          Manage article categories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Add Category Form */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold">
                {editingId ? "Edit Category" : "New Category"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1 text-white/40 hover:text-white text-[10px] uppercase tracking-widest"
                >
                  <X size={12} /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Music"
                  className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description (optional)"
                  rows={2}
                  className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm resize-none"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Slug
                </label>
                <input
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="auto-generated"
                  className="w-full bg-black border border-white/10 p-3 text-white/60 outline-none focus:border-[var(--main)] transition-all text-sm font-mono"
                />
                <p className="text-[10px] text-white/20 tracking-wide">
                  Auto-generated from name. Edit to customise.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--main)] py-3 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : editingId ? (
                  <>
                    <Edit size={14} /> Update Category
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add Category
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Categories Table */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4 hidden md:table-cell">
                      Description
                    </th>
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
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Tag size={28} className="text-white/10" />
                          <p className="text-white/20 italic tracking-widest text-xs uppercase">
                            No categories yet. Add your first one.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="text-white font-medium text-sm">
                            {cat.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white/40 font-mono text-xs">
                            {cat.slug}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-white/40 text-xs line-clamp-1">
                            {cat.description || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(cat)}
                              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                              title="Edit category"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Delete category"
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
      </div>
    </div>
  );
};

export default AdminCategories;
