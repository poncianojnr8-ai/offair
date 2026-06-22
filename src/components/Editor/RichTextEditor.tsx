import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import Table from "@tiptap/extension-table";
import { Youtube } from "@tiptap/extension-youtube";
import { Placeholder, CharacterCount } from "@tiptap/extensions";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Code as EmbedIcon,
  Table as TableIcon,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import { Iframe } from "./Iframe";
import { toEmbedUrl, youtubeId } from "./embedUrl";

interface RichTextEditorProps {
  /** Current HTML value (controlled). */
  value: string;
  /** Called with the new HTML on every edit. */
  onChange: (html: string) => void;
  /** Uploads a file and resolves to its public URL. */
  uploadImage: (file: File) => Promise<string>;
  placeholder?: string;
}

const Divider = () => <div className="w-px h-5 bg-white/10 mx-1" />;

const Btn = ({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
      active
        ? "bg-[var(--main)] text-white"
        : "text-white/50 hover:text-white hover:bg-white/10"
    }`}
  >
    {children}
  </button>
);

const RichTextEditor = ({
  value,
  onChange,
  uploadImage,
  placeholder = "Start writing your story...",
}: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ table: { resizable: true } }),
      Youtube.configure({
        nocookie: true,
        HTMLAttributes: { class: "embed-youtube" },
      }),
      Iframe,
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value,
    editorProps: {
      attributes: { class: "focus:outline-none min-h-[320px] p-4" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value changes (e.g. async load in edit mode) without
  // clobbering the cursor while the user is typing.
  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return; // cancelled
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("YouTube video URL");
    if (!url) return;
    if (!youtubeId(url)) {
      alert("That doesn't look like a valid YouTube URL.");
      return;
    }
    editor.commands.setYoutubeVideo({ src: url.trim() });
  }, [editor]);

  const addEmbed = useCallback(() => {
    if (!editor) return;
    const url = window.prompt(
      "Embed URL (Spotify, Vimeo, SoundCloud, Google Maps, or any embed link)"
    );
    if (!url) return;
    const src = toEmbedUrl(url) ?? url.trim();
    editor.chain().focus().setIframe({ src }).run();
  }, [editor]);

  const onPickImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !editor) return;
      setUploading(true);
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [editor, uploadImage]
  );

  if (!editor) {
    return (
      <div className="border border-white/10 bg-[var(--bg-secondary)] min-h-[320px] flex items-center justify-center">
        <Loader2 className="animate-spin text-white/20" size={20} />
      </div>
    );
  }

  return (
    <div className="border border-white/10 bg-[var(--bg-secondary)] focus-within:border-[var(--main)] transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-white/10 sticky top-0 z-10 bg-[var(--bg-secondary)]">
        <Btn
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 size={15} />
        </Btn>
        <Btn
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 size={15} />
        </Btn>
        <Divider />

        <Btn
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={15} />
        </Btn>
        <Btn
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={15} />
        </Btn>
        <Btn
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <UnderlineIcon size={15} />
        </Btn>
        <Btn
          title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <Strikethrough size={15} />
        </Btn>
        <Btn
          title="Highlight"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
        >
          <Highlighter size={15} />
        </Btn>
        <label
          title="Text colour"
          className="p-2 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center"
        >
          <span
            className="w-[15px] h-[15px] rounded-full border border-white/30"
            style={{
              background:
                (editor.getAttributes("textStyle").color as string) ||
                "#ffffff",
            }}
          />
          <input
            type="color"
            className="sr-only"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </label>
        <Divider />

        <Btn
          title="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={15} />
        </Btn>
        <Btn
          title="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 size={15} />
        </Btn>
        <Btn
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List size={15} />
        </Btn>
        <Btn
          title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered size={15} />
        </Btn>
        <Btn
          title="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          <Quote size={15} />
        </Btn>
        <Btn
          title="Code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        >
          <Code2 size={15} />
        </Btn>
        <Btn
          title="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={15} />
        </Btn>
        <Divider />

        <Btn
          title="Align left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft size={15} />
        </Btn>
        <Btn
          title="Align centre"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter size={15} />
        </Btn>
        <Btn
          title="Align right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight size={15} />
        </Btn>
        <Divider />

        <Btn title="Add / edit link" onClick={setLink} active={editor.isActive("link")}>
          <LinkIcon size={15} />
        </Btn>
        <Btn
          title="Remove link"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
        >
          <Unlink size={15} />
        </Btn>
        <Btn
          title="Insert image"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="animate-spin" size={15} /> : <ImageIcon size={15} />}
        </Btn>
        <Btn title="Embed YouTube video" onClick={addYoutube}>
          <YoutubeIcon size={15} />
        </Btn>
        <Btn title="Embed link (Spotify, Vimeo, Maps…)" onClick={addEmbed}>
          <EmbedIcon size={15} />
        </Btn>
        <Btn
          title="Insert table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TableIcon size={15} />
        </Btn>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onPickImage}
        />
      </div>

      {/* Editor surface */}
      <div className="tiptap-editor text-white/80">
        <EditorContent editor={editor} />
      </div>

      {/* Footer: live counts */}
      <div className="flex items-center justify-end gap-4 px-3 py-2 border-t border-white/10 text-[10px] uppercase tracking-widest text-white/30">
        <span>{editor.storage.characterCount.words()} words</span>
        <span>{editor.storage.characterCount.characters()} chars</span>
      </div>
    </div>
  );
};

export type { Editor };
export default RichTextEditor;
