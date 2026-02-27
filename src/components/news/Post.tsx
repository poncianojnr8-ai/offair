import { Link } from "react-router-dom";

type PostProps = {
  id?: string;
  title: string;
  category: string;
  date: string;
  image: string;
};

const Post = ({ id, title, category, date, image }: PostProps) => {
  const card = (
    <article className="w-full group">
      <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-[0.25em]">
        <span className="text-white/70">{category}</span>
        <span className="text-white/50">{date}</span>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg">
        <img
          src={image}
          alt={title}
          className="w-full h-[320px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

        <h1 className="absolute bottom-10 left-5 right-5 text-gray-300 group-hover:text-white transition-colors font-[600] tracking-tight leading-tight text-[1.6rem] md:text-[2rem] 2xl:text-[3.2rem]">
          {title}
        </h1>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-[var(--main)]" />
      </div>
    </article>
  );

  if (id) {
    return (
      <Link to={`/posts/${id}`} className="block no-underline hover:no-underline">
        {card}
      </Link>
    );
  }

  return card;
};

export default Post;
