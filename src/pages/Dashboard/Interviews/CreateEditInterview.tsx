import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../../../firebase";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
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

const CreateEditInterview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState("");
  const [guest, setGuest] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingItem, setLoadingItem] = useState(isEditMode);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  // Load existing interview in edit mode
  useEffect(() => {
    if (!isEditMode || !id || !editor) return;

    const fetchItem = async () => {
      try {
        const docRef = doc(db, "interviews", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setGuest(data.guest || "");
          setExistingImageUrl(data.image || "");
          setImagePreview(data.image || "");
          setIsFeatured(data.isFeatured ?? false);
          if (data.body) {
            editor.commands.setContent(data.body);
          }
        }
      } catch (error) {
        console.error("Error loading interview:", error);
      } finally {
        setLoadingItem(false);
      }
    };

    fetchItem();
  }, [id, isEditMode, editor]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setImageFile(file);
      if (file) setImagePreview(URL.createObjectURL(file));
    },
    []
  );

  const handleInlineImageUpload = useCallback(
    async (file: File) => {
      setUploadingImage(true);
      try {
        const storageRef = ref(
          storage,
          `interviews/content/${Date.now()}_${file.name}`
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

    let embedUrl = videoUrl;
    let videoId = "";
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
      if (imageFile) {
        const storageRef = ref(
          storage,
          `interviews/${Date.now()}_${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const body = editor?.getHTML() ?? "";

      const itemData = {
        title: title.trim(),
        guest: guest.trim(),
        image: imageUrl,
        body,
        isFeatured,
        date: new Date().toLocaleDateString("en-GB"),
      };

      if (isEditMode && id) {
        await updateDoc(doc(db, "interviews", id), itemData);
      } else {
        await addDoc(collection(db, "interviews"), {
          ...itemData,
          createdAt: serverTimestamp(),
        });
      }

      navigate("/admin/interviews");
    } catch (error) {
      console.error("Error saving interview:", error);
      alert("Failed to save interview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingItem) {
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
          onClick={() => navigate("/admin/interviews")}
          className="text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-[var(--style-font)] text-white tracking-tighter">
          {isEditMode ? "EDIT INTERVIEW" : "NEW INTERVIEW"}
        </h1>
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
                placeholder="Interview title..."
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
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    active={editor?.isActive("bold")}
                  >
                    <Bold size={15} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    active={editor?.isActive("italic")}
                  >
                    <Italic size={15} />
                  </ToolbarButton>
                  <div className="w-px h-5 bg-white/10 mx-1" />
                  <ToolbarButton
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    active={editor?.isActive("heading", { level: 2 })}
                  >
                    <Heading2 size={15} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 3 }).run()
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

                {/* Media Toolbar */}
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
                        if (file) handleInlineImageUpload(file);
                        e.target.value = "";
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
            {/* Guest */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Guest / Interviewee
              </label>
              <input
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                placeholder="e.g. PJ, Various Artists..."
                className="w-full bg-[var(--bg-secondary)] border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm"
              />
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

            {/* Video URL (Optional) */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Video URL{" "}
                <span className="text-white/20 normal-case">(optional)</span>
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-[var(--bg-secondary)] border border-white/10 p-3 text-white outline-none focus:border-[var(--main)] transition-all text-sm"
              />
              <p className="text-[10px] text-white/20 tracking-wide">
                Paste a YouTube URL, then use “Embed Video” to place it in the body.
              </p>
            </div>

            {/* Featured toggle */}
            <label className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-white/10 cursor-pointer hover:border-[var(--main)] transition-all">
              <div>
                <p className="text-white text-sm font-bold">Featured</p>
                <p className="text-white/30 text-[10px] tracking-wide mt-0.5">
                  Shown as the large interview at the top of the page
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--main)] py-4 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : isEditMode ? (
                "Update Interview"
              ) : (
                "Publish Interview"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditInterview;
