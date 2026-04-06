import {
  ArrowRight,
  ChevronRight,
  Cloud,
  Download,
  Github,
  ImageIcon,
  Instagram,
  Palette,
  Smartphone,
  Sparkles,
  Twitter,
  Type,
  Video,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Page } from "../App";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface LandingProps {
  onNavigate: (page: Page) => void;
}

const features = [
  {
    icon: Type,
    title: "Text Editor",
    description:
      "Rich text editing with fonts, colors, and advanced formatting tools for every creative need.",
  },
  {
    icon: ImageIcon,
    title: "Image Editor",
    description:
      "Filters, adjustments, and image manipulation tools for stunning visuals.",
  },
  {
    icon: Video,
    title: "Video Editor",
    description:
      "Trim, cut, and enhance your video projects with precision and ease.",
  },
  {
    icon: Palette,
    title: "Design Editor",
    description:
      "Create graphics, layouts, and visual compositions with a powerful canvas.",
  },
  {
    icon: Cloud,
    title: "Cloud Save",
    description:
      "Projects saved securely to the blockchain — your work, always available.",
  },
  {
    icon: Download,
    title: "Export Tools",
    description:
      "Export your work in multiple formats, ready for any platform or use case.",
  },
];

const INSTAGRAM_URL =
  "https://www.instagram.com/_f_a_i_s_a_l__r_a_z_a_?igsh=MXV3aXZzeXdubnR2dw==";

export default function Landing({ onNavigate }: LandingProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { canInstall, install, isIOS } = usePWAInstall();
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    document.title = "FStudioX — All-in-One Creative Studio";
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute(
        "content",
        "FStudioX is your all-in-one creative editing platform. Text, image, video, and design editing in one powerful studio.",
      );
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSHint((prev) => !prev);
    } else {
      install();
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--fsx-bg-primary)",
        color: "var(--fsx-text-primary)",
      }}
    >
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "rgba(11,11,15,0.92)",
          borderColor: "var(--fsx-border)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: "var(--fsx-accent)" }}
            >
              F
            </div>
            <span className="font-heading font-bold text-xl text-white">
              Studio<span style={{ color: "var(--fsx-accent)" }}>X</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Studio", "About"].map((item) => (
              <button
                type="button"
                key={item}
                data-ocid={`nav.${item.toLowerCase()}.link`}
                onClick={
                  item === "Studio"
                    ? () => onNavigate("studio")
                    : item === "Features"
                      ? scrollToFeatures
                      : undefined
                }
                className="text-sm transition-colors cursor-pointer"
                style={{ color: "var(--fsx-text-secondary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--fsx-text-secondary)";
                }}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {/* Install App button (navbar) */}
            {canInstall && (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  data-ocid="nav.install_app.button"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    backgroundColor: "var(--fsx-bg-elevated)",
                    borderColor: "var(--fsx-border)",
                    color: "var(--fsx-text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "white";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(225,29,46,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--fsx-text-secondary)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--fsx-border)";
                  }}
                >
                  <Smartphone size={13} />
                  Install App
                </button>
                {isIOS && showIOSHint && (
                  <div
                    className="absolute right-0 top-10 w-56 p-3 rounded-xl text-xs z-50"
                    style={{
                      backgroundColor: "var(--fsx-bg-surface)",
                      border: "1px solid var(--fsx-border)",
                      color: "var(--fsx-text-secondary)",
                    }}
                  >
                    Tap the <strong style={{ color: "white" }}>Share</strong>{" "}
                    icon in Safari, then tap{" "}
                    <strong style={{ color: "white" }}>
                      &ldquo;Add to Home Screen&rdquo;
                    </strong>
                    .
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              data-ocid="nav.open_studio.primary_button"
              onClick={() => onNavigate("studio")}
              className="fsx-btn-primary text-sm hidden sm:block"
            >
              Open Studio
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-20 pb-28 px-6"
        style={{
          backgroundImage:
            "url('/assets/generated/fstudiox-hero-bg.dim_1920x1080.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(11,11,15,0.95) 0%, rgba(11,11,15,0.75) 50%, rgba(11,11,15,0.9) 100%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="animate-fade-in">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
                style={{
                  backgroundColor: "rgba(225,29,46,0.12)",
                  border: "1px solid rgba(225,29,46,0.25)",
                  color: "var(--fsx-accent)",
                }}
              >
                <Sparkles size={12} />
                All-in-One Creative Platform
              </div>

              <h1 className="fsx-heading text-5xl lg:text-6xl xl:text-7xl leading-[1.05] mb-6">
                Unleash Your
                <br />
                <span style={{ color: "var(--fsx-accent)" }}>Creative</span>{" "}
                Vision
              </h1>

              <p
                className="text-lg mb-10 max-w-md leading-relaxed"
                style={{ color: "var(--fsx-text-secondary)" }}
              >
                FStudioX brings text, image, video, and design editing into one
                seamless workspace. Build, edit, and export everything from a
                single powerful studio.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  data-ocid="hero.start_creating.primary_button"
                  onClick={() => onNavigate("studio")}
                  className="fsx-btn-primary flex items-center gap-2"
                >
                  <Zap size={16} />
                  Start Creating
                </button>
                <button
                  type="button"
                  data-ocid="hero.view_features.secondary_button"
                  onClick={scrollToFeatures}
                  className="fsx-btn-secondary flex items-center gap-2"
                >
                  View Features
                  <ChevronRight size={16} />
                </button>
                {canInstall && (
                  <button
                    type="button"
                    data-ocid="hero.install_app.button"
                    onClick={handleInstallClick}
                    className="fsx-btn-secondary flex items-center gap-2"
                  >
                    <Smartphone size={16} />
                    {isIOS ? "Add to Home Screen" : "Install App"}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12">
                {[
                  { label: "Editor Tools", value: "6+" },
                  { label: "Export Formats", value: "12+" },
                  { label: "Blockchain Saved", value: "100%" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "var(--fsx-accent)" }}
                    >
                      {value}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Preview */}
            <div className="relative hidden lg:block">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid var(--fsx-border)",
                  boxShadow:
                    "0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(225,29,46,0.15)",
                }}
              >
                <img
                  src="/assets/generated/fstudiox-editor-preview.dim_1200x700.jpg"
                  alt="FStudioX Editor Preview"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating badges */}
              <div
                className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: "var(--fsx-bg-surface)",
                  border: "1px solid var(--fsx-border)",
                  color: "var(--fsx-text-secondary)",
                }}
              >
                ✨ 4 Editor Modes
              </div>
              <div
                className="absolute -top-4 -right-4 px-4 py-2 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: "rgba(225,29,46,0.15)",
                  border: "1px solid rgba(225,29,46,0.3)",
                  color: "var(--fsx-accent)",
                }}
              >
                🔥 Now Live
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        id="features"
        className="py-24 px-6"
        style={{ backgroundColor: "var(--fsx-bg-primary)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="fsx-heading text-4xl lg:text-5xl mb-4">
              Everything You Need to{" "}
              <span style={{ color: "var(--fsx-accent)" }}>Create</span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--fsx-text-secondary)" }}
            >
              A complete creative toolkit — no switching between apps, no
              compromises.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                data-ocid={`features.item.${i + 1}`}
                className="group p-6 rounded-2xl transition-all cursor-pointer"
                style={{
                  backgroundColor: "var(--fsx-bg-surface)",
                  border: "1px solid var(--fsx-border)",
                  animationDelay: `${i * 80}ms`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(225,29,46,0.4)";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#191B24";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--fsx-border)";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "var(--fsx-bg-surface)";
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: "rgba(225,29,46,0.12)",
                    border: "1px solid rgba(225,29,46,0.2)",
                  }}
                >
                  <Icon size={20} style={{ color: "var(--fsx-accent)" }} />
                </div>
                <h3 className="font-heading font-bold text-lg text-white mb-2">
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--fsx-text-muted)" }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="py-20 px-6 mx-6 mb-16 rounded-3xl"
        style={{
          background:
            "linear-gradient(135deg, #1A0508 0%, #2D0A0F 50%, #1A0508 100%)",
          border: "1px solid rgba(225,29,46,0.25)",
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: "rgba(225,29,46,0.15)",
              border: "1px solid rgba(225,29,46,0.3)",
            }}
          >
            <Zap size={28} style={{ color: "var(--fsx-accent)" }} />
          </div>
          <h2 className="fsx-heading text-4xl lg:text-5xl mb-4">
            Ready to <span style={{ color: "var(--fsx-accent)" }}>Create</span>?
          </h2>
          <p
            className="text-lg mb-8"
            style={{ color: "var(--fsx-text-secondary)" }}
          >
            Jump into the studio and start building something extraordinary.
          </p>
          <button
            type="button"
            data-ocid="cta.open_studio.primary_button"
            onClick={() => onNavigate("studio")}
            className="fsx-btn-primary inline-flex items-center gap-2 text-base"
          >
            Open Studio
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-12 px-6"
        style={{ borderColor: "var(--fsx-border)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: "var(--fsx-accent)" }}
              >
                F
              </div>
              <span className="font-heading font-bold text-lg text-white">
                Studio<span style={{ color: "var(--fsx-accent)" }}>X</span>
              </span>
            </div>

            <p className="text-sm" style={{ color: "var(--fsx-text-muted)" }}>
              &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--fsx-accent)" }}
              >
                caffeine.ai
              </a>
            </p>

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                {[
                  { id: "github", Icon: Github, href: null },
                  { id: "twitter", Icon: Twitter, href: null },
                  { id: "instagram", Icon: Instagram, href: INSTAGRAM_URL },
                ].map(({ id, Icon, href }) =>
                  href ? (
                    <a
                      key={id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid={`footer.${id}.link`}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                      style={{
                        color: "var(--fsx-text-muted)",
                        border: "1px solid var(--fsx-border)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          "white";
                        (
                          e.currentTarget as HTMLAnchorElement
                        ).style.borderColor = "rgba(225,29,46,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          "var(--fsx-text-muted)";
                        (
                          e.currentTarget as HTMLAnchorElement
                        ).style.borderColor = "var(--fsx-border)";
                      }}
                    >
                      <Icon size={16} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      key={id}
                      data-ocid={`footer.${id}.button`}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                      style={{
                        color: "var(--fsx-text-muted)",
                        border: "1px solid var(--fsx-border)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "white";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "rgba(225,29,46,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "var(--fsx-text-muted)";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "var(--fsx-border)";
                      }}
                    >
                      <Icon size={16} />
                    </button>
                  ),
                )}
              </div>
              {/* Instagram handle label */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "var(--fsx-text-muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--fsx-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--fsx-text-muted)";
                }}
              >
                <Instagram size={12} />
                @_f_a_i_s_a_l__r_a_z_a_
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
