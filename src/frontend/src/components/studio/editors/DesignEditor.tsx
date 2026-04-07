import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  Italic,
  Minus,
  MousePointer,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolType =
  | "select"
  | "rect"
  | "circle"
  | "line"
  | "text"
  | "triangle"
  | "star"
  | "arrow";

type CanvasSizePreset =
  | "instagram-post"
  | "instagram-story"
  | "landscape"
  | "custom";

interface CanvasShape {
  id: string;
  type: "rect" | "circle" | "line" | "text" | "triangle" | "star" | "arrow";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  visible: boolean;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONTS = [
  "Inter",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
  "Palatino",
];

const SIZE_PRESETS: Record<
  CanvasSizePreset,
  { w: number; h: number; label: string }
> = {
  "instagram-post": { w: 1080, h: 1080, label: "Instagram Post (1:1)" },
  "instagram-story": { w: 1080, h: 1920, label: "Instagram Story (9:16)" },
  landscape: { w: 1920, h: 1080, label: "Landscape (16:9)" },
  custom: { w: 800, h: 600, label: "Custom" },
};

const SHAPE_COUNTER: Record<string, number> = {};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function shapeName(type: string): string {
  SHAPE_COUNTER[type] = (SHAPE_COUNTER[type] ?? 0) + 1;
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return `${label} ${SHAPE_COUNTER[type]}`;
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  points = 5,
) {
  const inner = 0.4;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? 1 : inner;
    ctx.lineTo(cx + rx * r * Math.cos(angle), cy + ry * r * Math.sin(angle));
  }
  ctx.closePath();
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const hw = h * 0.4;
  const sw = h * 0.25;
  const headX = x + w;
  ctx.beginPath();
  ctx.moveTo(x, y + h / 2 - sw / 2);
  ctx.lineTo(headX - hw, y + h / 2 - sw / 2);
  ctx.lineTo(headX - hw, y);
  ctx.lineTo(headX, y + h / 2);
  ctx.lineTo(headX - hw, y + h);
  ctx.lineTo(headX - hw, y + h / 2 + sw / 2);
  ctx.lineTo(x, y + h / 2 + sw / 2);
  ctx.closePath();
}

// ─── Default shapes ────────────────────────────────────────────────────────────

const DEFAULT_SHAPES: CanvasShape[] = [
  {
    id: generateId(),
    type: "rect",
    name: "Rect 1",
    x: 80,
    y: 60,
    width: 220,
    height: 130,
    fill: "#E11D2E",
    stroke: "#FFFFFF",
    strokeWidth: 0,
    opacity: 1,
    visible: true,
  },
  {
    id: generateId(),
    type: "circle",
    name: "Circle 2",
    x: 380,
    y: 100,
    width: 140,
    height: 140,
    fill: "#1f2230",
    stroke: "#E11D2E",
    strokeWidth: 3,
    opacity: 1,
    visible: true,
  },
  {
    id: generateId(),
    type: "text",
    name: "Text 3",
    x: 80,
    y: 250,
    width: 340,
    height: 40,
    fill: "transparent",
    stroke: "#FFFFFF",
    strokeWidth: 0,
    opacity: 1,
    visible: true,
    text: "FStudioX Design Canvas",
    fontSize: 28,
    fontFamily: "Inter",
    bold: true,
    italic: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DesignEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [shapes, setShapes] = useState<CanvasShape[]>(DEFAULT_SHAPES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#191B24");
  const [sizePreset, setSizePreset] = useState<CanvasSizePreset>("custom");
  const [canvasW, setCanvasW] = useState(800);
  const [canvasH, setCanvasH] = useState(600);

  const [fillColor, setFillColor] = useState("#E11D2E");
  const [strokeColor, setStrokeColor] = useState("#FFFFFF");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(100);

  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(24);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPos, setTextPos] = useState({ x: 0, y: 0 });

  const [history, setHistory] = useState<CanvasShape[][]>([DEFAULT_SHAPES]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const selectedShape = shapes.find((s) => s.id === selectedId);

  // ── Sync controls when selection changes ──────────────────────────────────
  useEffect(() => {
    const sel = shapes.find((s) => s.id === selectedId);
    if (sel) {
      setFillColor(sel.fill === "transparent" ? "#000000" : sel.fill);
      setStrokeColor(sel.stroke === "transparent" ? "#000000" : sel.stroke);
      setStrokeWidth(sel.strokeWidth);
      setOpacity(Math.round(sel.opacity * 100));
      if (sel.fontFamily) setFontFamily(sel.fontFamily);
      if (sel.fontSize) setFontSize(sel.fontSize);
      setBold(sel.bold ?? false);
      setItalic(sel.italic ?? false);
    }
  }, [selectedId, shapes]);

  // ── History helpers ──────────────────────────────────────────────────────
  const pushHistory = useCallback(
    (next: CanvasShape[]) => {
      setHistory((h) => [...h.slice(0, historyIdx + 1), next]);
      setHistoryIdx((i) => i + 1);
    },
    [historyIdx],
  );

  const undo = () => {
    if (historyIdx <= 0) return;
    const prev = history[historyIdx - 1];
    setShapes(prev);
    setHistoryIdx((i) => i - 1);
    setSelectedId(null);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const next = history[historyIdx + 1];
    setShapes(next);
    setHistoryIdx((i) => i + 1);
    setSelectedId(null);
  };

  const commit = (next: CanvasShape[]) => {
    setShapes(next);
    pushHistory(next);
  };

  // ── Canvas draw ──────────────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    for (const shape of shapes) {
      if (!shape.visible) continue;
      ctx.save();
      ctx.globalAlpha = shape.opacity;
      const fill = shape.fill === "transparent" ? "rgba(0,0,0,0)" : shape.fill;
      const stroke =
        shape.stroke === "transparent" ? "rgba(0,0,0,0)" : shape.stroke;
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = shape.strokeWidth;

      if (shape.type === "rect") {
        ctx.beginPath();
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
        if (shape.fill !== "transparent") ctx.fill();
        if (shape.strokeWidth > 0) ctx.stroke();
      } else if (shape.type === "circle") {
        ctx.beginPath();
        ctx.ellipse(
          shape.x + shape.width / 2,
          shape.y + shape.height / 2,
          shape.width / 2,
          shape.height / 2,
          0,
          0,
          Math.PI * 2,
        );
        if (shape.fill !== "transparent") ctx.fill();
        if (shape.strokeWidth > 0) ctx.stroke();
      } else if (shape.type === "line") {
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        ctx.lineWidth = Math.max(shape.strokeWidth, 1);
        ctx.strokeStyle =
          shape.stroke !== "transparent" ? shape.stroke : "#FFFFFF";
        ctx.stroke();
      } else if (shape.type === "text" && shape.text) {
        const weight = shape.bold ? "bold" : "normal";
        const style = shape.italic ? "italic" : "normal";
        ctx.font = `${style} ${weight} ${shape.fontSize ?? 20}px ${shape.fontFamily ?? "Inter"}, sans-serif`;
        ctx.fillStyle =
          shape.stroke !== "transparent" ? shape.stroke : "#FFFFFF";
        ctx.fillText(shape.text, shape.x, shape.y + (shape.fontSize ?? 20));
      } else if (shape.type === "triangle") {
        drawTriangle(ctx, shape.x, shape.y, shape.width, shape.height);
        if (shape.fill !== "transparent") ctx.fill();
        if (shape.strokeWidth > 0) ctx.stroke();
      } else if (shape.type === "star") {
        drawStar(
          ctx,
          shape.x + shape.width / 2,
          shape.y + shape.height / 2,
          shape.width / 2,
          shape.height / 2,
        );
        if (shape.fill !== "transparent") ctx.fill();
        if (shape.strokeWidth > 0) ctx.stroke();
      } else if (shape.type === "arrow") {
        drawArrow(ctx, shape.x, shape.y, shape.width, shape.height);
        if (shape.fill !== "transparent") ctx.fill();
        if (shape.strokeWidth > 0) ctx.stroke();
      }

      if (shape.id === selectedId) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#E11D2E";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(
          shape.x - 4,
          shape.y - 4,
          shape.width + 8,
          shape.height + 8,
        );
        ctx.setLineDash([]);
        // Handle squares
        const hx = [
          shape.x - 4,
          shape.x + shape.width / 2 - 3,
          shape.x + shape.width,
        ];
        const hy = [
          shape.y - 4,
          shape.y + shape.height / 2 - 3,
          shape.y + shape.height,
        ];
        ctx.fillStyle = "#E11D2E";
        for (const hxx of hx)
          for (const hyy of hy) {
            ctx.fillRect(hxx, hyy, 6, 6);
          }
      }

      ctx.restore();
    }
  }, [shapes, selectedId, bgColor, canvasW, canvasH]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // ── Canvas interaction ────────────────────────────────────────────────────
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasW / rect.width;
    const scaleY = canvasH / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    if (activeTool === "select") {
      const hit = [...shapes]
        .reverse()
        .find(
          (s) =>
            s.visible &&
            pos.x >= s.x &&
            pos.x <= s.x + s.width &&
            pos.y >= s.y &&
            pos.y <= s.y + s.height,
        );
      setSelectedId(hit?.id ?? null);
      return;
    }

    if (activeTool === "text") {
      setTextPos(pos);
      setShowTextInput(true);
      return;
    }

    setIsDrawing(true);
    setDrawStart(pos);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pos = getCanvasPos(e);
    const dx = pos.x - drawStart.x;
    const dy = pos.y - drawStart.y;
    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;

    const type = activeTool as CanvasShape["type"];
    const newShape: CanvasShape = {
      id: generateId(),
      type,
      name: shapeName(type),
      x: activeTool === "line" ? drawStart.x : Math.min(drawStart.x, pos.x),
      y: activeTool === "line" ? drawStart.y : Math.min(drawStart.y, pos.y),
      width: activeTool === "line" ? dx : Math.abs(dx),
      height: activeTool === "line" ? dy : Math.abs(dy),
      fill: activeTool === "line" ? "transparent" : fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity: opacity / 100,
      visible: true,
    };
    const next = [...shapes, newShape];
    commit(next);
    setSelectedId(newShape.id);
  };

  const addText = () => {
    if (!textInput.trim()) return;
    const newShape: CanvasShape = {
      id: generateId(),
      type: "text",
      name: shapeName("text"),
      x: textPos.x,
      y: textPos.y,
      width: 300,
      height: fontSize + 8,
      fill: "transparent",
      stroke: fillColor,
      strokeWidth: 0,
      opacity: 1,
      visible: true,
      text: textInput,
      fontSize,
      fontFamily,
      bold,
      italic,
    };
    const next = [...shapes, newShape];
    commit(next);
    setSelectedId(newShape.id);
    setTextInput("");
    setShowTextInput(false);
  };

  // ── Shape mutations ───────────────────────────────────────────────────────
  const updateSelected = (patch: Partial<CanvasShape>) => {
    if (!selectedId) return;
    const next = shapes.map((s) =>
      s.id === selectedId ? { ...s, ...patch } : s,
    );
    commit(next);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const next = shapes.filter((s) => s.id !== selectedId);
    commit(next);
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selectedShape) return;
    const copy: CanvasShape = {
      ...selectedShape,
      id: generateId(),
      name: `${selectedShape.name} copy`,
      x: selectedShape.x + 20,
      y: selectedShape.y + 20,
    };
    const next = [...shapes, copy];
    commit(next);
    setSelectedId(copy.id);
  };

  const bringToFront = () => {
    if (!selectedId) return;
    const s = shapes.find((x) => x.id === selectedId)!;
    const rest = shapes.filter((x) => x.id !== selectedId);
    commit([...rest, s]);
  };

  const sendToBack = () => {
    if (!selectedId) return;
    const s = shapes.find((x) => x.id === selectedId)!;
    const rest = shapes.filter((x) => x.id !== selectedId);
    commit([s, ...rest]);
  };

  const moveLayer = (dir: "up" | "down") => {
    if (!selectedId) return;
    const arr = [...shapes];
    const idx = arr.findIndex((s) => s.id === selectedId);
    if (dir === "up" && idx < arr.length - 1)
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    if (dir === "down" && idx > 0)
      [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
    commit(arr);
  };

  const toggleVisibility = (id: string) => {
    const next = shapes.map((s) =>
      s.id === id ? { ...s, visible: !s.visible } : s,
    );
    commit(next);
  };

  const alignShape = (
    axis: "left" | "center" | "right" | "top" | "middle" | "bottom",
  ) => {
    if (!selectedShape) return;
    let patch: Partial<CanvasShape> = {};
    if (axis === "left") patch = { x: 0 };
    else if (axis === "center")
      patch = { x: (canvasW - selectedShape.width) / 2 };
    else if (axis === "right") patch = { x: canvasW - selectedShape.width };
    else if (axis === "top") patch = { y: 0 };
    else if (axis === "middle")
      patch = { y: (canvasH - selectedShape.height) / 2 };
    else if (axis === "bottom") patch = { y: canvasH - selectedShape.height };
    updateSelected(patch);
  };

  const clearAll = () => {
    commit([]);
    setSelectedId(null);
    setShowClearConfirm(false);
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "fstudiox-design.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const applyPreset = (preset: CanvasSizePreset) => {
    setSizePreset(preset);
    if (preset !== "custom") {
      setCanvasW(SIZE_PRESETS[preset].w);
      setCanvasH(SIZE_PRESETS[preset].h);
    }
  };

  // ── Tool icons (inline SVG for missing lucide icons) ───────────────────────
  const toolDefs: { id: ToolType; label: string; icon: React.ReactNode }[] = [
    { id: "select", label: "Select", icon: <MousePointer size={15} /> },
    { id: "rect", label: "Rectangle", icon: <Square size={15} /> },
    {
      id: "circle",
      label: "Circle",
      icon: (
        <svg
          role="img"
          aria-label="Circle"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <title>Circle</title>
          <circle
            cx="7.5"
            cy="7.5"
            r="6.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    { id: "line", label: "Line", icon: <Minus size={15} /> },
    { id: "text", label: "Text", icon: <Type size={15} /> },
    {
      id: "triangle",
      label: "Triangle",
      icon: (
        <svg
          role="img"
          aria-label="Triangle"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <title>Triangle</title>
          <path
            d="M7.5 2L14 13H1L7.5 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    {
      id: "star",
      label: "Star",
      icon: (
        <svg
          role="img"
          aria-label="Star"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <title>Star</title>
          <path
            d="M7.5 1l1.73 3.51 3.87.56-2.8 2.73.66 3.85L7.5 9.76l-3.46 1.82.66-3.85L1.9 5l3.87-.56L7.5 1z"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
      ),
    },
    {
      id: "arrow",
      label: "Arrow",
      icon: (
        <svg
          role="img"
          aria-label="Arrow"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <title>Arrow</title>
          <path
            d="M2 7.5h9M8 4l4 3.5-4 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  // ── Section header helper ──────────────────────────────────────────────────
  const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <div
      className="text-xs font-semibold uppercase tracking-widest px-1 pb-2 pt-1"
      style={{
        color: "var(--fsx-text-muted)",
        borderBottom: "1px solid var(--fsx-border)",
        marginBottom: "10px",
      }}
    >
      {children}
    </div>
  );

  const ControlRow = ({
    label,
    children,
  }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-2">
      <span
        className="text-xs shrink-0"
        style={{ color: "var(--fsx-text-secondary)", minWidth: "72px" }}
      >
        {label}
      </span>
      <div className="flex-1 flex items-center justify-end gap-2">
        {children}
      </div>
    </div>
  );

  const isTextActive = activeTool === "text" || selectedShape?.type === "text";

  return (
    <div
      data-ocid="design_editor.panel"
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: "var(--fsx-bg-primary)" }}
    >
      {/* ── Top 50%: Canvas preview ────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{
          height: "50%",
          backgroundColor: "#0d0e14",
          borderBottom: "2px solid var(--fsx-border)",
        }}
      >
        {/* Toolbar: undo/redo/download/clear */}
        <div className="absolute top-2 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            data-ocid="design_editor.undo.button"
            onClick={undo}
            disabled={historyIdx <= 0}
            title="Undo"
            className="w-7 h-7 flex items-center justify-center rounded-md transition-all disabled:opacity-30"
            style={{
              backgroundColor: "var(--fsx-bg-elevated)",
              color: "var(--fsx-text-secondary)",
            }}
          >
            <Undo2 size={13} />
          </button>
          <button
            type="button"
            data-ocid="design_editor.redo.button"
            onClick={redo}
            disabled={historyIdx >= history.length - 1}
            title="Redo"
            className="w-7 h-7 flex items-center justify-center rounded-md transition-all disabled:opacity-30"
            style={{
              backgroundColor: "var(--fsx-bg-elevated)",
              color: "var(--fsx-text-secondary)",
            }}
          >
            <Redo2 size={13} />
          </button>
          <button
            type="button"
            data-ocid="design_editor.download.button"
            onClick={downloadPng}
            title="Download PNG"
            className="flex items-center gap-1 px-2 h-7 rounded-md text-xs font-medium transition-all"
            style={{ backgroundColor: "var(--fsx-accent)", color: "white" }}
          >
            <Download size={12} /> PNG
          </button>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative"
          style={{
            maxWidth: "calc(100% - 16px)",
            maxHeight: "calc(100% - 16px)",
          }}
        >
          {showTextInput && (
            <div
              className="absolute z-20 flex gap-1"
              style={{
                left:
                  (textPos.x *
                    (canvasRef.current?.getBoundingClientRect().width ??
                      canvasW)) /
                  canvasW,
                top:
                  (textPos.y *
                    (canvasRef.current?.getBoundingClientRect().height ??
                      canvasH)) /
                  canvasH,
              }}
            >
              <input
                data-ocid="design_editor.text.input"
                ref={(el) => el?.focus()}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addText();
                  if (e.key === "Escape") setShowTextInput(false);
                }}
                className="px-2 py-1 text-xs rounded outline-none"
                style={{
                  backgroundColor: "var(--fsx-bg-surface)",
                  border: "1px solid var(--fsx-accent)",
                  color: "white",
                  minWidth: "140px",
                }}
                placeholder="Type and press Enter…"
              />
              <button
                type="button"
                data-ocid="design_editor.text.submit_button"
                onClick={addText}
                className="px-2 py-1 text-xs rounded font-medium text-white"
                style={{ backgroundColor: "var(--fsx-accent)" }}
              >
                Add
              </button>
            </div>
          )}
          <canvas
            data-ocid="design_editor.canvas_target"
            ref={canvasRef}
            width={canvasW}
            height={canvasH}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{
              cursor: activeTool === "select" ? "default" : "crosshair",
              border: "1px solid var(--fsx-border)",
              borderRadius: "8px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              maxWidth: "100%",
              maxHeight: "calc(50vh - 40px)",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Canvas size label */}
        <div
          className="absolute bottom-2 left-3 text-xs font-mono"
          style={{ color: "var(--fsx-text-muted)" }}
        >
          {canvasW}×{canvasH} · {SIZE_PRESETS[sizePreset].label}
        </div>
      </div>

      {/* ── Bottom 50%: Controls (scrollable) ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ height: "50%" }}>
        {/* Tool palette */}
        <div
          className="sticky top-0 z-10 px-3 py-2 flex items-center gap-1.5 flex-wrap"
          style={{
            backgroundColor: "var(--fsx-bg-surface)",
            borderBottom: "1px solid var(--fsx-border)",
          }}
        >
          {toolDefs.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              data-ocid={`design_editor.tool.${id}`}
              title={label}
              onClick={() => setActiveTool(id)}
              className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor:
                  activeTool === id
                    ? "rgba(225,29,46,0.18)"
                    : "var(--fsx-bg-elevated)",
                color:
                  activeTool === id
                    ? "var(--fsx-accent)"
                    : "var(--fsx-text-secondary)",
                border:
                  activeTool === id
                    ? "1px solid rgba(225,29,46,0.4)"
                    : "1px solid var(--fsx-border)",
              }}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* ── Colors & Stroke ── */}
          <div className="space-y-3">
            <SectionHeader>Colors &amp; Stroke</SectionHeader>

            <ControlRow label="Fill">
              <input
                data-ocid="design_editor.fill_color.input"
                type="color"
                value={fillColor}
                onChange={(e) => {
                  setFillColor(e.target.value);
                  updateSelected({ fill: e.target.value });
                }}
                className="w-8 h-8 rounded-md cursor-pointer border-0"
                style={{ backgroundColor: "transparent" }}
              />
              <span
                className="text-xs font-mono"
                style={{ color: "var(--fsx-text-muted)" }}
              >
                {fillColor}
              </span>
            </ControlRow>

            <ControlRow label="Stroke">
              <input
                data-ocid="design_editor.stroke_color.input"
                type="color"
                value={strokeColor}
                onChange={(e) => {
                  setStrokeColor(e.target.value);
                  updateSelected({ stroke: e.target.value });
                }}
                className="w-8 h-8 rounded-md cursor-pointer border-0"
                style={{ backgroundColor: "transparent" }}
              />
              <span
                className="text-xs font-mono"
                style={{ color: "var(--fsx-text-muted)" }}
              >
                {strokeColor}
              </span>
            </ControlRow>

            <div className="space-y-1.5">
              <ControlRow label="Stroke W">
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--fsx-accent)" }}
                >
                  {strokeWidth}px
                </span>
              </ControlRow>
              <input
                data-ocid="design_editor.stroke_width.input"
                type="range"
                min={0}
                max={20}
                value={strokeWidth}
                onChange={(e) => {
                  setStrokeWidth(Number(e.target.value));
                  updateSelected({ strokeWidth: Number(e.target.value) });
                }}
                className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
                style={{ accentColor: "var(--fsx-accent)" }}
              />
            </div>

            <div className="space-y-1.5">
              <ControlRow label="Opacity">
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--fsx-accent)" }}
                >
                  {opacity}%
                </span>
              </ControlRow>
              <input
                data-ocid="design_editor.opacity.input"
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => {
                  setOpacity(Number(e.target.value));
                  updateSelected({ opacity: Number(e.target.value) / 100 });
                }}
                className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
                style={{ accentColor: "var(--fsx-accent)" }}
              />
            </div>

            <ControlRow label="Background">
              <input
                data-ocid="design_editor.bg_color.input"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-md cursor-pointer border-0"
                style={{ backgroundColor: "transparent" }}
              />
              <span
                className="text-xs font-mono"
                style={{ color: "var(--fsx-text-muted)" }}
              >
                Canvas BG
              </span>
            </ControlRow>
          </div>

          {/* ── Text & Font ── */}
          <div className="space-y-3">
            <SectionHeader>
              Text &amp; Font
              {!isTextActive && (
                <span
                  className="normal-case font-normal ml-1"
                  style={{ color: "var(--fsx-text-muted)" }}
                >
                  (select text layer)
                </span>
              )}
            </SectionHeader>

            <div className="space-y-1">
              <span
                className="text-xs"
                style={{ color: "var(--fsx-text-secondary)" }}
              >
                Font Family
              </span>
              <select
                data-ocid="design_editor.font_family.select"
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  updateSelected({ fontFamily: e.target.value });
                }}
                disabled={!isTextActive}
                className="w-full px-2 py-1.5 rounded-lg text-xs outline-none disabled:opacity-40"
                style={{
                  backgroundColor: "var(--fsx-bg-elevated)",
                  border: "1px solid var(--fsx-border)",
                  color: "white",
                }}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <ControlRow label="Size">
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--fsx-accent)" }}
                >
                  {fontSize}px
                </span>
              </ControlRow>
              <input
                data-ocid="design_editor.font_size.input"
                type="range"
                min={8}
                max={200}
                value={fontSize}
                disabled={!isTextActive}
                onChange={(e) => {
                  setFontSize(Number(e.target.value));
                  updateSelected({ fontSize: Number(e.target.value) });
                }}
                className="w-full h-1.5 appearance-none rounded-full cursor-pointer disabled:opacity-40"
                style={{ accentColor: "var(--fsx-accent)" }}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="design_editor.bold.toggle"
                disabled={!isTextActive}
                onClick={() => {
                  const next = !bold;
                  setBold(next);
                  updateSelected({ bold: next });
                }}
                className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                style={{
                  backgroundColor: bold
                    ? "rgba(225,29,46,0.18)"
                    : "var(--fsx-bg-elevated)",
                  border: bold
                    ? "1px solid rgba(225,29,46,0.4)"
                    : "1px solid var(--fsx-border)",
                  color: bold
                    ? "var(--fsx-accent)"
                    : "var(--fsx-text-secondary)",
                }}
              >
                <Bold size={13} /> Bold
              </button>
              <button
                type="button"
                data-ocid="design_editor.italic.toggle"
                disabled={!isTextActive}
                onClick={() => {
                  const next = !italic;
                  setItalic(next);
                  updateSelected({ italic: next });
                }}
                className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                style={{
                  backgroundColor: italic
                    ? "rgba(225,29,46,0.18)"
                    : "var(--fsx-bg-elevated)",
                  border: italic
                    ? "1px solid rgba(225,29,46,0.4)"
                    : "1px solid var(--fsx-border)",
                  color: italic
                    ? "var(--fsx-accent)"
                    : "var(--fsx-text-secondary)",
                }}
              >
                <Italic size={13} /> Italic
              </button>
            </div>
          </div>

          {/* ── Actions & Alignment ── */}
          <div className="space-y-3">
            <SectionHeader>Shape Actions</SectionHeader>

            {selectedShape ? (
              <>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    {
                      label: "Bring Front",
                      fn: bringToFront,
                      ocid: "bring_front",
                    },
                    { label: "Send Back", fn: sendToBack, ocid: "send_back" },
                    {
                      label: "Move Up",
                      fn: () => moveLayer("up"),
                      ocid: "move_up",
                    },
                    {
                      label: "Move Down",
                      fn: () => moveLayer("down"),
                      ocid: "move_down",
                    },
                  ].map(({ label, fn, ocid }) => (
                    <button
                      key={label}
                      type="button"
                      data-ocid={`design_editor.${ocid}.button`}
                      onClick={fn}
                      className="flex items-center justify-center gap-1 h-8 rounded-lg text-xs transition-all"
                      style={{
                        backgroundColor: "var(--fsx-bg-elevated)",
                        border: "1px solid var(--fsx-border)",
                        color: "var(--fsx-text-secondary)",
                      }}
                    >
                      {label === "Bring Front" && <ChevronUp size={12} />}
                      {label === "Send Back" && <ChevronDown size={12} />}
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    data-ocid="design_editor.duplicate.button"
                    onClick={duplicateSelected}
                    className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg text-xs transition-all"
                    style={{
                      backgroundColor: "var(--fsx-bg-elevated)",
                      border: "1px solid var(--fsx-border)",
                      color: "var(--fsx-text-secondary)",
                    }}
                  >
                    <Copy size={12} /> Duplicate
                  </button>
                  <button
                    type="button"
                    data-ocid="design_editor.delete.button"
                    onClick={deleteSelected}
                    className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg text-xs transition-all"
                    style={{
                      backgroundColor: "rgba(225,29,46,0.1)",
                      border: "1px solid rgba(225,29,46,0.3)",
                      color: "var(--fsx-accent)",
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>

                <SectionHeader>Alignment</SectionHeader>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    {
                      label: "Left",
                      id: "left" as const,
                      icon: <AlignLeft size={13} />,
                    },
                    {
                      label: "Center",
                      id: "center" as const,
                      icon: <AlignCenter size={13} />,
                    },
                    {
                      label: "Right",
                      id: "right" as const,
                      icon: <AlignRight size={13} />,
                    },
                    {
                      label: "Top",
                      id: "top" as const,
                      icon: <ChevronUp size={13} />,
                    },
                    {
                      label: "Middle",
                      id: "middle" as const,
                      icon: <AlignCenter size={13} />,
                    },
                    {
                      label: "Bottom",
                      id: "bottom" as const,
                      icon: <ChevronDown size={13} />,
                    },
                  ].map(({ label, id, icon }) => (
                    <button
                      key={id}
                      type="button"
                      data-ocid={`design_editor.align_${id}.button`}
                      onClick={() => alignShape(id)}
                      title={`Align ${label}`}
                      className="flex items-center justify-center gap-1 h-8 rounded-lg text-xs transition-all"
                      style={{
                        backgroundColor: "var(--fsx-bg-elevated)",
                        border: "1px solid var(--fsx-border)",
                        color: "var(--fsx-text-secondary)",
                      }}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p
                className="text-xs py-2 px-1"
                style={{ color: "var(--fsx-text-muted)" }}
              >
                Select a shape to see actions.
              </p>
            )}
          </div>

          {/* ── Canvas Settings ── */}
          <div className="space-y-3">
            <SectionHeader>Canvas Size</SectionHeader>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(SIZE_PRESETS) as CanvasSizePreset[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  data-ocid={`design_editor.preset_${key}.button`}
                  onClick={() => applyPreset(key)}
                  className="px-2 h-8 rounded-lg text-xs transition-all text-left truncate"
                  style={{
                    backgroundColor:
                      sizePreset === key
                        ? "rgba(225,29,46,0.18)"
                        : "var(--fsx-bg-elevated)",
                    border:
                      sizePreset === key
                        ? "1px solid rgba(225,29,46,0.4)"
                        : "1px solid var(--fsx-border)",
                    color:
                      sizePreset === key
                        ? "var(--fsx-accent)"
                        : "var(--fsx-text-secondary)",
                  }}
                >
                  {SIZE_PRESETS[key].label}
                </button>
              ))}
            </div>
            {sizePreset === "custom" && (
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--fsx-text-secondary)" }}
                  >
                    Width
                  </span>
                  <input
                    data-ocid="design_editor.canvas_w.input"
                    type="number"
                    min={100}
                    max={4000}
                    value={canvasW}
                    onChange={(e) => setCanvasW(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg text-xs outline-none"
                    style={{
                      backgroundColor: "var(--fsx-bg-elevated)",
                      border: "1px solid var(--fsx-border)",
                      color: "white",
                    }}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--fsx-text-secondary)" }}
                  >
                    Height
                  </span>
                  <input
                    data-ocid="design_editor.canvas_h.input"
                    type="number"
                    min={100}
                    max={4000}
                    value={canvasH}
                    onChange={(e) => setCanvasH(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg text-xs outline-none"
                    style={{
                      backgroundColor: "var(--fsx-bg-elevated)",
                      border: "1px solid var(--fsx-border)",
                      color: "white",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Layers Panel ── */}
          <div className="space-y-3 md:col-span-2 xl:col-span-2">
            <SectionHeader>
              Layers ({shapes.length})
              <button
                type="button"
                data-ocid="design_editor.clear_all.button"
                onClick={() => setShowClearConfirm(true)}
                className="ml-2 px-2 py-0.5 rounded text-xs normal-case font-medium transition-all"
                style={{
                  backgroundColor: "rgba(225,29,46,0.1)",
                  border: "1px solid rgba(225,29,46,0.25)",
                  color: "var(--fsx-accent)",
                }}
              >
                Clear All
              </button>
            </SectionHeader>

            {showClearConfirm && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{
                  backgroundColor: "rgba(225,29,46,0.08)",
                  border: "1px solid rgba(225,29,46,0.25)",
                }}
              >
                <span style={{ color: "var(--fsx-text-secondary)" }}>
                  Delete all shapes?
                </span>
                <button
                  type="button"
                  data-ocid="design_editor.clear_confirm.button"
                  onClick={clearAll}
                  className="px-2 py-0.5 rounded font-semibold"
                  style={{
                    backgroundColor: "var(--fsx-accent)",
                    color: "white",
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  data-ocid="design_editor.clear_cancel.button"
                  onClick={() => setShowClearConfirm(false)}
                  style={{ color: "var(--fsx-text-muted)" }}
                >
                  Cancel
                </button>
              </div>
            )}

            {shapes.length === 0 ? (
              <p
                className="text-xs py-2 px-1"
                style={{ color: "var(--fsx-text-muted)" }}
              >
                No layers yet. Draw a shape!
              </p>
            ) : (
              <div className="space-y-1">
                {[...shapes].reverse().map((shape, i) => (
                  <button
                    type="button"
                    key={shape.id}
                    data-ocid={`design_editor.layer.item.${i + 1}`}
                    aria-label={`Select layer ${shape.name}`}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all"
                    style={{
                      backgroundColor:
                        selectedId === shape.id
                          ? "rgba(225,29,46,0.12)"
                          : "var(--fsx-bg-elevated)",
                      border:
                        selectedId === shape.id
                          ? "1px solid rgba(225,29,46,0.3)"
                          : "1px solid var(--fsx-border)",
                      opacity: shape.visible ? 1 : 0.45,
                    }}
                    onClick={() => setSelectedId(shape.id)}
                  >
                    {/* Color swatch */}
                    <div
                      className="w-4 h-4 rounded shrink-0"
                      style={{
                        backgroundColor:
                          shape.fill === "transparent"
                            ? shape.stroke
                            : shape.fill,
                        border: "1px solid var(--fsx-border)",
                      }}
                    />
                    {/* Name */}
                    <span
                      className="flex-1 text-xs truncate"
                      style={{
                        color:
                          selectedId === shape.id
                            ? "white"
                            : "var(--fsx-text-secondary)",
                      }}
                    >
                      {shape.name}
                      {shape.text ? ` — "${shape.text.slice(0, 14)}"` : ""}
                    </span>
                    {/* Visibility toggle */}
                    <button
                      type="button"
                      data-ocid={`design_editor.layer.visibility.${i + 1}`}
                      title={shape.visible ? "Hide" : "Show"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(shape.id);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded shrink-0 transition-all"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      {shape.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    {/* Delete */}
                    <button
                      type="button"
                      data-ocid={`design_editor.layer.delete.${i + 1}`}
                      title="Delete layer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = shapes.filter((s) => s.id !== shape.id);
                        commit(next);
                        if (selectedId === shape.id) setSelectedId(null);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded shrink-0 transition-all"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
