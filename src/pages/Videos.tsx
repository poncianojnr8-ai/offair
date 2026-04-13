import { useState } from "react";
import { Play, Eye, Clock } from "lucide-react";
import { Link } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

type Video = {
  id: string;
  title: string;
  artist: string;
  category: string;
  duration: string;
  views: string;
  embedId: string;
  isNew?: boolean;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const categories = [
  "All",
  "Music Videos",
  "Sessions",
  "Behind The Scenes",
  "Freestyles",
  "Interviews",
];

const featured = {
  title: "Late Night Sessions Vol. 1",
  artist: "Off Air Original",
  description:
    "Raw. Unfiltered. Real. Our late night sessions capture the energy of underground music at its finest — no overdubs, no edits, just pure sound and atmosphere.",
  category: "Sessions",
  duration: "8:24",
  embedId: "ScMzIvxBSi4",
};

const videos: Video[] = [
  {
    id: "1",
    title: "Unfiltered: London Underground",
    artist: "Various Artists",
    category: "Behind The Scenes",
    duration: "5:11",
    views: "8.7K",
    embedId: "tgbNymZ7vqY",
    isNew: true,
  },
  {
    id: "2",
    title: "Blood & Vinyl",
    artist: "Late Night Sessions",
    category: "Sessions",
    duration: "12:03",
    views: "21.2K",
    embedId: "5qap5aO4i9A",
  },
  {
    id: "3",
    title: "No Cameras: Pure Sound",
    artist: "Off Air",
    category: "Sessions",
    duration: "6:48",
    views: "14.5K",
    embedId: "ScMzIvxBSi4",
  },
  {
    id: "4",
    title: "Rooftop Recordings: London",
    artist: "Various Artists",
    category: "Music Videos",
    duration: "4:22",
    views: "32.1K",
    embedId: "tgbNymZ7vqY",
    isNew: true,
  },
  {
    id: "5",
    title: "Underground Sessions Vol. 2",
    artist: "Off Air",
    category: "Sessions",
    duration: "9:55",
    views: "6.3K",
    embedId: "5qap5aO4i9A",
  },
  {
    id: "6",
    title: "Studio Access: Behind Closed Doors",
    artist: "Off Air",
    category: "Behind The Scenes",
    duration: "3:30",
    views: "18.9K",
    embedId: "ScMzIvxBSi4",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Videos = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [featuredPlaying, setFeaturedPlaying] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const filtered =
    activeCategory === "All"
      ? videos
      : videos.filter((v) => v.category === activeCategory);

  return (
    <div className="w-full bg-(--bg-primary)">

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <section className="w-full pt-28 pb-8 sm:pt-36 sm:pb-12 px-(--section-px)">
        <span className="text-(--main) text-[10px] uppercase tracking-[0.4em] font-black">
          Off Air
        </span>
        <h1 className="font-(--style-font) text-white leading-[0.7] text-3xl sm:text-4xl md:text-5xl lg:text-3xl font-bold pt-4">
          Videos
        </h1>
        <p className="text-white/40 text-sm mt-4 max-w-xl tracking-wide leading-relaxed">
          Watch the latest sessions, music videos, behind-the-scenes content and
          exclusive footage from the Off Air universe.
        </p>
      </section>

      {/* ── Featured Video ──────────────────────────────────────────────── */}
      <section className="w-full px-(--section-px) pb-14 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 bg-(--bg-secondary) overflow-hidden border border-white/5">

          {/* Player */}
          <div className="lg:col-span-3 relative aspect-video bg-black">
            {featuredPlaying ? (
              <iframe
                className="w-full h-full border-0"
                src={`https://www.youtube.com/embed/${featured.embedId}?autoplay=1`}
                title={featured.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={`https://img.youtube.com/vi/${featured.embedId}/maxresdefault.jpg`}
                  alt={featured.title}
                  className="w-full h-full object-cover grayscale opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

                {/* Play button */}
                <button
                  onClick={() => setFeaturedPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Play featured video"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-(--main) flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_50px_rgba(222,44,44,0.4)]">
                    <Play size={26} fill="white" className="text-white ml-1" />
                  </div>
                </button>

                {/* Duration badge */}
                <span className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 tracking-wider">
                  {featured.duration}
                </span>
              </>
            )}
          </div>

          {/* Info panel */}
          <div className="lg:col-span-2 flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-widest bg-(--main) text-white px-3 py-1">
                Featured
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 border border-white/10 px-3 py-1">
                {featured.category}
              </span>
            </div>

            <div>
              <h2 className="font-(--style-font) text-white tracking-tighter leading-[0.95] text-[1.6rem] sm:text-[2rem] lg:text-[2.2rem]">
                {featured.title}
              </h2>
              <p className="text-(--main) text-[10px] uppercase tracking-[0.3em] font-black mt-3">
                {featured.artist}
              </p>
            </div>

            <p className="text-white/50 text-sm leading-relaxed">
              {featured.description}
            </p>

            <div className="flex items-center gap-4 text-white/25 text-[10px] uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Clock size={11} />
                {featured.duration}
              </span>
            </div>

            {!featuredPlaying && (
              <button
                onClick={() => setFeaturedPlaying(true)}
                className="flex items-center gap-2.5 bg-(--main) text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 w-fit hover:bg-(--main-dark) transition-all"
              >
                <Play size={13} fill="white" />
                Watch Now
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Category Filter ─────────────────────────────────────────────── */}
      <section className="w-full px-(--section-px) mb-8 sm:mb-10">
        <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 w-max sm:w-auto sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveVideo(null);
                }}
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
        </div>
      </section>

      {/* ── Video Grid ──────────────────────────────────────────────────── */}
      <section className="w-full px-(--section-px) pb-16 sm:pb-24">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-white/20 uppercase tracking-widest text-xs">
              No videos in this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {filtered.map((video) => (
              <div
                key={video.id}
                className="bg-(--bg-secondary) group cursor-pointer"
                onClick={() =>
                  setActiveVideo(activeVideo === video.id ? null : video.id)
                }
              >
                {/* Player or thumbnail */}
                {activeVideo === video.id ? (
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full border-0"
                      src={`https://www.youtube.com/embed/${video.embedId}?autoplay=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${video.embedId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/25 transition-all duration-300" />

                    {/* Hover play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-(--main) flex items-center justify-center shadow-[0_0_30px_rgba(222,44,44,0.5)]">
                        <Play size={17} fill="white" className="text-white ml-0.5" />
                      </div>
                    </div>

                    {/* Duration */}
                    <span className="absolute bottom-3 right-3 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 tracking-wider">
                      {video.duration}
                    </span>

                    {/* New badge */}
                    {video.isNew && (
                      <span className="absolute top-3 left-3 bg-(--main) text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                        New
                      </span>
                    )}
                  </div>
                )}

                {/* Card info */}
                <div className="p-4 sm:p-5 border-t border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-(--main)">
                    {video.category}
                  </span>
                  <h3 className="text-white font-bold text-sm leading-tight mt-1 group-hover:text-(--main) transition-colors duration-200">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3 text-white/25 text-[9px] uppercase tracking-widest">
                    <span>{video.artist}</span>
                    <span className="flex items-center gap-1">
                      <Eye size={9} />
                      {video.views}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Submit CTA ──────────────────────────────────────────────────── */}
      <section className="w-full px-(--section-px) pb-20 sm:pb-28">
        <div className="relative bg-(--bg-secondary) border border-white/5 p-8 sm:p-12 overflow-hidden">
          {/* Decorative background text */}
          <span className="absolute right-6 top-1/2 -translate-y-1/2 font-(--style-font) text-[6rem] sm:text-[10rem] text-white/[0.02] leading-none select-none pointer-events-none">
            SUBMIT
          </span>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-(--main) text-[10px] uppercase tracking-[0.4em] font-black">
                Want to be featured?
              </span>
              <h3 className="font-(--style-font) text-white tracking-tighter leading-[0.95] text-[1.8rem] sm:text-[2.4rem] mt-2">
                SUBMIT YOUR VIDEO
              </h3>
              <p className="text-white/40 text-sm mt-3 max-w-md leading-relaxed">
                Got a music video, freestyle or session you want the world to
                see? Send us the link and let's talk.
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

    </div>
  );
};

export default Videos;
