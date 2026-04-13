import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Layouts
import Layout from "./components/Layout/Layout";
import DashboardLayout from "./components/Dashboard/Layout/DashboardLayout";

// Auth
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Dashboard/Login";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Videos from "./pages/Videos";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PostDetail from "./pages/PostDetail";
import HeroPost from "./pages/HeroPost";

// Admin Dashboard Components
import AdminPosts from "./components/Dashboard/Posts/AdminPosts";
import CreateEditPost from "./pages/Dashboard/Posts/CreateEditPost";
import AdminCategories from "./pages/Dashboard/Categories/AdminCategories";
import AdminTrending from "./pages/Dashboard/Trending/AdminTrending";
import AdminPicks from "./pages/Dashboard/Picks/AdminPicks";
import AdminHeroPosts from "./pages/Dashboard/HeroPosts/AdminHeroPosts";
import CreateEditHeroPost from "./pages/Dashboard/HeroPosts/CreateEditHeroPost";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/posts/welcome-to-off-air" element={<HeroPost />} />
            <Route path="/posts/unfiltered-noise" element={<HeroPost />} />
            <Route path="/posts/blood-vinyl" element={<HeroPost />} />
            <Route path="/posts/:id" element={<PostDetail />} />
          </Route>

          {/* --- Admin Login (public) --- */}
          <Route path="/admin/login" element={<Login />} />

          {/* --- Admin Dashboard Routes (protected) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<div className="text-white">Welcome</div>} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="posts/create" element={<CreateEditPost />} />
              <Route path="posts/edit/:id" element={<CreateEditPost />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="trending" element={<AdminTrending />} />
              <Route path="hero-posts" element={<AdminHeroPosts />} />
              <Route path="hero-posts/create" element={<CreateEditHeroPost />} />
              <Route path="hero-posts/edit/:id" element={<CreateEditHeroPost />} />
              <Route path="picks" element={<AdminPicks />} />
            </Route>
          </Route>

          {/* --- Global 404 --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
