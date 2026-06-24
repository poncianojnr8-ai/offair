import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type Interview = {
  id: string;
  title: string;
  guest?: string;
  category?: string;
  image: string;
  date?: string;
  views?: number;
  isFeatured?: boolean;
};

const PER_PAGE = 9;

// ─── Component ────────────────────────────────────────────────────────────────

const Interviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const q = query(
          collection(db, "interviews"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Interview[];
        setInterviews(data);
      } catch (err) {
        console.error("Error fetching interviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // Featured first, fall back to most recent
  const featured =
    interviews.find((i) => i.isFeatured) ?? interviews[0] ?? null;
  const rest = interviews.filter((i) => i.id !== featured?.id);

  // Category filter tabs derived from the interviews themselves
  const categoryTabs = [
    "All",
    ...Array.from(
      new Set(rest.map((i) => i.category).filter((c): c is string => !!c))
    ),
  ];

  const filteredRest =
    activeCategory === "All"
      ? rest
      : rest.filter((i) => i.category === activeCategory);
  const visibleRest = filteredRest.slice(0, visibleCount);

  const selectCategory = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(PER_PAGE);
  };

  return (
    <div className="w-full bg-(--bg-primary)">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <section className="w-full pt-28 pb-8 sm:pt-36 sm:pb-12 px-(--section-px)">
        <span className="text-(--main) text-[10px] uppercase tracking-[0.4em] font-black">
          Off Air
        </span>
        <h1 className="font-(--style-font) text-white leading-[0.7] text-3xl sm:text-4xl md:text-5xl lg:text-3xl font-bold pt-4">
          Interviews
        </h1>
        <p className="text-white/40 text-sm mt-4 max-w-xl tracking-wide leading-relaxed">
          Conversations with the artists, creators and voices behind the
          culture — unfiltered and off the record.
        </p>
      </section>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <section className="w-full px-(--section-px) flex items-center justify-center py-32">
          <Loader2 className="text-white/20 animate-spin" size={32} />
        </section>
      )}

      {/* ── Empty ───────────────────────────────────────────────────────── */}
      {!loading && interviews.length === 0 && (
        <section className="w-full px-(--section-px) pb-20">
          <div className="flex items-center justify-center py-24">
            <p className="text-white/20 uppercase tracking-widest text-xs">
              No interviews yet. Check back soon.
            </p>
          </div>
        </section>
      )}

      {/* ── Featured Interview ──────────────────────────────────────────── */}
      {!loading && featured && (
        <section className="w-full px-(--section-px) pb-14 sm:pb-20">
          <Link
            to={`/interviews/${featured.id}`}
            className="group block no-underline"
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 bg-(--bg-secondary) overflow-hidden border border-white/5">
              {/* Image */}
              <div className="lg:col-span-3 relative aspect-video lg:aspect-auto bg-black overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
              </div>

              {/* Info panel */}
              <div className="lg:col-span-2 flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
                <span className="text-[9px] font-black uppercase tracking-widest bg-(--main) text-white px-3 py-1 w-fit">
                  Featured Interview
                </span>

                <div>
                  <h2 className="font-(--style-font) text-white tracking-tighter leading-[0.95] text-[1.6rem] sm:text-[2rem] lg:text-[2.2rem]">
                    {featured.title}
                  </h2>
                  {featured.guest && (
                    <p className="text-(--main) text-[10px] uppercase tracking-[0.3em] font-black mt-3">
                      {featured.guest}
                    </p>
                  )}
                </div>

                <span className="flex items-center gap-2 bg-(--main) text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 w-fit group-hover:bg-(--main-dark) transition-all">
                  Read Interview
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Interview Grid ──────────────────────────────────────────────── */}
      {!loading && rest.length > 0 && (
        <section className="w-full px-(--section-px) pb-16 sm:pb-24">
          {/* Heading + category filter */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="font-(--style-font) text-white tracking-tighter text-2xl sm:text-3xl">
              INTERVIEWS
            </h2>
            {categoryTabs.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                {categoryTabs.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => selectCategory(cat)}
                    className={`shrink-0 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                      activeCategory === cat
                        ? "bg-(--main) text-white"
                        : "bg-(--bg-secondary) text-white/50 hover:text-white border border-white/10 hover:border-white/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {visibleRest.map((interview) => (
              <Link
                key={interview.id}
                to={`/interviews/${interview.id}`}
                className="bg-(--bg-secondary) group no-underline"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={interview.image}
                    alt={interview.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
                  <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest bg-black/70 text-white px-2 py-1">
                    Interview
                  </span>
                  {interview.category && (
                    <span className="absolute bottom-3 right-3 text-[9px] font-black uppercase tracking-widest bg-(--main) text-white px-2 py-1">
                      {interview.category}
                    </span>
                  )}
                </div>

                <div className="p-4 sm:p-5 border-t border-white/5">
                  {interview.guest && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-(--main)">
                      {interview.guest}
                    </span>
                  )}
                  <h3 className="text-white font-bold text-sm leading-tight mt-1 group-hover:text-(--main) transition-colors duration-200">
                    {interview.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3 text-[9px] uppercase tracking-widest text-white/25">
                    <span>{interview.date}</span>
                    <span>{(interview.views ?? 0).toLocaleString()} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {visibleCount < filteredRest.length && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount((c) => c + PER_PAGE)}
                className="bg-(--main) text-white font-black uppercase tracking-widest text-[10px] px-10 py-4 hover:bg-(--main-dark) transition-all active:scale-95"
              >
                Load More
              </button>
            </div>
          )}

          {filteredRest.length === 0 && (
            <p className="text-white/20 uppercase tracking-widest text-xs text-center py-16">
              No interviews in this category yet.
            </p>
          )}
        </section>
      )}

      {/* ── Submit CTA ──────────────────────────────────────────────────── */}
      {!loading && (
        <section className="w-full px-(--section-px) pb-20 sm:pb-28">
          <div className="relative bg-(--bg-secondary) border border-white/5 p-8 sm:p-12 overflow-hidden">
            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-(--style-font) text-[6rem] sm:text-[10rem] text-white/[0.02] leading-none select-none pointer-events-none">
              TALK
            </span>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="text-(--main) text-[10px] uppercase tracking-[0.4em] font-black">
                  Got a story?
                </span>
                <h3 className="font-(--style-font) text-white tracking-tighter leading-[0.95] text-[1.8rem] sm:text-[2.4rem] mt-2">
                  SIT DOWN WITH US
                </h3>
                <p className="text-white/40 text-sm mt-3 max-w-md leading-relaxed">
                  Want to be interviewed or know someone we should talk to? Reach
                  out and let's set it up.
                </p>
              </div>

              <Link
                to="/contact"
                className="shrink-0 bg-(--main) text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 hover:bg-(--main-dark) transition-all no-underline hover:text-white"
              >
                Get In Touch →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Interviews;
