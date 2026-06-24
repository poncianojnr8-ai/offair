import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import Post from "../components/News/Post";
import Trending from "../components/News/Trending";
import SocialEmbedModal from "../components/Social/SocialEmbedModal";

import bgImage from "../assets/images/main-bg.png";

import { Search, Send, ArrowRight } from "lucide-react";

// Inline SVGs for social icons not available in lucide
const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type TrendingData = {
  id: string;
  title: string;
  rank: number;
  image: string;
};

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  image: string;
  weight: "bold" | "regular";
  placement: string;
};

// Hero headline positioning by placement option
const HERO_POSITION: Record<string, string> = {
  "top-right":
    "top-0 right-0 w-full md:max-w-[65%] pt-24 sm:pt-32 md:pt-40 lg:pt-44 items-end text-right",
  "top-left":
    "top-0 left-0 w-full md:max-w-[65%] pt-24 sm:pt-32 md:pt-40 lg:pt-44 items-start text-left",
  "bottom-right":
    "bottom-0 right-0 w-full md:max-w-[65%] pb-24 sm:pb-28 lg:pb-32 items-end text-right",
  "bottom-left":
    "bottom-0 left-0 w-full md:max-w-[65%] pb-24 sm:pb-28 lg:pb-32 items-start text-left",
  center: "inset-0 w-full justify-center items-center text-center",
};

type SocialPost = {
  id: string;
  platform: "tiktok" | "instagram";
  image: string;
  caption?: string;
  link: string;
};

// Social handles (used for the "follow" fallback + card labels)
const TIKTOK_HANDLE = "poncianojnr8";
const INSTAGRAM_HANDLE = "offairwithponciano";

const TikTokGlyph = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.7a2.4 2.4 0 0 1-2.54 2.4 2.4 2.4 0 0 1-2.54-2.4 2.4 2.4 0 0 1 2.54-2.4c.09 0 .18 0 .27.02V9.49c-.17-.02-.34-.02-.5-.02A5.7 5.7 0 0 0 1 15.38a5.7 5.7 0 0 0 5.7 5.7 5.7 5.7 0 0 0 5.7-5.7V9.93a7.38 7.38 0 0 0 4.58 1.62V8.17a4.83 4.83 0 0 1-3.39-1.48z" />
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const TRENDS_PER_PAGE = 3;

// Fallback shown only when there are no hero posts in the database yet.
const fallbackSlide: HeroSlide = {
  id: "",
  title: "OFF AIR",
  subtitle: "ADD A HERO POST TO GET STARTED",
  link: "",
  image: bgImage,
  weight: "bold",
  placement: "top-right",
};

// ─── Component ────────────────────────────────────────────────────────────────

const Home = () => {
  // Hero slider + Trending are both derived from the `posts` collection
  // (posts flagged with addToHero / addToTrending).
  const [currentSlide, setCurrentSlide] = useState(0);

  // Posts
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Trending
  const [trendPage, setTrendPage] = useState(1);
  const [trendSearch, setTrendSearch] = useState("");

  // Social posts (TikTok / Instagram cards)
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [activePost, setActivePost] = useState<SocialPost | null>(null);

  // Newsletter
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  // ── Fetches ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    const fetchSocial = async () => {
      try {
        const q = query(
          collection(db, "socialPosts"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        setSocialPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as SocialPost[]
        );
      } catch (error) {
        console.error("Error fetching social posts:", error);
      }
    };

    fetchPosts();
    fetchSocial();
  }, []);

  // ── Hero slides + Trending, derived from flagged posts ────────────────────

  const slides = useMemo<HeroSlide[]>(
    () =>
      posts
        .filter((p) => p.addToHero)
        .map((p) => ({
          id: p.id,
          title: (p.title || "").toUpperCase(),
          subtitle: (p.category || "Featured").toUpperCase(),
          link: `/posts/${p.id}`,
          image: p.image || bgImage,
          weight: p.heroHeadlineWeight === "regular" ? "regular" : "bold",
          placement: p.heroHeadlinePlacement || "top-right",
        })),
    [posts]
  );

  const trends = useMemo<TrendingData[]>(
    () =>
      posts
        .filter((p) => p.addToTrending)
        .sort((a, b) => {
          const ra =
            typeof a.trendingRank === "number" ? a.trendingRank : Infinity;
          const rb =
            typeof b.trendingRank === "number" ? b.trendingRank : Infinity;
          return ra - rb;
        })
        .map((p, i) => ({
          id: p.id,
          title: p.title,
          rank: typeof p.trendingRank === "number" ? p.trendingRank : i + 1,
          image: p.image,
        })),
    [posts]
  );

  // ── Auto-rotate hero slider ───────────────────────────────────────────────

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Keep the active slide index in range if the slide set shrinks.
  useEffect(() => {
    if (currentSlide > slides.length - 1) setCurrentSlide(0);
  }, [slides.length, currentSlide]);

  // ── Trending filter + pagination ─────────────────────────────────────────

  const filteredTrends = useMemo(() => {
    const q = trendSearch.trim().toLowerCase();
    if (!q) return trends;
    return trends.filter((t) => t.title.toLowerCase().includes(q));
  }, [trendSearch, trends]);

  const totalTrendPages = Math.max(
    1,
    Math.ceil(filteredTrends.length / TRENDS_PER_PAGE)
  );

  const pagedTrends = useMemo(() => {
    const start = (trendPage - 1) * TRENDS_PER_PAGE;
    return filteredTrends.slice(start, start + TRENDS_PER_PAGE);
  }, [filteredTrends, trendPage]);

  useEffect(() => {
    setTrendPage(1);
  }, [trendSearch]);

  // ── Newsletter ────────────────────────────────────────────────────────────

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setNewsletterStatus("submitting");
    try {
      await addDoc(collection(db, "newsletter"), {
        email: email.trim().toLowerCase(),
        subscribedAt: serverTimestamp(),
      });
      setNewsletterStatus("success");
      setEmail("");
    } catch (error) {
      console.error("Newsletter signup error:", error);
      setNewsletterStatus("error");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const hero = slides[currentSlide] ?? fallbackSlide;

  return (
    <>
    <div className="w-full">

      {/* ── Hero Slider ──────────────────────────────────────────────────── */}
      <section className="relative h-[58vh] sm:h-[66vh] md:h-[70vh] w-full overflow-hidden flex items-center justify-center p-0">
        <div className="absolute inset-0 z-0">
          <img
            src={hero.image}
            alt="Background"
            className="w-full h-full object-cover opacity-[0.68]"
          />
          {/* Bottom fade only — keeps the photo vivid while blending into the page */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-(--bg-primary)" />
          {/* Subtle left vignette so text stays legible */}
          <div className="absolute inset-0 bg-linear-to-r from-(--bg-primary)/60 via-transparent to-transparent" />
        </div>

        {/* Whole hero image links to the article */}
        {hero.link && (
          <Link
            to={hero.link}
            aria-label={hero.title}
            className="absolute inset-0 z-5"
          />
        )}

        {/* Headline — placement & weight controlled per-article in the editor */}
        <div
          className={`absolute z-10 px-(--section-px) pointer-events-none flex flex-col ${
            HERO_POSITION[hero.placement] ?? HERO_POSITION["top-right"]
          }`}
        >
          <h1
            className={`uppercase font-(--hero-font) text-white tracking-tight leading-[0.95] line-clamp-2 text-[2rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] xl:text-[6rem] ${
              hero.weight === "regular" ? "font-normal" : "font-medium"
            }`}
          >
            {hero.title}
          </h1>
          <p className="font-black uppercase mt-3 tracking-[0.3em] sm:tracking-[0.5em] md:tracking-[0.7em] text-[0.6rem] sm:text-xs md:text-sm lg:text-base text-(--main)">
            {hero.subtitle}
          </p>
        </div>

        {/* "Click Here" CTA — bottom right of the hero */}
        {hero.link && (
          <div className="absolute bottom-8 right-6 sm:bottom-10 sm:right-8 lg:bottom-14 lg:right-12 z-20">
            <Link
              to={hero.link}
              className="group relative inline-flex items-center gap-2.5 bg-(--main) text-white font-black uppercase tracking-[0.25em] text-[0.6rem] sm:text-xs px-7 sm:px-9 py-3.5 no-underline overflow-hidden transition-all duration-300 hover:text-black active:scale-95 shadow-[0_0_30px_rgba(222,44,44,0.35)]"
            >
              <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Click Here</span>
              <span className="relative z-10 flex group-hover:translate-x-1.5 transition-transform duration-300">
                <ArrowRight size={15} className="animate-pulse group-hover:animate-none" />
              </span>
            </Link>
          </div>
        )}

        {/* Slide dots — bottom centre */}
        <div className="absolute bottom-8 sm:bottom-12 lg:bottom-16 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full shrink-0 p-0 border-0 transition-all duration-300 ${
                currentSlide === index
                  ? "bg-white scale-125"
                  : "bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

       {/* ── Posts & Sidebar ──────────────────────────────────────────────── */}
      <section className="w-full bg-[var(--bg-primary)] py-12.5 md:py-25">
        <div className="w-full px-[var(--section-px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 items-start">

            {/* Latest Articles */}
            <div className="lg:col-span-2 flex flex-col gap-14 bg-[var(--bg-secondary)] p-6 sm:p-8 lg:p-10">
              <h3 className="text-sm md:text-md font-bold uppercase tracking-widest bg-[var(--main)] inline-block px-4 py-2 w-fit">
                Latest Articles
              </h3>

              {loadingPosts ? (
                <p className="text-white/20 animate-pulse uppercase tracking-widest">
                  Loading Posts
                </p>
              ) : (
                posts.map((post) => (
                  <Post
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    category={post.category}
                    date={post.date}
                    image={post.image}
                  />
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="flex flex-col gap-8">
                  {/* Trending */}
                  <div className="flex flex-col gap-10 bg-[var(--bg-secondary)] p-6 sm:p-8 lg:p-10">
                    <div className="flex flex-col gap-5">
                      <h3 className="text-sm md:text-md font-bold uppercase tracking-widest bg-[var(--main)] inline-block px-4 py-2 w-fit">
                        Trending
                      </h3>

                      <div className="relative w-full">
                        <Search
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                        />
                        <input
                          value={trendSearch}
                          onChange={(e) => setTrendSearch(e.target.value)}
                          placeholder="Search trends..."
                          className="w-full bg-black/30 border border-white/10 text-white placeholder:text-white/30 pl-12 pr-4 py-3 outline-none focus:border-[var(--main)] transition-all"
                        />
                      </div>
                    </div>

                    {loadingPosts ? (
                      <p className="text-white/20 animate-pulse uppercase tracking-widest text-xs">
                        Receiving Signal...
                      </p>
                    ) : pagedTrends.length === 0 ? (
                      <p className="text-white/20 italic text-xs uppercase tracking-widest">
                        No trending items yet.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-8">
                        {pagedTrends.map((trend) => (
                          <Trending key={trend.id} {...trend} />
                        ))}
                      </div>
                    )}

                    {!loadingPosts && filteredTrends.length > TRENDS_PER_PAGE && (
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-white/50 text-xs uppercase tracking-[0.25em]">
                          Page {trendPage} / {totalTrendPages}
                        </p>
                        <button
                          onClick={() =>
                            setTrendPage((prev) =>
                              prev >= totalTrendPages ? 1 : prev + 1
                            )
                          }
                          className="text-white font-black uppercase tracking-widest text-sm hover:text-[var(--main)] transition-all"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PJ Picks */}
                  <div className="flex flex-col gap-6 bg-[var(--bg-secondary)] p-6 sm:p-8 lg:p-10">
                    <h3 className="text-sm md:text-md font-bold uppercase tracking-widest bg-[var(--main)] inline-block px-4 py-2 w-fit">
                      PJ's Picks
                    </h3>

                    <p className="text-white text-sm font-bold">
                      Latest curated playlist from PJ — tap play to listen.
                    </p>

                    <div className="w-full overflow-hidden border border-white/30">
                      <iframe
                        title="PJ Picks Spotify"
                        src="https://open.spotify.com/embed/playlist/5pSWKL6FXEwe1lXNAZBrtz"
                        width="100%"
                        height="400"
                        loading="lazy"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        className="border-none block"
                      />
                    </div>

                    <a
                      href="https://open.spotify.com/playlist/5pSWKL6FXEwe1lXNAZBrtz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-sm font-bold no-underline hover:text-[var(--main)] transition-colors"
                    >
                      Listen to what we're listening to. Follow the Off Air
                      Spotify playlist.
                    </a>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Social Posts ─────────────────────────────────────────────────── */}
      <section className="w-full bg-[var(--bg-primary)] py-12 sm:py-20">
        <div className="w-full px-[var(--section-px)]">
          <div className="flex items-end justify-between gap-4 mb-8 sm:mb-12">
            <span className="text-[var(--main)] text-[10px] uppercase tracking-[0.4em] font-black">
              Social
            </span>
            <div className="flex items-center gap-4">
              <a
                href={`https://www.tiktok.com/@${TIKTOK_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <TikTokGlyph size={18} />
              </a>
              <a
                href={`https://www.instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
            </div>
          </div>

          {socialPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {socialPosts.slice(0, 8).map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setActivePost(post)}
                    className="group bg-[var(--bg-secondary)] border border-white/5 overflow-hidden text-left w-full"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.caption || post.platform}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-all duration-300" />
                      <span className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/70 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                        {post.platform === "tiktok" ? (
                          <TikTokGlyph size={11} />
                        ) : (
                          <InstagramIcon size={11} />
                        )}
                        {post.platform}
                      </span>
                    </div>
                    <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
                      <p className="text-white/60 text-[11px] sm:text-xs line-clamp-1">
                        {post.caption ||
                          `@${post.platform === "tiktok" ? TIKTOK_HANDLE : INSTAGRAM_HANDLE}`}
                      </p>
                      <span className="text-[var(--main)] text-[10px] uppercase tracking-widest font-black shrink-0 group-hover:text-white transition-colors">
                        View →
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* View More row */}
              <div className="flex justify-end mt-6 sm:mt-8">
                <div className="flex items-center gap-5">
                  <a
                    href={`https://www.tiktok.com/@${TIKTOK_HANDLE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em]"
                  >
                    <TikTokGlyph size={12} />
                    TikTok
                  </a>
                  <a
                    href={`https://www.instagram.com/${INSTAGRAM_HANDLE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em]"
                  >
                    <InstagramIcon size={12} />
                    Instagram
                  </a>
                  <span className="w-px h-3 bg-white/10" />
                  <a
                    href={`https://www.tiktok.com/@${TIKTOK_HANDLE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--main)] text-[10px] uppercase tracking-[0.2em] font-black hover:opacity-70 transition-opacity"
                  >
                    View More →
                  </a>
                </div>
              </div>
            </>
          ) : (
            // Fallback: follow cards when no posts have been added yet
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <a
                href={`https://www.tiktok.com/@${TIKTOK_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[var(--bg-secondary)] border border-white/5 p-8 flex items-center gap-5 no-underline hover:border-[var(--main)] transition-all"
              >
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/70 group-hover:text-[var(--main)] transition-colors shrink-0">
                  <TikTokGlyph size={22} />
                </div>
                <div>
                  <p className="text-white text-sm font-bold uppercase tracking-widest">
                    TikTok
                  </p>
                  <p className="text-white/40 text-[11px] tracking-wide mt-0.5">
                    @{TIKTOK_HANDLE} — Follow us →
                  </p>
                </div>
              </a>

              <a
                href={`https://www.instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[var(--bg-secondary)] border border-white/5 p-8 flex items-center gap-5 no-underline hover:border-[var(--main)] transition-all"
              >
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/70 group-hover:text-[var(--main)] transition-colors shrink-0">
                  <InstagramIcon size={22} />
                </div>
                <div>
                  <p className="text-white text-sm font-bold uppercase tracking-widest">
                    Instagram
                  </p>
                  <p className="text-white/40 text-[11px] tracking-wide mt-0.5">
                    @{INSTAGRAM_HANDLE} — Follow us →
                  </p>
                </div>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── Newsletter Signup ─────────────────────────────────────────────── */}
      <section className="w-full bg-[var(--bg-secondary)] py-12 sm:py-20">
        <div className="w-full px-[var(--section-px)] max-w-3xl mx-auto text-center">
          <span className="text-[var(--main)] text-[10px] uppercase tracking-[0.4em] font-black">
            Stay Connected
          </span>
          <h2 className="font-[var(--style-font)] text-white tracking-tighter text-[2rem] sm:text-[3rem] leading-tight mt-3 mb-4">
            JOIN THE COMMUNITY
          </h2>
          <p className="text-white/40 text-sm tracking-wide mb-10">
            Get first access to new sessions, drops and exclusive content —
            straight to your inbox. No noise, just the good stuff.
          </p>

          {newsletterStatus === "success" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--main)]/10 flex items-center justify-center">
                <Send size={20} className="text-[var(--main)]" />
              </div>
              <p className="text-white font-black uppercase tracking-widest text-sm">
                You're in. Signal received.
              </p>
              <p className="text-white/30 text-xs">
                Check your inbox for a welcome message.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-black border border-white/10 border-r-0 px-5 py-4 text-white placeholder:text-white/25 outline-none focus:border-[var(--main)] transition-all text-sm"
              />
              <button
                type="submit"
                disabled={newsletterStatus === "submitting"}
                className="bg-[var(--main)] px-8 py-4 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shrink-0 disabled:opacity-60"
              >
                {newsletterStatus === "submitting" ? "Sending..." : "Subscribe"}
              </button>
            </form>
          )}

          {newsletterStatus === "error" && (
            <p className="text-red-400 text-xs mt-3 uppercase tracking-widest">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </section>

    </div>

    <SocialEmbedModal post={activePost} onClose={() => setActivePost(null)} />
    </>
  );
};

export default Home;
