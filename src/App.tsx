import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Layouts
import Layout from "./components/Layout/Layout";
import DashboardLayout from "./components/Dashboard/Layout/DashboardLayout";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PostDetail from "./pages/PostDetail";

// Admin Dashboard Components
import AdminPosts from "./components/Dashboard/Posts/AdminPosts";
import CreateEditPost from "./pages/Dashboard/Posts/CreateEditPost";
import AdminCategories from "./pages/Dashboard/Categories/AdminCategories";
import AdminTrending from "./pages/Dashboard/Trending/AdminTrending";
import AdminPicks from "./pages/Dashboard/Picks/AdminPicks";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/posts/:id" element={<PostDetail />} />
        </Route>

        {/* --- Admin Dashboard Routes --- */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<div className="text-white">Welcome</div>} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/create" element={<CreateEditPost />} />
          <Route path="posts/edit/:id" element={<CreateEditPost />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="trending" element={<AdminTrending />} />
          <Route path="picks" element={<AdminPicks />} />
        </Route>

        {/* --- Global 404 --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
