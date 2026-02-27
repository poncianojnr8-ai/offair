import { useState, useEffect, useMemo } from "react";
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
import Picks from "../components/News/Picks";

import bgImage from "../assets/images/main-bg.png";

import { Search, Send } from "lucide-react";

// Inline SVGs for deprecated/removed lucide social icons
const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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

type PickData = {
  id: string;
  title: string;
  image: string;
  link?: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TRENDS_PER_PAGE = 3;

const slides = [
  { title: "WELCOME TO OFF AIR", subtitle: "THE PELICANS" },
  { title: "UNFILTERED NOISE", subtitle: "LONDON UNDERGROUND" },
  { title: "BLOOD & VINYL", subtitle: "LATE NIGHT SESSIONS" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Home = () => {
  // Hero slider
  const [currentSlide, setCurrentSlide] = useState(0);

  // Posts
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Trending
  const [trends, setTrends] = useState<TrendingData[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [trendPage, setTrendPage] = useState(1);
  const [trendSearch, setTrendSearch] = useState("");

  // PJ's Picks
  const [picks, setPicks] = useState<PickData[]>([]);
  const [loadingPicks, setLoadingPicks] = useState(true);
  const [currentPick, setCurrentPick] = useState(0);

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

    const fetchTrends = async () => {
      try {
        const q = query(collection(db, "trending"), orderBy("rank", "asc"));
        const snapshot = await getDocs(q);
        setTrends(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TrendingData[]
        );
      } catch (error) {
        console.error("Error fetching trending:", error);
      } finally {
        setLoadingTrends(false);
      }
    };

    const fetchPicks = async () => {
      try {
        const q = query(collection(db, "picks"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setPicks(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as PickData[]
        );
      } catch (error) {
        console.error("Error fetching picks:", error);
      } finally {
        setLoadingPicks(false);
      }
    };

    fetchPosts();
    fetchTrends();
    fetchPicks();
  }, []);

  // ── Auto-rotate hero slider ───────────────────────────────────────────────

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // ── Auto-rotate PJ's Pick every 10s ─────────────────────────────────────

  useEffect(() => {
    if (picks.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentPick((prev) => (prev === picks.length - 1 ? 0 : prev + 1));
    }, 10000);
    return () => clearInterval(timer);
  }, [picks.length]);

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

  return (
    <div className="w-full">

      {/* ── Hero Slider ──────────────────────────────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center p-0">
        <div className="absolute inset-0 z-0">
          <img
            src={bgImage}
            alt="Background"
            className="w-full h-full object-cover grayscale opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]" />
        </div>

        <div className="relative z-10 w-full px-[var(--section-px)] text-center">
          <h1 className="uppercase font-[var(--style-font)] text-white tracking-tighter leading-[0.9] text-[2rem] sm:text-[3rem] md:text-[4rem] lg:text-[6rem]">
            {slides[currentSlide].title}
          </h1>
          <p className="font-black uppercase mt-4 tracking-[0.3em] sm:tracking-[0.5em] md:tracking-[0.8em] text-[0.6rem] sm:text-xs md:text-sm">
            {slides[currentSlide].subtitle}
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0 p-0 border-0 transition-all duration-300 ${
                currentSlide === index
                  ? "bg-white scale-125"
                  : "bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── Posts & Sidebar ──────────────────────────────────────────────── */}
      <section className="w-full bg-[var(--bg-primary)] py-[100px]">
        <div className="w-full px-[var(--section-px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

            {/* Latest Articles */}
            <div className="lg:col-span-2 flex flex-col gap-14 bg-[var(--bg-secondary)] p-6 sm:p-8 lg:p-10">
              <h3 className="text-sm md:text-md font-[var(--style-font)] uppercase tracking-tight bg-[var(--main)] inline-block px-4 py-2 w-fit">
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
            <div className="flex lg:col-span-1 flex-col gap-8 h-fit">

              {/* Trending */}
              <div className="flex flex-col gap-10 bg-[var(--bg-secondary)] p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col gap-5">
                  <h3 className="text-sm md:text-md font-[var(--style-font)] uppercase tracking-tight bg-[var(--main)] inline-block px-4 py-2 w-fit">
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

                {loadingTrends ? (
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

                {!loadingTrends && filteredTrends.length > TRENDS_PER_PAGE && (
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

              {/* PJ's Pick */}
              <div className="flex flex-col gap-6 bg-[var(--bg-secondary)] p-6 sm:p-8 lg:p-10">
                <h3 className="text-sm md:text-md font-[var(--style-font)] uppercase tracking-tight bg-[var(--main)] inline-block px-4 py-2 w-fit">
                  PJ's Pick
                </h3>

                {loadingPicks ? (
                  <p className="text-white/20 animate-pulse uppercase tracking-widest text-xs">
                    Receiving Signal...
                  </p>
                ) : picks.length === 0 ? (
                  <p className="text-white/20 italic text-xs uppercase tracking-widest">
                    No picks yet.
                  </p>
                ) : (
                  <>
                    <Picks {...picks[currentPick]} />

                    {picks.length > 1 && (
                      <div className="flex gap-2 pt-1">
                        {picks.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPick(index)}
                            aria-label={`Pick ${index + 1}`}
                            className={`h-[3px] flex-1 transition-all duration-300 ${
                              currentPick === index
                                ? "bg-[var(--main)]"
                                : "bg-white/15 hover:bg-white/30"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter Signup ─────────────────────────────────────────────── */}
      <section className="w-full bg-[var(--bg-secondary)] py-20">
        <div className="w-full px-[var(--section-px)] max-w-3xl mx-auto text-center">
          <span className="text-[var(--main)] text-[10px] uppercase tracking-[0.4em] font-black">
            Stay Connected
          </span>
          <h2 className="font-[var(--style-font)] text-white tracking-tighter text-[2rem] sm:text-[3rem] leading-tight mt-3 mb-4">
            JOIN THE COMMUNITY
          </h2>
          <p className="text-white/40 text-sm tracking-wide mb-10">
            Be the first to hear about new sessions, events and exclusive content.
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

      {/* ── Social Media Feed Placeholders ───────────────────────────────── */}
      <section className="w-full bg-[var(--bg-primary)] py-20">
        <div className="w-full px-[var(--section-px)]">
          <div className="text-center mb-12">
            <span className="text-[var(--main)] text-[10px] uppercase tracking-[0.4em] font-black">
              Social
            </span>
            <h2 className="font-[var(--style-font)] text-white tracking-tighter text-[2rem] sm:text-[3rem] leading-tight mt-3">
              FOLLOW THE SIGNAL
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Twitter / X */}
            <div className="bg-[var(--bg-secondary)] border border-white/5 p-8 flex flex-col gap-6 min-h-[400px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-white/60">
                  <XIcon size={18} />
                </div>
                <div>
                  <p className="text-white text-sm font-bold uppercase tracking-widest">
                    Twitter / X
                  </p>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest">
                    @offair
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-white/5 pb-4 last:border-0">
                    <div className="h-3 bg-white/5 rounded w-full mb-2" />
                    <div className="h-3 bg-white/5 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-white/[0.03] rounded w-1/3" />
                  </div>
                ))}
              </div>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--main)] text-xs uppercase tracking-widest font-black hover:text-white transition-colors"
              >
                Follow us on X →
              </a>
            </div>

            {/* Instagram */}
            <div className="bg-[var(--bg-secondary)] border border-white/5 p-8 flex flex-col gap-6 min-h-[400px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-white/60">
                  <InstagramIcon size={18} />
                </div>
                <div>
                  <p className="text-white text-sm font-bold uppercase tracking-widest">
                    Instagram
                  </p>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest">
                    @offair
                  </p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-white/5 rounded" />
                ))}
              </div>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--main)] text-xs uppercase tracking-widest font-black hover:text-white transition-colors"
              >
                Follow us on Instagram →
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
