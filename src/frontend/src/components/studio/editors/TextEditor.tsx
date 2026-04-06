import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";
import { useMemo, useState } from "react";

type Alignment = "left" | "center" | "right" | "justify";

const FONTS = [
  "Inter",
  "Georgia",
  "Courier New",
  "Arial",
  "Times New Roman",
  "Verdana",
  "Trebuchet MS",
];
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

export default function TextEditor() {
  const [text, setText] = useState(
    "Start writing your content here. FStudioX gives you full control over typography, formatting, and style.\n\nUse the toolbar above to customize fonts, sizes, colors, and alignment. Your creativity has no limits.",
  );
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(16);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [alignment, setAlignment] = useState<Alignment>("left");

  const wordCount = useMemo(() => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [text]);

  const charCount = text.length;

  const textStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight: bold ? "bold" : "normal",
    fontStyle: italic ? "italic" : "normal",
    textDecoration: underline ? "underline" : "none",
    color: textColor,
    textAlign: alignment,
  };

  const ToolbarBtn = ({
    active,
    onClick,
    children,
  }: { active?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-8 h-8 rounded flex items-center justify-center text-sm transition-all"
      style={{
        backgroundColor: active ? "rgba(225,29,46,0.15)" : "transparent",
        color: active ? "var(--fsx-accent)" : "var(--fsx-text-secondary)",
        border: active
          ? "1px solid rgba(225,29,46,0.3)"
          : "1px solid transparent",
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      data-ocid="text_editor.panel"
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--fsx-bg-primary)" }}
    >
      {/* Text Toolbar */}
      <div
        className="flex flex-wrap items-center gap-2 px-5 py-3 border-b"
        style={{
          backgroundColor: "var(--fsx-bg-surface)",
          borderColor: "var(--fsx-border)",
        }}
      >
        {/* Font Family */}
        <select
          data-ocid="text_editor.font_family.select"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="text-xs rounded px-2 py-1.5 border outline-none"
          style={{
            backgroundColor: "var(--fsx-bg-elevated)",
            borderColor: "var(--fsx-border)",
            color: "var(--fsx-text-secondary)",
          }}
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {/* Font Size */}
        <select
          data-ocid="text_editor.font_size.select"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="text-xs rounded px-2 py-1.5 border outline-none w-16"
          style={{
            backgroundColor: "var(--fsx-bg-elevated)",
            borderColor: "var(--fsx-border)",
            color: "var(--fsx-text-secondary)",
          }}
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div
          className="w-px h-5"
          style={{ backgroundColor: "var(--fsx-border)" }}
        />

        {/* Bold / Italic / Underline */}
        <ToolbarBtn active={bold} onClick={() => setBold(!bold)}>
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn active={italic} onClick={() => setItalic(!italic)}>
          <Italic size={14} />
        </ToolbarBtn>
        <ToolbarBtn active={underline} onClick={() => setUnderline(!underline)}>
          <Underline size={14} />
        </ToolbarBtn>

        <div
          className="w-px h-5"
          style={{ backgroundColor: "var(--fsx-border)" }}
        />

        {/* Alignment */}
        <ToolbarBtn
          active={alignment === "left"}
          onClick={() => setAlignment("left")}
        >
          <AlignLeft size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          active={alignment === "center"}
          onClick={() => setAlignment("center")}
        >
          <AlignCenter size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          active={alignment === "right"}
          onClick={() => setAlignment("right")}
        >
          <AlignRight size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          active={alignment === "justify"}
          onClick={() => setAlignment("justify")}
        >
          <AlignJustify size={14} />
        </ToolbarBtn>

        <div
          className="w-px h-5"
          style={{ backgroundColor: "var(--fsx-border)" }}
        />

        {/* Color */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: "var(--fsx-text-muted)" }}>
            Color
          </span>
          <input
            data-ocid="text_editor.text_color.input"
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-auto p-8">
        <div
          className="max-w-4xl mx-auto rounded-2xl p-8 min-h-96"
          style={{
            backgroundColor: "var(--fsx-bg-surface)",
            border: "1px solid var(--fsx-border)",
          }}
        >
          <textarea
            data-ocid="text_editor.content.textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-full min-h-80 bg-transparent outline-none resize-none leading-relaxed"
            style={textStyle}
            placeholder="Start typing your content..."
          />
        </div>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-end gap-6 px-5 py-2 border-t text-xs"
        style={{
          backgroundColor: "var(--fsx-bg-surface)",
          borderColor: "var(--fsx-border)",
          color: "var(--fsx-text-muted)",
        }}
      >
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
}
