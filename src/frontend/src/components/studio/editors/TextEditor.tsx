import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  Italic,
  RefreshCw,
  Strikethrough,
  Underline,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

type Alignment = "left" | "center" | "right" | "justify";
type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";

const FONTS = [
  "Arial",
  "Georgia",
  "Verdana",
  "Courier New",
  "Impact",
  "Trebuchet MS",
  "Palatino",
  "Comic Sans MS",
  "Helvetica",
  "Times New Roman",
];

const DEFAULT_STATE = {
  text: "Start typing your content here.\n\nFStudioX gives you full creative control over typography, colors, and effects.",
  fontFamily: "Arial",
  fontSize: 24,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  textColor: "#FFFFFF",
  bgColor: "#14151c",
  outlineColor: "#e11d2e",
  outlineWidth: 0,
  shadowEnabled: false,
  shadowX: 3,
  shadowY: 3,
  shadowBlur: 6,
  shadowColor: "#000000",
  glowEnabled: false,
  glowColor: "#e11d2e",
  letterSpacing: 0,
  lineHeight: 1.5,
  alignment: "center" as Alignment,
  textTransform: "none" as TextTransform,
  opacity: 100,
};

export default function TextEditor() {
  const [state, setState] = useState(DEFAULT_STATE);
  const previewRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof typeof DEFAULT_STATE>(
    key: K,
    value: (typeof DEFAULT_STATE)[K],
  ) => setState((prev) => ({ ...prev, [key]: value }));

  const wordCount = useMemo(() => {
    return state.text.trim().split(/\s+/).filter(Boolean).length;
  }, [state.text]);

  const charCount = state.text.length;

  const textDecoration =
    [
      state.underline ? "underline" : "",
      state.strikethrough ? "line-through" : "",
    ]
      .filter(Boolean)
      .join(" ") || "none";

  const shadowVal = state.shadowEnabled
    ? `${state.shadowX}px ${state.shadowY}px ${state.shadowBlur}px ${state.shadowColor}`
    : undefined;

  const glowVal = state.glowEnabled
    ? `0 0 12px ${state.glowColor}, 0 0 24px ${state.glowColor}88`
    : undefined;

  const computedTextShadow =
    [shadowVal, glowVal].filter(Boolean).join(", ") || undefined;

  const textStyle: React.CSSProperties = {
    fontFamily: state.fontFamily,
    fontSize: `${state.fontSize}px`,
    fontWeight: state.bold ? "bold" : "normal",
    fontStyle: state.italic ? "italic" : "normal",
    textDecoration,
    color: state.textColor,
    textAlign: state.alignment,
    textTransform: state.textTransform,
    letterSpacing: `${state.letterSpacing}px`,
    lineHeight: state.lineHeight,
    opacity: state.opacity / 100,
    textShadow: computedTextShadow,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  const downloadPNG = useCallback(async () => {
    const lines = state.text.split("\n");
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = 800 * scale;
    const estimatedHeight = Math.max(
      200,
      lines.length * state.fontSize * state.lineHeight * 1.4 + 80,
    );
    canvas.height = estimatedHeight * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, 800, estimatedHeight);

    ctx.font = `${state.italic ? "italic " : ""}${state.bold ? "bold " : ""}${state.fontSize}px ${state.fontFamily}`;
    ctx.fillStyle = state.textColor;
    ctx.globalAlpha = state.opacity / 100;

    if (state.shadowEnabled || state.glowEnabled) {
      if (state.shadowEnabled) {
        ctx.shadowColor = state.shadowColor;
        ctx.shadowOffsetX = state.shadowX;
        ctx.shadowOffsetY = state.shadowY;
        ctx.shadowBlur = state.shadowBlur;
      }
      if (state.glowEnabled) {
        ctx.shadowColor = state.glowColor;
        ctx.shadowBlur = 20;
      }
    }

    ctx.textAlign =
      state.alignment === "justify"
        ? "left"
        : (state.alignment as CanvasTextAlign);

    const xPos =
      state.alignment === "center"
        ? 400
        : state.alignment === "right"
          ? 760
          : 40;
    let yPos = 40 + state.fontSize;
    const lineSpacing = state.fontSize * state.lineHeight;

    for (const line of lines) {
      const displayLine =
        state.textTransform === "uppercase"
          ? line.toUpperCase()
          : state.textTransform === "lowercase"
            ? line.toLowerCase()
            : state.textTransform === "capitalize"
              ? line.replace(/\b\w/g, (c) => c.toUpperCase())
              : line;
      ctx.fillText(displayLine, xPos, yPos);
      yPos += lineSpacing;
    }

    const link = document.createElement("a");
    link.download = "fstudiox-text.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [state]);

  const downloadTXT = useCallback(() => {
    const blob = new Blob([state.text], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = "fstudiox-text.txt";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, [state.text]);

  const reset = () => setState(DEFAULT_STATE);

  const ToggleBtn = ({
    active,
    onClick,
    children,
    label,
  }: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    label?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="min-w-[36px] h-9 px-2 rounded flex items-center justify-center gap-1 text-xs font-medium transition-all"
      style={{
        backgroundColor: active
          ? "rgba(225,29,46,0.18)"
          : "var(--fsx-bg-elevated)",
        color: active ? "var(--fsx-accent)" : "var(--fsx-text-secondary)",
        border: active
          ? "1px solid rgba(225,29,46,0.4)"
          : "1px solid var(--fsx-border)",
      }}
    >
      {children}
    </button>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div
      className="text-xs font-semibold uppercase tracking-widest px-4 pt-4 pb-1"
      style={{ color: "var(--fsx-accent)" }}
    >
      {children}
    </div>
  );

  const SliderRow = ({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
    unit = "",
    decimals = 0,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (v: number) => void;
    unit?: string;
    decimals?: number;
  }) => (
    <div className="flex items-center gap-3 px-4 py-1.5">
      <span
        className="text-xs w-24 shrink-0"
        style={{ color: "var(--fsx-text-muted)" }}
      >
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full cursor-pointer"
        style={{ accentColor: "var(--fsx-accent)" }}
      />
      <span
        className="text-xs font-mono w-14 text-right shrink-0"
        style={{ color: "var(--fsx-text-secondary)" }}
      >
        {value.toFixed(decimals)}
        {unit}
      </span>
    </div>
  );

  const ColorRow = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="flex items-center gap-3 px-4 py-2">
      <span
        className="text-xs w-24 shrink-0"
        style={{ color: "var(--fsx-text-muted)" }}
      >
        {label}
      </span>
      <div className="relative flex items-center gap-2">
        <div
          className="w-8 h-8 rounded border cursor-pointer overflow-hidden"
          style={{ borderColor: "var(--fsx-border)" }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 -translate-x-1 -translate-y-1 cursor-pointer border-0 bg-transparent"
          />
        </div>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--fsx-text-secondary)" }}
        >
          {value.toUpperCase()}
        </span>
      </div>
    </div>
  );

  const Divider = () => (
    <div
      className="mx-4 my-1 h-px"
      style={{ backgroundColor: "var(--fsx-border)" }}
    />
  );

  return (
    <div
      data-ocid="text_editor.panel"
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: "var(--fsx-bg-primary)" }}
    >
      {/* ── TOP 50%: PREVIEW ── */}
      <div
        className="h-1/2 relative flex flex-col overflow-hidden border-b"
        style={{
          borderColor: "var(--fsx-border)",
          backgroundColor: state.bgColor,
        }}
      >
        {/* Preview label */}
        <div
          className="absolute top-2 left-3 text-[10px] font-semibold uppercase tracking-widest z-10 px-2 py-0.5 rounded"
          style={{
            color: "var(--fsx-text-muted)",
            backgroundColor: "rgba(11,11,15,0.6)",
          }}
        >
          Preview
        </div>

        {/* Stats */}
        <div
          className="absolute top-2 right-3 flex gap-3 text-[10px] z-10 px-2 py-0.5 rounded"
          style={{
            color: "var(--fsx-text-muted)",
            backgroundColor: "rgba(11,11,15,0.6)",
          }}
        >
          <span data-ocid="text_editor.word_count">{wordCount}w</span>
          <span data-ocid="text_editor.char_count">{charCount}ch</span>
        </div>

        {/* Rendered text */}
        <div
          ref={previewRef}
          data-ocid="text_editor.preview"
          className="flex-1 flex items-center justify-center overflow-auto p-8"
        >
          <div className="max-w-full w-full" style={textStyle}>
            {state.text || (
              <span style={{ opacity: 0.3 }}>
                Your styled text will appear here...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM 50%: CONTROLS ── */}
      <div
        className="h-1/2 overflow-y-auto"
        style={{ backgroundColor: "var(--fsx-bg-primary)" }}
      >
        {/* ── TYPOGRAPHY ── */}
        <SectionLabel>Typography</SectionLabel>

        {/* Font family */}
        <div className="flex items-center gap-3 px-4 py-2">
          <span
            className="text-xs w-24 shrink-0"
            style={{ color: "var(--fsx-text-muted)" }}
          >
            Font
          </span>
          <select
            data-ocid="text_editor.font_family.select"
            value={state.fontFamily}
            onChange={(e) => set("fontFamily", e.target.value)}
            className="flex-1 text-xs rounded px-2 py-1.5 border outline-none"
            style={{
              backgroundColor: "var(--fsx-bg-elevated)",
              borderColor: "var(--fsx-border)",
              color: "var(--fsx-text-secondary)",
            }}
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <SliderRow
          label="Font Size"
          value={state.fontSize}
          min={12}
          max={200}
          onChange={(v) => set("fontSize", v)}
          unit="px"
        />

        {/* Style toggles */}
        <div className="flex flex-wrap gap-2 px-4 py-2">
          <ToggleBtn
            active={state.bold}
            onClick={() => set("bold", !state.bold)}
            label="Bold"
          >
            <Bold size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={state.italic}
            onClick={() => set("italic", !state.italic)}
            label="Italic"
          >
            <Italic size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={state.underline}
            onClick={() => set("underline", !state.underline)}
            label="Underline"
          >
            <Underline size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={state.strikethrough}
            onClick={() => set("strikethrough", !state.strikethrough)}
            label="Strikethrough"
          >
            <Strikethrough size={14} />
          </ToggleBtn>

          <div
            className="w-px h-9 mx-1"
            style={{ backgroundColor: "var(--fsx-border)" }}
          />

          <ToggleBtn
            active={state.alignment === "left"}
            onClick={() => set("alignment", "left")}
            label="Align Left"
          >
            <AlignLeft size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={state.alignment === "center"}
            onClick={() => set("alignment", "center")}
            label="Align Center"
          >
            <AlignCenter size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={state.alignment === "right"}
            onClick={() => set("alignment", "right")}
            label="Align Right"
          >
            <AlignRight size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={state.alignment === "justify"}
            onClick={() => set("alignment", "justify")}
            label="Justify"
          >
            <AlignJustify size={14} />
          </ToggleBtn>
        </div>

        {/* Text Transform */}
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {(
            ["none", "uppercase", "lowercase", "capitalize"] as TextTransform[]
          ).map((t) => (
            <ToggleBtn
              key={t}
              active={state.textTransform === t}
              onClick={() => set("textTransform", t)}
            >
              {t === "none"
                ? "Aa"
                : t === "uppercase"
                  ? "AA"
                  : t === "lowercase"
                    ? "aa"
                    : "Aa+"}
            </ToggleBtn>
          ))}
        </div>

        <Divider />

        {/* ── COLORS ── */}
        <SectionLabel>Colors</SectionLabel>
        <ColorRow
          label="Text Color"
          value={state.textColor}
          onChange={(v) => set("textColor", v)}
        />
        <ColorRow
          label="Background"
          value={state.bgColor}
          onChange={(v) => set("bgColor", v)}
        />
        <ColorRow
          label="Outline Color"
          value={state.outlineColor}
          onChange={(v) => set("outlineColor", v)}
        />
        <SliderRow
          label="Outline Width"
          value={state.outlineWidth}
          min={0}
          max={10}
          onChange={(v) => set("outlineWidth", v)}
          unit="px"
        />

        <Divider />

        {/* ── EFFECTS ── */}
        <SectionLabel>Effects</SectionLabel>

        {/* Shadow */}
        <div className="flex items-center gap-3 px-4 py-2">
          <span
            className="text-xs w-24 shrink-0"
            style={{ color: "var(--fsx-text-muted)" }}
          >
            Text Shadow
          </span>
          <button
            type="button"
            onClick={() => set("shadowEnabled", !state.shadowEnabled)}
            data-ocid="text_editor.shadow.toggle"
            className="relative w-10 h-5 rounded-full transition-colors"
            style={{
              backgroundColor: state.shadowEnabled
                ? "var(--fsx-accent)"
                : "var(--fsx-bg-elevated)",
              border: "1px solid var(--fsx-border)",
            }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
              style={{
                left: state.shadowEnabled ? "calc(100% - 18px)" : "2px",
                backgroundColor: "#fff",
              }}
            />
          </button>
        </div>

        {state.shadowEnabled && (
          <>
            <SliderRow
              label="Shadow X"
              value={state.shadowX}
              min={-20}
              max={20}
              onChange={(v) => set("shadowX", v)}
              unit="px"
            />
            <SliderRow
              label="Shadow Y"
              value={state.shadowY}
              min={-20}
              max={20}
              onChange={(v) => set("shadowY", v)}
              unit="px"
            />
            <SliderRow
              label="Shadow Blur"
              value={state.shadowBlur}
              min={0}
              max={30}
              onChange={(v) => set("shadowBlur", v)}
              unit="px"
            />
            <ColorRow
              label="Shadow Color"
              value={state.shadowColor}
              onChange={(v) => set("shadowColor", v)}
            />
          </>
        )}

        {/* Glow */}
        <div className="flex items-center gap-3 px-4 py-2">
          <span
            className="text-xs w-24 shrink-0"
            style={{ color: "var(--fsx-text-muted)" }}
          >
            Glow Effect
          </span>
          <button
            type="button"
            onClick={() => set("glowEnabled", !state.glowEnabled)}
            data-ocid="text_editor.glow.toggle"
            className="relative w-10 h-5 rounded-full transition-colors"
            style={{
              backgroundColor: state.glowEnabled
                ? "var(--fsx-accent)"
                : "var(--fsx-bg-elevated)",
              border: "1px solid var(--fsx-border)",
            }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
              style={{
                left: state.glowEnabled ? "calc(100% - 18px)" : "2px",
                backgroundColor: "#fff",
              }}
            />
          </button>
        </div>

        {state.glowEnabled && (
          <ColorRow
            label="Glow Color"
            value={state.glowColor}
            onChange={(v) => set("glowColor", v)}
          />
        )}

        <SliderRow
          label="Letter Spacing"
          value={state.letterSpacing}
          min={-5}
          max={20}
          onChange={(v) => set("letterSpacing", v)}
          unit="px"
        />
        <SliderRow
          label="Line Height"
          value={state.lineHeight}
          min={1.0}
          max={3.0}
          step={0.1}
          onChange={(v) => set("lineHeight", v)}
          decimals={1}
        />
        <SliderRow
          label="Opacity"
          value={state.opacity}
          min={0}
          max={100}
          onChange={(v) => set("opacity", v)}
          unit="%"
        />

        <Divider />

        {/* ── TEXT INPUT ── */}
        <SectionLabel>Text Input</SectionLabel>
        <div className="px-4 pb-2">
          <textarea
            data-ocid="text_editor.content.textarea"
            value={state.text}
            onChange={(e) => set("text", e.target.value)}
            placeholder="Type your text here..."
            rows={4}
            className="w-full text-sm rounded-lg px-3 py-2.5 outline-none resize-none leading-relaxed"
            style={{
              backgroundColor: "var(--fsx-bg-elevated)",
              border: "1px solid var(--fsx-border)",
              color: "var(--fsx-text-primary)",
            }}
          />
        </div>

        <Divider />

        {/* ── ACTIONS ── */}
        <div className="flex flex-wrap gap-2 px-4 py-3 pb-6">
          <button
            type="button"
            onClick={downloadPNG}
            data-ocid="text_editor.download_png.btn"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: "var(--fsx-accent)",
              color: "#fff",
            }}
          >
            <Download size={13} />
            PNG
          </button>
          <button
            type="button"
            onClick={downloadTXT}
            data-ocid="text_editor.download_txt.btn"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: "var(--fsx-bg-elevated)",
              color: "var(--fsx-text-secondary)",
              border: "1px solid var(--fsx-border)",
            }}
          >
            <Download size={13} />
            TXT
          </button>
          <button
            type="button"
            onClick={reset}
            data-ocid="text_editor.reset.btn"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ml-auto"
            style={{
              backgroundColor: "var(--fsx-bg-elevated)",
              color: "var(--fsx-text-muted)",
              border: "1px solid var(--fsx-border)",
            }}
          >
            <RefreshCw size={13} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
