import { useState, useEffect } from "react";
import { db, storage } from "../../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

const AdminPosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const postsCollection = collection(db, "posts");

  const fetchPosts = async () => {
    const q = query(postsCollection, orderBy("createdAt", "desc"));
    const data = await getDocs(q);
    setPosts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select an image first!");

    setUploading(true);
    try {
      const storageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(postsCollection, {
        title,
        category,
        image: imageUrl,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        createdAt: new Date(),
      });

      // 3. Reset
      setTitle("");
      setCategory("");
      setImageFile(null);
      fetchPosts();
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this article?")) {
      await deleteDoc(doc(db, "posts", id));
      fetchPosts();
    }
  };

  return (
    <div className="text-white max-w-4xl mx-auto">
      <h2 className="text-3xl font-[var(--style-font)] mb-8 tracking-tighter uppercase">
        Article Workshop
      </h2>

      {/* Create New Article */}
      <form
        onSubmit={handleAddPost}
        className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-white/5 space-y-4 mb-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-black border border-white/10 p-3 outline-none focus:border-[var(--main)] transition-all"
          />
          <input
            required
            placeholder="Category (e.g. Music, Underground)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-black border border-white/10 p-3 outline-none focus:border-[var(--main)] transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-white/10 p-3 cursor-pointer hover:border-[var(--main)] transition-all text-sm text-white/50">
            <ImageIcon size={18} />
            {imageFile ? imageFile.name : "Select Cover Image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                setImageFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="bg-[var(--main)] px-8 py-3 font-black uppercase text-xs tracking-widest disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Publish Signal"
            )}
          </button>
        </div>
      </form>

      {/* List of Articles */}
      <div className="grid gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group flex gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:border-white/10 transition-all"
          >
            <img
              src={post.image}
              alt=""
              className="w-24 h-24 object-cover rounded grayscale group-hover:grayscale-0 transition-all"
            />
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-lg leading-tight">{post.title}</h3>
              <p className="text-xs text-[var(--main)] uppercase tracking-widest mt-1">
                {post.category} • {post.date}
              </p>
            </div>
            <button
              onClick={() => handleDelete(post.id)}
              className="p-4 text-white/20 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPosts;
