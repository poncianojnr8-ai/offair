type TrendingProps = {
  title: string;
  rank: number;
  image: string;
};

const Trending = ({ title, rank, image }: TrendingProps) => {
  return (
    <article className="w-full">
      <div className="relative w-full overflow-hidden rounded-lg">
        <img
          src={image}
          alt={title}
          className="w-full h-[220px] object-cover"
        />

        {/* Dark gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Rank Top Right */}
        <div className="absolute top-4 right-4 px-3 py-1 text-sm font-black tracking-widest uppercase bg-black/60 text-[var(--main)]">
          #{rank}
        </div>

        {/* Title Bottom */}
        <h3 className="absolute bottom-4 left-4 right-4 text-white font-bold uppercase tracking-tight text-lg leading-tight">
          {title}
        </h3>

        {/* Red underline (80% centered) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-[var(--main)]" />
      </div>
    </article>
  );
};

export default Trending;
