import { useEffect, useMemo, useState } from "react";
import Trending from "../components/News/Trending";
import postImg from "../assets/images/main-bg.png";
import { Search } from "lucide-react";

type TrendingData = {
  title: string;
  rank: number;
  image: string;
};

const trends: TrendingData[] = [
  { title: "Blood & Vinyl: Late Night Sessions", rank: 1, image: postImg },
  { title: "Unfiltered Noise: London Underground", rank: 2, image: postImg },
  { title: "Welcome To Off Air: The Pelicans", rank: 3, image: postImg },
  { title: "No Cameras: Pure Sound", rank: 4, image: postImg },
  { title: "Rooftop Recordings: London", rank: 5, image: postImg },
  { title: "Underground Sessions Vol. 2", rank: 6, image: postImg },
];

const About = () => {
  const TRENDS_PER_PAGE = 3;
  const [trendPage, setTrendPage] = useState(1);
  const [trendSearch, setTrendSearch] = useState("");
  const filteredTrends = useMemo(() => {
    const q = trendSearch.trim().toLowerCase();
    if (!q) return trends;
    return trends.filter((t) => t.title.toLowerCase().includes(q));
  }, [trendSearch]);

  const totalTrendPages = Math.max(
    1,
    Math.ceil(filteredTrends.length / TRENDS_PER_PAGE),
  );

  const pagedTrends = useMemo(() => {
    const start = (trendPage - 1) * TRENDS_PER_PAGE;
    return filteredTrends.slice(start, start + TRENDS_PER_PAGE);
  }, [filteredTrends, trendPage]);

  useEffect(() => {
    setTrendPage(1);
  }, [trendSearch]);

  return (
    <div className="w-full">
      <section className="w-full bg-[var(--bg-primary)] py-20 sm:py-28 lg:py-37.5">
        <div className="w-full px-[var(--section-px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2 bg-[var(--bg-secondary)] p-5 sm:p-8 lg:p-10">
              <div className="mb-10">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                  About Us
                </h1>
                <div className="mt-4 w-full h-[1px] bg-[var(--main)]" />
              </div>

              <div className="space-y-6 text-white/70 text-base md:text-lg leading-relaxed">
                <p>
                  Off Air is a raw and unfiltered platform built to spotlight
                  artists, stories, and sounds that don’t always get the
                  mainstream stage. We focus on authenticity, underground
                  culture, and real creative energy.
                </p>

                <p>
                  From late-night studio sessions to intimate live recordings,
                  our goal is to capture the moments that happen when the
                  cameras are off and the noise is real. No filters, no
                  distractions — just pure atmosphere and honest sound.
                </p>

                <p>
                  We’re here for the music lovers, the creators, and the ones
                  who live for the culture. Off Air isn’t just content — it’s a
                  movement built from passion, community, and creative freedom.
                </p>

                <p>
                  Off Air is a raw and unfiltered platform built to spotlight
                  artists, stories, and sounds that don’t always get the
                  mainstream stage. We focus on authenticity, underground
                  culture, and real creative energy.
                </p>

                <p>
                  From late-night studio sessions to intimate live recordings,
                  our goal is to capture the moments that happen when the
                  cameras are off and the noise is real. No filters, no
                  distractions — just pure atmosphere and honest sound.
                </p>

                <p>
                  We’re here for the music lovers, the creators, and the ones
                  who live for the culture. Off Air isn’t just content — it’s a
                  movement built from passion, community, and creative freedom.
                </p>
              </div>

              <div className="mt-12 border border-white/10 bg-black/20 p-6">
                <p className="text-white/80 text-base md:text-lg leading-relaxed">
                  Want to collaborate, feature your work, or share your story?
                  Drop us a message and let’s build something unforgettable.
                </p>

                <a
                  href="/contact"
                  className="inline-block mt-5 !text-[var(--main)] font-bold tracking-widest hover:text-white transition-all duration-300"
                >
                  Contact Us →
                </a>
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-1 flex-col gap-10 bg-[var(--bg-secondary)] p-5 sm:p-8 lg:p-10 h-fit">
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
                    className="w-full bg-black/30 border border-white/10 text-white placeholder:text-white/30
                               pl-12 pr-4 py-3 outline-none focus:border-[var(--main)] transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {pagedTrends.map((trend) => (
                  <Trending key={trend.rank} {...trend} />
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-white/50 text-xs uppercase tracking-[0.25em]">
                  Page {trendPage} / {totalTrendPages}
                </p>

                <button
                  onClick={() =>
                    setTrendPage((prev) =>
                      prev >= totalTrendPages ? 1 : prev + 1,
                    )
                  }
                  className="text-white font-black uppercase tracking-widest text-sm hover:text-[var(--main)] transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
