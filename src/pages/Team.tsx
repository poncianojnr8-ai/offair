import { useEffect, useMemo, useState } from "react";
import Trending from "../components/News/Trending";
import postImg from "../assets/images/main-bg.jpg";
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

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image: string;
};

const team: TeamMember[] = [
  {
    name: "Ponciano",
    role: "Founder / Host",
    bio: "Leading Off Air with raw interviews, late-night sessions and underground energy.",
    image: postImg,
  },
  {
    name: "Creative Director",
    role: "Visuals & Branding",
    bio: "Responsible for the Off Air identity, direction, and overall visual experience.",
    image: postImg,
  },
  {
    name: "Producer",
    role: "Audio / Sessions",
    bio: "Capturing the sound exactly as it is — unfiltered, live, and authentic.",
    image: postImg,
  },
];

const Team = () => {
  const TRENDS_PER_PAGE = 5;
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
      <section className="w-full bg-[var(--bg-primary)] py-[100px]">
        <div className="w-full px-[var(--section-px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* LEFT: TEAM (2/3) */}
            <div className="lg:col-span-2 bg-[var(--bg-secondary)] p-10 flex flex-col gap-10">
              <div>
                <h3 className="text-sm md:text-md font-[var(--style-font)] uppercase tracking-tight bg-[var(--main)] inline-block px-4 py-2">
                  Meet The Team
                </h3>

                <p className="mt-6 text-white/70 text-base md:text-lg leading-relaxed max-w-2xl">
                  Off Air is powered by creatives who live for culture, sound,
                  and storytelling. Here’s the team behind the sessions.
                </p>
              </div>

              {/* Team Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {team.map((member) => (
                  <div
                    key={member.name}
                    className="border border-white/10 bg-black/20 overflow-hidden rounded-lg"
                  >
                    <div className="relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-[260px] object-cover"
                      />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-[var(--main)]" />
                    </div>

                    <div className="p-6">
                      <h4 className="text-white font-black uppercase tracking-tight text-xl">
                        {member.name}
                      </h4>

                      <p className="text-[var(--main)] font-black uppercase tracking-widest text-xs mt-2">
                        {member.role}
                      </p>

                      <p className="text-white/70 mt-4 leading-relaxed">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: TRENDING (1/3) */}
            <div className="hidden lg:flex lg:col-span-1 flex-col gap-10 bg-[var(--bg-secondary)] p-10 h-fit">
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

export default Team;
