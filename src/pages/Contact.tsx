import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [socialUrl, setSocialUrl] = useState("");

  const platforms = ["Instagram", "TikTok", "YouTube", "Spotify / Apple Music", "SoundCloud", "Other"];

  const handleAddLink = () => {
    if (socialUrl.trim()) {
      setSocialLinks([...socialLinks, { platform: selectedPlatform, url: socialUrl }]);
      setSocialUrl("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <section className="w-full bg-[var(--bg-primary)] py-20 sm:py-28 lg:py-37.5">
        <div className="w-full px-[var(--section-px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* CONTACT FORM + OPTIONAL LINKS (2/3 + 1/3 in same background) */}
            <div className="lg:col-span-3 bg-[var(--bg-secondary)] p-5 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: MAIN FORM (2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                  <div>
                    <h3 className="text-sm md:text-md font-[var(--style-font)] uppercase tracking-tight bg-[var(--main)] inline-block px-4 py-2">
                      Contact Us
                    </h3>

                    <p className="mt-6 text-white/70 text-base md:text-lg leading-relaxed max-w-2xl">
                      Would you like to be featured on Off Air or would you like to
                      collaborate? Drop us a message and we will get back to you.
                    </p>
                  </div>

                  {/* Contact Form */}
                  <form className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full bg-black/30 border border-white/10 text-white placeholder:text-white/30
                                   px-4 py-4 outline-none focus:border-[var(--main)] transition-all"
                      />

                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-black/30 border border-white/10 text-white placeholder:text-white/30
                                   px-4 py-4 outline-none focus:border-[var(--main)] transition-all"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Subject"
                      className="w-full bg-black/30 border border-white/10 text-white placeholder:text-white/30
                                 px-4 py-4 outline-none focus:border-[var(--main)] transition-all"
                    />

                    <textarea
                      placeholder="Your Message..."
                      rows={6}
                      className="w-full bg-black/30 border border-white/10 text-white placeholder:text-white/30
                                 px-4 py-4 outline-none focus:border-[var(--main)] transition-all resize-none"
                    />

                    <button
                      type="submit"
                      className="bg-[var(--main)] text-white font-black uppercase tracking-widest px-10 py-4
                                 hover:bg-[var(--main-dark)] transition-all duration-300 w-fit"
                    >
                      Send Message
                    </button>
                  </form>

                  {/* Extra Message */}
                  <div className="border border-white/10 bg-black/20 p-6">
                    <p className="text-white/70 leading-relaxed">
                      Prefer email? Reach us at{" "}
                      <span className="text-white font-bold">
                        contact@offair.com
                      </span>
                    </p>
                  </div>
                </div>

                {/* RIGHT: OPTIONAL LINKS (1/3) */}
                <div className="lg:col-span-1 flex flex-col gap-6 pt-8">
                  <div>
                    <h3 className="text-sm md:text-md font-[var(--style-font)] uppercase tracking-tight bg-[var(--main)] inline-block px-4 py-2 w-fit mb-6">
                      Your Links
                    </h3>

                    <p className="text-white/50 text-xs uppercase tracking-[0.25em] mb-6">
                      Optional
                      <br/>
                      <br/>
                    </p>

                    {/* Select and Add */}
                    <div className="flex flex-col gap-4 mb-6">
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 text-white placeholder:text-white/30
                                   px-4 py-3 outline-none focus:border-[var(--main)] transition-all text-sm"
                      >
                        {platforms.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Paste URL"
                          value={socialUrl}
                          onChange={(e) => setSocialUrl(e.target.value)}
                          className="flex-1 bg-black/30 border border-white/10 text-white placeholder:text-white/30
                                     px-4 py-3 outline-none focus:border-[var(--main)] transition-all text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddLink}
                          className="bg-[var(--main)] text-white font-black uppercase tracking-widest px-4 py-3
                                     hover:bg-red-700 transition-all text-xs whitespace-nowrap"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Added Links List */}
                    {socialLinks.length > 0 && (
                      <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
                        {socialLinks.map((link, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-black/20 p-3 rounded">
                            <div>
                              <p className="text-white/70 text-xs font-bold">{link.platform}</p>
                              <p className="text-white/40 text-xs truncate">{link.url}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(idx)}
                              className="text-red-400 hover:text-red-300 text-sm font-bold ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
