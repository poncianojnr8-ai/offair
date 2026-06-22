import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Generic iframe / embed node.
 *
 * Lets editors drop in any embeddable URL (Spotify, SoundCloud, Vimeo,
 * Google Maps, generic players, etc.) as a responsive iframe. YouTube has
 * its own dedicated extension; this is the catch-all for everything else.
 *
 * The node serialises to a plain <iframe> wrapped in a .embed-wrapper div,
 * so it renders correctly on the public post pages (which dump post.body
 * straight into the DOM via dangerouslySetInnerHTML).
 */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iframe: {
      /** Insert a responsive iframe embed. */
      setIframe: (options: { src: string }) => ReturnType;
    };
  }
}

export const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "560" },
      height: { default: "315" },
      frameborder: { default: "0" },
      allow: {
        default:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      },
      allowfullscreen: { default: "true" },
    };
  },

  parseHTML() {
    return [{ tag: "iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "embed-wrapper" },
      ["iframe", mergeAttributes(HTMLAttributes)],
    ];
  },

  addCommands() {
    return {
      setIframe:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },
});

export default Iframe;
