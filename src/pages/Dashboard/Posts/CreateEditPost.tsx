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
  const [addToHero, setAddToHero] = useState(false);
  const [heroHeadlineWeight, setHeroHeadlineWeight] = useState<
    "bold" | "regular"
  >("bold");
  const [heroHeadlinePlacement, setHeroHeadlinePlacement] =
    useState("top-right");
  const [addToTrending, setAddToTrending] = useState(false);
  const [trendingRank, setTrendingRank] = useState<number | "">("");
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
          setAddToHero(data.addToHero ?? false);
          setHeroHeadlineWeight(
            data.heroHeadlineWeight === "regular" ? "regular" : "bold"
          );
          setHeroHeadlinePlacement(data.heroHeadlinePlacement || "top-right");
          setAddToTrending(data.addToTrending ?? false);
          setTrendingRank(
            typeof data.trendingRank === "number" ? data.trendingRank : ""
          );
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

      const flagFields = {
        addToHero,
        heroHeadlineWeight,
        heroHeadlinePlacement,
        addToTrending,
        trendingRank:
          addToTrending && trendingRank !== "" ? Number(trendingRank) : null,
      };

      if (isEditMode && id) {
        await updateDoc(doc(db, "posts", id), {
          title,
          category,
          image: imageUrl,
          body,
          ...flagFields,
        });
      } else {
        await addDoc(collection(db, "posts"), {
          title,
          category,
          image: imageUrl,
          body,
          ...flagFields,
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

            {/* Placement flags */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Placement
              </label>

              {/* Add to Hero */}
              <label className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-white/10 cursor-pointer hover:border-[var(--main)] transition-all">
                <div>
                  <p className="text-white text-sm font-bold">Add to Hero</p>
                  <p className="text-white/30 text-[10px] tracking-wide mt-0.5">
                    Features this article in the homepage hero slider
                  </p>
                </div>
                <div
                  className={`w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${
                    addToHero ? "bg-[var(--main)]" : "bg-white/10"
                  }`}
                  onClick={() => setAddToHero((v) => !v)}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 mx-1 ${
                      addToHero ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>

              {/* Hero headline formatting (only when in hero) */}
              {addToHero && (
                <div className="space-y-3 pl-1 pb-1">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                      Headline weight
                    </label>
                    <div className="flex gap-2">
                      {(["bold", "regular"] as const).map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setHeroHeadlineWeight(w)}
                          className={`flex-1 py-2.5 text-xs uppercase tracking-widest border transition-all ${
                            heroHeadlineWeight === w
                              ? "bg-[var(--main)] border-[var(--main)] text-white"
                              : "bg-[var(--bg-secondary)] border-white/10 text-white/50 hover:text-white"
                          } ${w === "bold" ? "font-black" : "font-normal"}`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                      Headline placement
                    </label>
                    <select
                      value={heroHeadlinePlacement}
                      onChange={(e) => setHeroHeadlinePlacement(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all cursor-pointer appearance-none text-sm"
                    >
                      <option value="top-right">Top right</option>
                      <option value="top-left">Top left</option>
                      <option value="center">Centre</option>
                      <option value="bottom-right">Bottom right</option>
                      <option value="bottom-left">Bottom left</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Add to Trending */}
              <label className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-white/10 cursor-pointer hover:border-[var(--main)] transition-all">
                <div>
                  <p className="text-white text-sm font-bold">Add to Trending</p>
                  <p className="text-white/30 text-[10px] tracking-wide mt-0.5">
                    Lists this article in the homepage Trending section
                  </p>
                </div>
                <div
                  className={`w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${
                    addToTrending ? "bg-[var(--main)]" : "bg-white/10"
                  }`}
                  onClick={() => setAddToTrending((v) => !v)}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 mx-1 ${
                      addToTrending ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>

              {/* Trending rank (only when trending is on) */}
              {addToTrending && (
                <div className="space-y-2 pl-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                    Trending rank{" "}
                    <span className="text-white/20 normal-case">
                      (lower = higher up)
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={trendingRank}
                    onChange={(e) =>
                      setTrendingRank(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="e.g. 1"
                    className="w-full bg-[var(--bg-secondary)] border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm"
                  />
                </div>
              )}
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
