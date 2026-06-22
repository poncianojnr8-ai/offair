import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, storage } from "../../../firebase";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  getDocs,
  collection,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import RichTextEditor from "../../../components/Editor/RichTextEditor";

interface Category {
  id: string;
  name: string;
}

const CreateEditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  const uploadInlineImage = useCallback(async (file: File) => {
    const storageRef = ref(
      storage,
      `posts/content/${Date.now()}_${file.name}`
    );
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }, []);

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(
          collection(db, "categories"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: (doc.data() as { name: string }).name,
        }));
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Load existing post data in edit mode
  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setCategory(data.category || "");
          setExistingImageUrl(data.image || "");
          setImagePreview(data.image || "");
          setBody(data.body || "");
        }
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();
  }, [id, isEditMode]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setImageFile(file);
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode && !imageFile) {
      alert("Please select a cover image.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = existingImageUrl;

      // Upload new image if selected
      if (imageFile) {
        const storageRef = ref(
          storage,
          `posts/${Date.now()}_${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (isEditMode && id) {
        await updateDoc(doc(db, "posts", id), {
          title,
          category,
          image: imageUrl,
          body,
        });
      } else {
        await addDoc(collection(db, "posts"), {
          title,
          category,
          image: imageUrl,
          body,
          date: new Date().toLocaleDateString("en-GB"),
          createdAt: serverTimestamp(),
        });
      }

      navigate("/admin/posts");
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/20 animate-pulse uppercase tracking-widest text-xs">
          Receiving Signal...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/posts")}
            className="text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
            {isEditMode ? "EDIT ARTICLE" : "NEW ARTICLE"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column — Main Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-white text-lg outline-none focus:border-[var(--main)] transition-all"
              />
            </div>

            {/* Body — Rich Text Editor */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Content
              </label>
              <RichTextEditor
                value={body}
                onChange={setBody}
                uploadImage={uploadInlineImage}
                placeholder="Write the article..."
              />
            </div>
          </div>

          {/* Right Column — Meta & Image */}
          <div className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Category
              </label>

              {loadingCategories ? (
                <div className="w-full bg-[var(--bg-secondary)] border border-white/10 p-3 text-white/20 text-xs animate-pulse uppercase tracking-widest">
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="w-full bg-[var(--bg-secondary)] border border-white/10 p-3 text-white/30 text-xs">
                  No categories found.{" "}
                  <Link
                    to="/admin/categories"
                    className="text-[var(--main)] hover:text-white underline"
                  >
                    Add one first →
                  </Link>
                </div>
              ) : (
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all cursor-pointer appearance-none"
                >
                  <option value="" disabled className="bg-[var(--bg-secondary)]">
                    Select a category...
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.name}
                      className="bg-[var(--bg-secondary)]"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Cover Image
              </label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover mb-2"
                />
              )}

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 p-6 hover:border-[var(--main)] cursor-pointer transition-all">
                <ImageIcon className="text-white/20 mb-2" size={24} />
                <span className="text-xs text-white/40 text-center">
                  {imageFile
                    ? imageFile.name
                    : isEditMode
                    ? "Replace image (optional)"
                    : "Select JPG or PNG"}
                </span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--main)] py-4 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : isEditMode ? (
                "Update Article"
              ) : (
                "Broadcast Article"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditPost;
