import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import Interviews from "./pages/Interviews";
import InterviewDetail from "./pages/InterviewDetail";
import Videos from "./pages/Videos";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PostDetail from "./pages/PostDetail";
import HeroPost from "./pages/HeroPost";
import TrendingDetail from "./pages/TrendingDetail";

// Admin Dashboard Components
import AdminPosts from "./components/Dashboard/Posts/AdminPosts";
import CreateEditPost from "./pages/Dashboard/Posts/CreateEditPost";
import AdminCategories from "./pages/Dashboard/Categories/AdminCategories";
import AdminTrending from "./pages/Dashboard/Trending/AdminTrending";
import CreateEditTrending from "./pages/Dashboard/Trending/CreateEditTrending";
import AdminInterviews from "./pages/Dashboard/Interviews/AdminInterviews";
import CreateEditInterview from "./pages/Dashboard/Interviews/CreateEditInterview";
import AdminPicks from "./pages/Dashboard/Picks/AdminPicks";
import AdminHeroPosts from "./pages/Dashboard/HeroPosts/AdminHeroPosts";
import CreateEditHeroPost from "./pages/Dashboard/HeroPosts/CreateEditHeroPost";
import AdminVideos from "./pages/Dashboard/Videos/AdminVideos";
import CreateEditVideo from "./pages/Dashboard/Videos/CreateEditVideo";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/interviews/:id" element={<InterviewDetail />} />
            <Route path="/about" element={<Navigate to="/interviews" replace />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/hero/:id" element={<HeroPost />} />
            <Route path="/trending/:id" element={<TrendingDetail />} />
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
              <Route path="trending/create" element={<CreateEditTrending />} />
              <Route path="trending/edit/:id" element={<CreateEditTrending />} />
              <Route path="interviews" element={<AdminInterviews />} />
              <Route path="interviews/create" element={<CreateEditInterview />} />
              <Route path="interviews/edit/:id" element={<CreateEditInterview />} />
              <Route path="hero-posts" element={<AdminHeroPosts />} />
              <Route path="hero-posts/create" element={<CreateEditHeroPost />} />
              <Route path="hero-posts/edit/:id" element={<CreateEditHeroPost />} />
              <Route path="picks" element={<AdminPicks />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="videos/create" element={<CreateEditVideo />} />
              <Route path="videos/edit/:id" element={<CreateEditVideo />} />
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
