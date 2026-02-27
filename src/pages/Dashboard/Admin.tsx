import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";

const Admin = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Chris Brown Tour",
      category: "Music",
      date: "Jan 21, 2026",
    },
  ]);

  const [newPost, setNewPost] = useState({ title: "", category: "", date: "" });

  const addPost = () => {
    if (!newPost.title) return;
    setPosts([...posts, { ...newPost, id: Date.now() }]);
    setNewPost({ title: "", category: "", date: "" });
  };

  const deletePost = (id: number) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-32 px-[var(--section-px)]">
      <h1 className="text-4xl font-[var(--style-font)] text-white mb-10">
        Admin Portal
      </h1>

      {/* Create Form */}
      <div className="bg-[var(--bg-secondary)] p-8 rounded-lg mb-10 border border-white/5">
        <h2 className="text-[var(--main)] uppercase tracking-widest text-sm mb-6 font-bold">
          Add New Post
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="bg-black/50 border border-white/10 p-3 text-white outline-none focus:border-[var(--main)]"
            placeholder="Post Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <input
            className="bg-black/50 border border-white/10 p-3 text-white outline-none focus:border-[var(--main)]"
            placeholder="Category"
            value={newPost.category}
            onChange={(e) =>
              setNewPost({ ...newPost, category: e.target.value })
            }
          />
          <button
            onClick={addPost}
            className="bg-[var(--main)] text-white font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all"
          >
            <Plus size={20} /> Create Post
          </button>
        </div>
      </div>

      {/* Read / Update / Delete Table */}
      <div className="bg-[var(--bg-secondary)] overflow-hidden rounded-lg border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-black/40 text-white/50 text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="p-4">{post.title}</td>
                <td className="p-4 text-white/50">{post.category}</td>
                <td className="p-4 flex gap-4">
                  <button className="text-blue-400 hover:text-blue-300">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
