import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink } from "lucide-react";

export type SocialPost = {
  id: string;
  platform: "tiktok" | "instagram";
  image: string;
  caption?: string;
  link: string;
};

interface Props {
  post: SocialPost | null;
  onClose: () => void;
}

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.7a2.4 2.4 0 0 1-2.54 2.4 2.4 2.4 0 0 1-2.54-2.4 2.4 2.4 0 0 1 2.54-2.4c.09 0 .18 0 .27.02V9.49c-.17-.02-.34-.02-.5-.02A5.7 5.7 0 0 0 1 15.38a5.7 5.7 0 0 0 5.7 5.7 5.7 5.7 0 0 0 5.7-5.7V9.93a7.38 7.38 0 0 0 4.58 1.62V8.17a4.83 4.83 0 0 1-3.39-1.48z" />
  </svg>
);

const IgIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

function parseTikTokVideoId(url: string): string | null {
  const m = url.match(/video\/(\d+)/);
  return m ? m[1] : null;
}

function parseInstagramShortcode(url: string): string | null {
  const m = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[2] : null;
}

function reloadScript(id: string, src: string) {
  document.getElementById(id)?.remove();
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  document.body.appendChild(s);
}

export default function SocialEmbedModal({ post, onClose }: Props) {
  // Load / re-trigger the platform embed script each time a post opens
  useEffect(() => {
    if (!post) return;
    if (post.platform === "tiktok") {
      reloadScript("tiktok-embed-js", "https://www.tiktok.com/embed.js");
    } else {
      const w = window as any;
      if (w.instgrm) {
        w.instgrm.Embeds.process();
      } else {
        reloadScript("instagram-embed-js", "https://www.instagram.com/embed.js");
      }
    }
  }, [post]);

  useEffect(() => {
    if (!post) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [post, onClose]);

  if (!post) return null;

  const tiktokId = post.platform === "tiktok" ? parseTikTokVideoId(post.link) : null;
  const igCode   = post.platform === "instagram" ? parseInstagramShortcode(post.link) : null;
  const canEmbed = Boolean(tiktokId || igCode);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm max-h-[90vh] flex flex-col bg-[var(--bg-secondary)] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-white/50">
            {post.platform === "tiktok" ? <TikTokIcon size={13} /> : <IgIcon size={13} />}
            <span className="text-[10px] uppercase tracking-[0.2em]">{post.platform}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors"
              title={`Open on ${post.platform}`}
            >
              <ExternalLink size={13} />
            </a>
            <button type="button" onClick={onClose} className="text-white/30 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Embed */}
        <div className="overflow-y-auto flex justify-center">
          {canEmbed ? (
            <>
              {tiktokId && (
                <blockquote
                  className="tiktok-embed"
                  cite={post.link}
                  data-video-id={tiktokId}
                  style={{ maxWidth: "100%", minWidth: "280px" }}
                >
                  <section />
                </blockquote>
              )}
              {igCode && (
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={`https://www.instagram.com/p/${igCode}/`}
                  data-instgrm-version="14"
                  style={{ maxWidth: "100%", minWidth: "280px" }}
                />
              )}
            </>
          ) : (
            <div className="p-6 text-center">
              <img src={post.image} alt={post.caption} className="w-full object-cover mb-4" />
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--main)] text-[10px] uppercase tracking-widest"
              >
                View on {post.platform} →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
