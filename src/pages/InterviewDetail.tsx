import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { Link2, Check } from "lucide-react";

// Inline social share icons
const XShareIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface InterviewData {
  id: string;
  title: string;
  guest?: string;
  author?: string;
  category?: string;
  date?: string;
  image: string;
  body?: string;
  views?: number;
}

type RelatedItem = {
  id: string;
  title: string;
  image: string;
  category?: string;
  date?: string;
};

const InterviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<InterviewData | null>(null);
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const pageUrl = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("input");
      el.value = pageUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      try {
        const docRef = doc(db, "interviews", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as InterviewData;
          setItem(data);

          // Count the view (fire and forget)
          updateDoc(docRef, { views: increment(1) }).catch(() => {});

          // Related: other interviews, same category first, then recent
          try {
            const snap = await getDocs(
              query(collection(db, "interviews"), orderBy("createdAt", "desc"))
            );
            const others = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }) as RelatedItem & {
                category?: string;
              })
              .filter((r) => r.id !== docSnap.id);
            const sameCat = others.filter(
              (r) => data.category && r.category === data.category
            );
            const rest = others.filter(
              (r) => !(data.category && r.category === data.category)
            );
            setRelated([...sameCat, ...rest].slice(0, 4));
          } catch (relErr) {
            console.error("Error fetching related interviews:", relErr);
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <p className="text-white/20 animate-pulse uppercase tracking-widest text-sm">
          Receiving Signal...
        </p>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-6">
        <p className="text-white/40 uppercase tracking-widest text-sm">
          Interview not found.
        </p>
        <Link
          to="/interviews"
          className="text-[var(--main)] uppercase tracking-widest text-xs font-black hover:text-white transition-colors"
        >
          ← Back to Interviews
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--bg-primary)]">
      {/* Hero Image */}
      <div className="relative w-full h-[40vh] sm:h-[55vh] md:h-[75vh] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="w-full px-[var(--section-px)] py-8 sm:py-12 md:py-16 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
        {/* Main column */}
        <div className="lg:col-span-2 min-w-0">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-5 sm:mb-6 text-xs uppercase tracking-[0.25em]">
          <span className="bg-[var(--main)] text-white px-3 py-1 font-black">
            Interview
          </span>
          {item.category && (
            <span className="text-white/60">{item.category}</span>
          )}
          {item.guest && <span className="text-white/60">{item.guest}</span>}
          {item.author && (
            <span className="text-white/40">By {item.author}</span>
          )}
          {item.date && <span className="text-white/40">{item.date}</span>}
          {typeof item.views === "number" && (
            <span className="text-white/40">
              {item.views.toLocaleString()} views
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-[var(--style-font)] text-white tracking-tighter leading-[0.95] text-[1.6rem] sm:text-[2.5rem] md:text-[4rem] mb-8 sm:mb-12">
          {item.title}
        </h1>

        {/* Divider */}
        <div className="w-16 h-[2px] bg-[var(--main)] mb-12" />

        {/* Body */}
        {item.body ? (
          <div
            className="prose-content text-white/75 leading-relaxed text-base md:text-lg"
            dangerouslySetInnerHTML={{ __html: item.body }}
          />
        ) : (
          <p className="text-white/30 italic tracking-widest text-sm uppercase">
            No content available for this interview.
          </p>
        )}

        {/* Share */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold mb-5">
            Share this interview
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(item.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all text-xs uppercase tracking-widest font-bold"
            >
              <XShareIcon />
              X
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(item.title + " " + pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all text-xs uppercase tracking-widest font-bold"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 border transition-all text-xs uppercase tracking-widest font-bold ${
                copied
                  ? "bg-[var(--main)]/10 border-[var(--main)] text-[var(--main)]"
                  : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white/60 hover:text-white"
              }`}
            >
              {copied ? <Check size={14} /> : <Link2 size={14} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link
            to="/interviews"
            className="text-[var(--main)] text-xs uppercase tracking-widest font-black hover:text-white transition-colors"
          >
            ← Back to Interviews
          </Link>
        </div>
        </div>

        {/* Related sidebar */}
        {related.length > 0 && (
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-5">
                Related
              </h3>
              <div className="flex flex-col gap-4">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/interviews/${r.id}`}
                    className="group flex gap-4 no-underline"
                  >
                    <div className="w-24 h-16 shrink-0 overflow-hidden bg-black">
                      <img
                        src={r.image}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0">
                      {r.category && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--main)]">
                          {r.category}
                        </span>
                      )}
                      <p className="text-white/80 text-xs font-bold leading-tight line-clamp-2 group-hover:text-white transition-colors">
                        {r.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default InterviewDetail;
