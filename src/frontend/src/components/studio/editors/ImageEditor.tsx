import {
  Download,
  FlipHorizontal2,
  FlipVertical2,
  ImageIcon,
  RefreshCw,
  RotateCw,
  SplitSquareHorizontal,
  Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  blur: number;
  sharpen: number;
  exposure: number;
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  blur: 0,
  sharpen: 0,
  exposure: 0,
};

// ─── Filter Presets ─────────────────────────────────────────────────────────

interface Preset {
  id: string;
  label: string;
  filter: string;
  thumb: string; // hue-rotate for thumbnail color hint
}

const PRESETS: Preset[] = [
  { id: "normal", label: "Normal", filter: "none", thumb: "#8b7d7d" },
  {
    id: "warm",
    label: "Warm",
    filter: "sepia(0.3) saturate(1.4) brightness(1.05) hue-rotate(-10deg)",
    thumb: "#c4895e",
  },
  {
    id: "cool",
    label: "Cool",
    filter: "hue-rotate(30deg) saturate(0.9) brightness(1.05)",
    thumb: "#5e8ec4",
  },
  {
    id: "bw",
    label: "B&W",
    filter: "grayscale(1) contrast(1.1)",
    thumb: "#777777",
  },
  {
    id: "vintage",
    label: "Vintage",
    filter: "sepia(0.5) contrast(0.9) brightness(0.9) saturate(0.8)",
    thumb: "#a0845c",
  },
  {
    id: "clarendon",
    label: "Clarendon",
    filter: "contrast(1.2) saturate(1.35) brightness(1.1)",
    thumb: "#6a9fd8",
  },
  {
    id: "juno",
    label: "Juno",
    filter: "saturate(1.4) hue-rotate(-10deg) brightness(1.1)",
    thumb: "#c9a840",
  },
  {
    id: "lark",
    label: "Lark",
    filter: "contrast(0.9) brightness(1.1) saturate(0.9)",
    thumb: "#b8c9a0",
  },
  {
    id: "fade",
    label: "Fade",
    filter: "brightness(1.1) contrast(0.85) saturate(0.8)",
    thumb: "#b0a8a8",
  },
  {
    id: "vivid",
    label: "Vivid",
    filter: "saturate(1.8) contrast(1.2)",
    thumb: "#e13a6a",
  },
  {
    id: "muted",
    label: "Muted",
    filter: "saturate(0.6) contrast(0.9)",
    thumb: "#8d9090",
  },
];

// ─── Slider definitions ──────────────────────────────────────────────────────

const SLIDER_DEFS: {
  key: keyof Adjustments;
  label: string;
  min: number;
  max: number;
  icon: string;
}[] = [
  { key: "brightness", label: "Brightness", min: -100, max: 100, icon: "☀" },
  { key: "contrast", label: "Contrast", min: -100, max: 100, icon: "◑" },
  { key: "saturation", label: "Saturation", min: -100, max: 100, icon: "◎" },
  { key: "exposure", label: "Exposure", min: -100, max: 100, icon: "⊙" },
  { key: "temperature", label: "Temperature", min: -50, max: 50, icon: "🌡" },
  { key: "tint", label: "Tint", min: -50, max: 50, icon: "🎨" },
  { key: "blur", label: "Blur", min: 0, max: 20, icon: "⬤" },
  { key: "sharpen", label: "Sharpen", min: 0, max: 10, icon: "◇" },
];

// ─── Helper: build final CSS filter string ──────────────────────────────────

function buildFilterString(preset: string, adj: Adjustments): string {
  const parts: string[] = [];

  if (preset && preset !== "none") parts.push(preset);

  const brightness = 1 + adj.brightness / 100 + adj.exposure / 100;
  const contrast = 1 + adj.contrast / 100;
  const saturation = 1 + adj.saturation / 100;

  parts.push(`brightness(${Math.max(0, brightness).toFixed(3)})`);
  parts.push(`contrast(${Math.max(0, contrast).toFixed(3)})`);
  parts.push(`saturate(${Math.max(0, saturation).toFixed(3)})`);

  if (adj.blur > 0) parts.push(`blur(${adj.blur}px)`);
  if (adj.sharpen > 0)
    parts.push(`contrast(${(1 + adj.sharpen * 0.06).toFixed(3)})`);

  if (adj.temperature !== 0) {
    const deg =
      adj.temperature < 0 ? adj.temperature * 0.4 : adj.temperature * -0.4;
    const sepia = Math.abs(adj.temperature) / 100;
    parts.push(`hue-rotate(${deg.toFixed(1)}deg)`);
    if (adj.temperature > 0) parts.push(`sepia(${(sepia * 0.4).toFixed(3)})`);
  }

  if (adj.tint !== 0) {
    const hueDeg = adj.tint * 1.5;
    parts.push(`hue-rotate(${hueDeg.toFixed(1)}deg)`);
  }

  return parts.join(" ") || "none";
}

// ─── SliderControl ──────────────────────────────────────────────────────────

function SliderControl({
  label,
  icon,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  icon: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span
          className="text-xs flex items-center gap-1.5"
          style={{ color: "var(--fsx-text-secondary)" }}
        >
          <span className="text-[10px]">{icon}</span>
          {label}
        </span>
        <span
          className="text-xs font-mono tabular-nums w-8 text-right"
          style={{
            color: value === 0 ? "var(--fsx-text-muted)" : "var(--fsx-accent)",
          }}
        >
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "var(--fsx-accent)" }}
      />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ImageEditor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageNaturalW, setImageNaturalW] = useState(0);
  const [imageNaturalH, setImageNaturalH] = useState(0);
  const [adjustments, setAdjustments] =
    useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);

  const filterString = buildFilterString(activePreset.filter, adjustments);

  const transformStyle = [
    `rotate(${rotation}deg)`,
    `scaleX(${flipH ? -1 : 1})`,
    `scaleY(${flipV ? -1 : 1})`,
  ].join(" ");

  // ── File loading ────────────────────────────────────────────────────────────

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageName(file.name);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActivePreset(PRESETS[0]);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  // ── Adjustments ─────────────────────────────────────────────────────────────

  const handleAdj = (key: keyof Adjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActivePreset(PRESETS[0]);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  // ── Download PNG ─────────────────────────────────────────────────────────────

  const downloadPng = useCallback(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");

      // account for rotation swapping w/h
      const rotated90 = rotation === 90 || rotation === 270;
      canvas.width = rotated90 ? img.height : img.width;
      canvas.height = rotated90 ? img.width : img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.filter = filterString === "none" ? "none" : filterString;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const link = document.createElement("a");
      link.download = `${imageName.replace(/\.[^.]+$/, "")}_edited.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = imageUrl;
  }, [imageUrl, filterString, rotation, flipH, flipV, imageName]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      data-ocid="image_editor.panel"
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: "var(--fsx-bg-primary)" }}
    >
      {/* ── TOP: Preview (50% height) ── */}
      <div
        className="flex-none relative flex items-center justify-center overflow-hidden"
        style={{ height: "50%", backgroundColor: "var(--fsx-bg-primary)" }}
      >
        {!imageUrl ? (
          /* Drop zone */
          <div
            data-ocid="image_editor.dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className="flex flex-col items-center justify-center gap-4 w-full h-full cursor-pointer transition-all"
            style={{
              border: `2px dashed ${isDragging ? "var(--fsx-accent)" : "var(--fsx-border)"}`,
              backgroundColor: isDragging
                ? "rgba(225,29,46,0.04)"
                : "transparent",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: "rgba(225,29,46,0.1)",
                border: "1px solid rgba(225,29,46,0.25)",
              }}
            >
              <ImageIcon size={30} style={{ color: "var(--fsx-accent)" }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white mb-1 text-base">
                Drop an image here
              </p>
              <p className="text-sm" style={{ color: "var(--fsx-text-muted)" }}>
                PNG, JPG, WebP, GIF supported
              </p>
            </div>
            <label className="fsx-btn-primary cursor-pointer">
              <input
                data-ocid="image_editor.upload_button"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <span className="flex items-center gap-2">
                <Upload size={14} /> Choose Image
              </span>
            </label>
            <p
              className="text-xs font-bold tracking-widest"
              style={{ color: "var(--fsx-accent)", opacity: 0.4 }}
            >
              FSTUDIOX
            </p>
          </div>
        ) : (
          /* Image preview */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
            <img
              ref={imgRef}
              data-ocid="image_editor.canvas_target"
              src={imageUrl}
              alt="Preview"
              onLoad={(e) => {
                const el = e.currentTarget;
                setImageNaturalW(el.naturalWidth);
                setImageNaturalH(el.naturalHeight);
              }}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                filter: showOriginal ? "none" : filterString,
                transform: transformStyle,
                transition: "filter 0.15s ease, transform 0.2s ease",
              }}
            />
            {/* Before/After overlay badge */}
            {showOriginal && (
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider"
                style={{
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "var(--fsx-text-secondary)",
                  border: "1px solid var(--fsx-border)",
                }}
              >
                ORIGINAL
              </div>
            )}
            {/* Image dimensions badge */}
            {imageNaturalW > 0 && (
              <div
                className="absolute bottom-2 right-3 text-[10px] font-mono"
                style={{ color: "var(--fsx-text-muted)" }}
              >
                {imageNaturalW} × {imageNaturalH}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM: Controls (50% height, scrollable) ── */}
      <div
        className="flex-none overflow-y-auto"
        style={{
          height: "50%",
          backgroundColor: "var(--fsx-bg-surface)",
          borderTop: "1px solid var(--fsx-border)",
        }}
      >
        {/* Top action bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 shrink-0"
          style={{
            backgroundColor: "var(--fsx-bg-surface)",
            borderBottom: "1px solid var(--fsx-border)",
          }}
        >
          <span className="text-xs font-semibold text-white tracking-wide">
            {imageUrl ? imageName : "Image Editor"}
          </span>
          <div className="flex items-center gap-1.5">
            {imageUrl && (
              <>
                <button
                  type="button"
                  data-ocid="image_editor.before_after.toggle_button"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onMouseLeave={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                  style={{
                    backgroundColor: showOriginal
                      ? "var(--fsx-accent)"
                      : "var(--fsx-bg-elevated)",
                    color: showOriginal ? "#fff" : "var(--fsx-text-secondary)",
                    border: "1px solid var(--fsx-border)",
                  }}
                  title="Hold to compare original"
                >
                  <SplitSquareHorizontal size={12} />
                  <span className="hidden sm:inline">Before/After</span>
                </button>
                <button
                  type="button"
                  data-ocid="image_editor.reset.secondary_button"
                  onClick={resetAll}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                  style={{
                    backgroundColor: "var(--fsx-bg-elevated)",
                    color: "var(--fsx-text-secondary)",
                    border: "1px solid var(--fsx-border)",
                  }}
                  title="Reset All"
                >
                  <RefreshCw size={12} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  type="button"
                  data-ocid="image_editor.download.primary_button"
                  onClick={downloadPng}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors fsx-btn-primary"
                  title="Download PNG"
                >
                  <Download size={12} />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </>
            )}
            {imageUrl && (
              <label
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                style={{
                  backgroundColor: "var(--fsx-bg-elevated)",
                  color: "var(--fsx-text-secondary)",
                  border: "1px solid var(--fsx-border)",
                }}
                title="Replace image"
              >
                <Upload size={12} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </label>
            )}
          </div>
        </div>

        {imageUrl ? (
          <div className="px-4 pb-6 space-y-5 pt-4">
            {/* ── Filter Presets ── */}
            <section>
              <h4
                className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--fsx-text-muted)" }}
              >
                Filters
              </h4>
              <div
                data-ocid="image_editor.filters.scroll_row"
                className="flex gap-3 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "none" }}
              >
                {PRESETS.map((preset) => {
                  const active = activePreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      data-ocid={`image_editor.filter.${preset.id}`}
                      onClick={() => setActivePreset(preset)}
                      className="flex flex-col items-center gap-1.5 shrink-0 transition-all"
                    >
                      <div
                        className="w-14 h-14 rounded-xl overflow-hidden transition-all"
                        style={{
                          border: active
                            ? "2px solid var(--fsx-accent)"
                            : "2px solid transparent",
                          boxShadow: active
                            ? "0 0 0 1px var(--fsx-accent)"
                            : "none",
                          outline: active ? "none" : "none",
                        }}
                      >
                        <div
                          className="w-full h-full"
                          style={{
                            background: `linear-gradient(135deg, ${preset.thumb} 0%, ${preset.thumb}88 50%, ${preset.thumb}44 100%)`,
                            filter:
                              preset.filter !== "none"
                                ? preset.filter
                                : undefined,
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-medium leading-none"
                        style={{
                          color: active
                            ? "var(--fsx-accent)"
                            : "var(--fsx-text-muted)",
                        }}
                      >
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Rotate & Flip ── */}
            <section>
              <h4
                className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--fsx-text-muted)" }}
              >
                Transform
              </h4>
              <div className="flex flex-wrap gap-2">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    data-ocid={`image_editor.rotate_${deg}.button`}
                    onClick={() => setRotation(deg)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
                    style={{
                      backgroundColor:
                        rotation === deg
                          ? "var(--fsx-accent)"
                          : "var(--fsx-bg-elevated)",
                      color:
                        rotation === deg ? "#fff" : "var(--fsx-text-secondary)",
                      border: `1px solid ${rotation === deg ? "var(--fsx-accent)" : "var(--fsx-border)"}`,
                    }}
                  >
                    <RotateCw
                      size={12}
                      style={{ transform: `rotate(${deg}deg)` }}
                    />
                    {deg}°
                  </button>
                ))}
                <button
                  type="button"
                  data-ocid="image_editor.flip_h.button"
                  onClick={() => setFlipH((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
                  style={{
                    backgroundColor: flipH
                      ? "var(--fsx-accent)"
                      : "var(--fsx-bg-elevated)",
                    color: flipH ? "#fff" : "var(--fsx-text-secondary)",
                    border: `1px solid ${flipH ? "var(--fsx-accent)" : "var(--fsx-border)"}`,
                  }}
                >
                  <FlipHorizontal2 size={12} />
                  Flip H
                </button>
                <button
                  type="button"
                  data-ocid="image_editor.flip_v.button"
                  onClick={() => setFlipV((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
                  style={{
                    backgroundColor: flipV
                      ? "var(--fsx-accent)"
                      : "var(--fsx-bg-elevated)",
                    color: flipV ? "#fff" : "var(--fsx-text-secondary)",
                    border: `1px solid ${flipV ? "var(--fsx-accent)" : "var(--fsx-border)"}`,
                  }}
                >
                  <FlipVertical2 size={12} />
                  Flip V
                </button>
              </div>
            </section>

            {/* ── Manual Adjustments ── */}
            <section>
              <h4
                className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--fsx-text-muted)" }}
              >
                Adjustments
              </h4>
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                {SLIDER_DEFS.map((def) => (
                  <SliderControl
                    key={def.key}
                    label={def.label}
                    icon={def.icon}
                    value={adjustments[def.key]}
                    min={def.min}
                    max={def.max}
                    onChange={(v) => handleAdj(def.key, v)}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* Empty state hint */
          <div
            className="flex flex-col items-center justify-center h-[calc(100%-45px)] gap-2"
            style={{ color: "var(--fsx-text-muted)" }}
          >
            <ImageIcon size={24} style={{ opacity: 0.4 }} />
            <p className="text-xs">Load an image to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
}
