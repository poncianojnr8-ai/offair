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
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Video as VideoIcon,
} from "lucide-react";

const ToolbarButton = ({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded transition-colors ${
      active
        ? "bg-[var(--main)] text-white"
        : "text-white/50 hover:text-white hover:bg-white/10"
    }`}
  >
    {children}
  </button>
);

interface Category {
  id: string;
  name: string;
}

interface HeroPostData {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  videoUrl?: string;
  body?: string;
  hasVideo?: boolean;
}

const CreateEditHeroPost = () => {
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
  const [videoUrl, setVideoUrl] = useState("");
  const [existingVideoUrl, setExistingVideoUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEditMode);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: false,
        uploadImage: async (file: File) => {
          try {
            const storageRef = ref(
              storage,
              `hero-posts/content/${Date.now()}_${file.name}`
            );
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return url;
          } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
          }
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[300px] p-4",
      },
    },
  });

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
    if (!isEditMode || !id || !editor) return;

    const fetchPost = async () => {
      try {
        const docRef = doc(db, "heroPosts", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setCategory(data.category || "");
          setExistingImageUrl(data.image || "");
          setImagePreview(data.image || "");
          setVideoUrl(data.videoUrl || "");
          setExistingVideoUrl(data.videoUrl || "");
          if (data.body) {
            editor.commands.setContent(data.body);
          }
        }
      } catch (error) {
        console.error("Error loading hero post:", error);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();
  }, [id, isEditMode, editor]);

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

  const handleInlineImageUpload = useCallback(
    async (file: File) => {
      setUploadingImage(true);
      try {
        const storageRef = ref(
          storage,
          `hero-posts/content/${Date.now()}_${file.name}`
        );
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        editor?.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error("Error uploading inline image:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploadingImage(false);
      }
    },
    [editor]
  );

  const handleEmbedVideo = useCallback(() => {
    if (!videoUrl.trim()) return;

    // Extract YouTube video ID
    let embedUrl = videoUrl;
    let videoId = "";

    // YouTube URL patterns
    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?#]+)/,
    ];

    for (const pattern of youtubePatterns) {
      const match = videoUrl.match(pattern);
      if (match) {
        videoId = match[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
        break;
      }
    }

    // Create iframe HTML
    const iframeHtml = `<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full aspect-video my-4 rounded"></iframe>`;

    editor?.chain().focus().insertContent(iframeHtml).run();
  }, [videoUrl, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode && !imageFile) {
      alert("Please select a cover image.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = existingImageUrl;
      let finalVideoUrl = existingVideoUrl || (videoUrl.trim() || undefined);

      // Upload new cover image if selected
      if (imageFile) {
        const storageRef = ref(
          storage,
          `hero-posts/${Date.now()}_${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const body = editor?.getHTML() ?? "";

      const postData = {
        title,
        category,
        image: imageUrl,
        videoUrl: finalVideoUrl,
        body,
        hasVideo: !!finalVideoUrl,
        date: new Date().toLocaleDateString("en-GB"),
        createdAt: serverTimestamp(),
      };

      if (isEditMode && id) {
        await updateDoc(doc(db, "heroPosts", id), postData);
      } else {
        await addDoc(collection(db, "heroPosts"), postData);
      }

      navigate("/admin/hero-posts");
    } catch (error) {
      console.error("Error saving hero post:", error);
      alert("Failed to save hero post. Please try again.");
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
            onClick={() => navigate("/admin/hero-posts")}
            className="text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
            {isEditMode ? "EDIT HERO POST" : "NEW HERO POST"}
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
                placeholder="Hero post title..."
                className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-white text-lg outline-none focus:border-[var(--main)] transition-all"
              />
            </div>

            {/* Body — Rich Text Editor */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Content
              </label>
              <div className="border border-white/10 bg-[var(--bg-secondary)] focus-within:border-[var(--main)] transition-all">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10">
                  <ToolbarButton
                    onClick={() =>
                      editor?.chain().focus().toggleBold().run()
                    }
                    active={editor?.isActive("bold")}
                  >
                    <Bold size={15} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() =>
                      editor?.chain().focus().toggleItalic().run()
                    }
                    active={editor?.isActive("italic")}
                  >
                    <Italic size={15} />
                  </ToolbarButton>
                  <div className="w-px h-5 bg-white/10 mx-1" />
                  <ToolbarButton
                    onClick={() =>
                      editor
                        ?.chain()
                        .focus()
                        .toggleHeading({ level: 2 })
                        .run()
                    }
                    active={editor?.isActive("heading", { level: 2 })}
                  >
                    <Heading2 size={15} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() =>
                      editor
                        ?.chain()
                        .focus()
                        .toggleHeading({ level: 3 })
                        .run()
                    }
                    active={editor?.isActive("heading", { level: 3 })}
                  >
                    <Heading3 size={15} />
                  </ToolbarButton>
                  <div className="w-px h-5 bg-white/10 mx-1" />
                  <ToolbarButton
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                    active={editor?.isActive("bulletList")}
                  >
                    <List size={15} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                    active={editor?.isActive("orderedList")}
                  >
                    <ListOrdered size={15} />
                  </ToolbarButton>
                  <div className="w-px h-5 bg-white/10 mx-1" />
                  <ToolbarButton
                    onClick={() =>
                      editor?.chain().focus().toggleBlockquote().run()
                    }
                    active={editor?.isActive("blockquote")}
                  >
                    <Quote size={15} />
                  </ToolbarButton>
                </div>

                {/* Editor Area */}
                <div className="tiptap-editor text-white/80">
                  <EditorContent editor={editor} />
                </div>

                {/* Image Upload Toolbar */}
                <div className="flex items-center gap-4 p-3 border-t border-white/10">
                  <label className="flex items-center gap-2 px-3 py-2 bg-black/30 hover:bg-black/50 rounded transition-all cursor-pointer text-white/60 hover:text-white text-xs uppercase tracking-widest">
                    <ImageIcon size={14} />
                    {uploadingImage ? "Uploading..." : "Insert Image"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleInlineImageUpload(file);
                        }
                      }}
                      disabled={uploadingImage}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleEmbedVideo}
                    className="flex items-center gap-2 px-3 py-2 bg-black/30 hover:bg-black/50 rounded transition-all text-white/60 hover:text-white text-xs uppercase tracking-widest"
                  >
                    <VideoIcon size={14} />
                    Embed Video
                  </button>
                </div>
              </div>
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
                  className="w-full h-40 object-cover grayscale mb-2"
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

            {/* Video URL (Optional) */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Video URL <span className="text-white/20 normal-case">(optional)</span>
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-[var(--bg-secondary)] border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm"
              />
              <p className="text-[10px] text-white/20 tracking-wide">
                Paste YouTube URL to embed video in post
              </p>
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
                "Update Hero Post"
              ) : (
                "Broadcast Hero Post"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditHeroPost;