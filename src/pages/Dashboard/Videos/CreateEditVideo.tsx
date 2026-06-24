import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ArrowLeft, Loader2, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

interface Category {
  id: string;
  name: string;
}

// Extract YouTube video ID from any common URL format
function extractYouTubeId(input: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s?#]+)/,
    /(?:youtu\.be\/)([^&\s?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\s?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\s?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  // If it looks like a bare ID already (no slashes/dots), return as-is
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  return "";
}

const CreateEditVideo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [embedId, setEmbedId] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories from the shared categories collection
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(
          collection(db, "categories"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        setCategories(
          snapshot.docs.map((d) => ({
            id: d.id,
            name: (d.data() as { name: string }).name,
          }))
        );
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Derive embedId live as user types the URL
  useEffect(() => {
    const extracted = extractYouTubeId(youtubeUrl);
    setEmbedId(extracted);
  }, [youtubeUrl]);

  // Load existing data in edit mode
  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchVideo = async () => {
      try {
        const snap = await getDoc(doc(db, "videos", id));
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title || "");
          setArtist(data.artist || "");
          setCategory(data.category || "");
          setEmbedId(data.embedId || "");
          setYoutubeUrl(
            data.embedId
              ? `https://www.youtube.com/watch?v=${data.embedId}`
              : ""
          );
          setIsNew(data.isNew ?? false);
          setIsFeatured(data.isFeatured ?? false);
        }
      } catch (err) {
        console.error("Error loading video:", err);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchVideo();
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!embedId) {
      alert("Could not extract a YouTube video ID. Please check the URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        artist: artist.trim(),
        category,
        embedId,
        isNew,
        isFeatured,
      };

      if (isEditMode && id) {
        await updateDoc(doc(db, "videos", id), payload);
      } else {
        await addDoc(collection(db, "videos"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      navigate("/admin/videos");
    } catch (err) {
      console.error("Error saving video:", err);
      alert("Failed to save video. Please try again.");
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
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/admin/videos")}
          className="text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
          {isEditMode ? "EDIT VIDEO" : "ADD VIDEO"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── Left: main fields ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* YouTube URL */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                YouTube URL
              </label>
              <input
                required={!isEditMode}
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-white outline-none focus:border-[var(--main)] transition-all"
              />
              {/* Live preview */}
              {embedId ? (
                <div className="flex items-start gap-4 p-3 bg-[var(--bg-secondary)] border border-white/5 rounded">
                  <img
                    src={`https://img.youtube.com/vi/${embedId}/mqdefault.jpg`}
                    alt="Thumbnail preview"
                    className="w-24 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
                      Video ID detected
                    </p>
                    <p className="text-white/70 text-xs font-mono break-all">
                      {embedId}
                    </p>
                    <a
                      href={`https://www.youtube.com/watch?v=${embedId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--main)] text-[10px] uppercase tracking-widest mt-2 hover:text-white transition-colors"
                    >
                      <Youtube size={11} /> Verify on YouTube
                    </a>
                  </div>
                </div>
              ) : youtubeUrl.length > 4 ? (
                <p className="text-[10px] text-red-400 tracking-wide">
                  Could not extract a video ID — check the URL.
                </p>
              ) : null}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Video title..."
                className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-white text-lg outline-none focus:border-[var(--main)] transition-all"
              />
            </div>

            {/* Artist */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Artist / Production
              </label>
              <input
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Off Air, Various Artists..."
                className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-white outline-none focus:border-[var(--main)] transition-all"
              />
            </div>
          </div>

          {/* ── Right: meta ── */}
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

            {/* Flags */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Flags
              </label>

              {/* Featured */}
              <label className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-white/10 cursor-pointer hover:border-[var(--main)] transition-all group">
                <div>
                  <p className="text-white text-sm font-bold">Featured</p>
                  <p className="text-white/30 text-[10px] tracking-wide mt-0.5">
                    Shown as the hero video at the top of the page
                  </p>
                </div>
                <div
                  className={`w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${
                    isFeatured ? "bg-[var(--main)]" : "bg-white/10"
                  }`}
                  onClick={() => setIsFeatured((v) => !v)}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 mx-1 ${
                      isFeatured ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>

              {/* New badge */}
              <label className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-white/10 cursor-pointer hover:border-[var(--main)] transition-all group">
                <div>
                  <p className="text-white text-sm font-bold">New badge</p>
                  <p className="text-white/30 text-[10px] tracking-wide mt-0.5">
                    Shows a red "New" badge on the thumbnail
                  </p>
                </div>
                <div
                  className={`w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${
                    isNew ? "bg-[var(--main)]" : "bg-white/10"
                  }`}
                  onClick={() => setIsNew((v) => !v)}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 mx-1 ${
                      isNew ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
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
                "Update Video"
              ) : (
                "Add Video"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditVideo;
