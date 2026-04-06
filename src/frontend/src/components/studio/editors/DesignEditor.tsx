import {
  ChevronDown,
  ChevronUp,
  Circle,
  ImageIcon,
  Minus,
  MousePointer,
  Square,
  Trash2,
  Type,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ShapeType = "select" | "rect" | "circle" | "line" | "text" | "image";

interface CanvasShape {
  id: string;
  type: "rect" | "circle" | "line" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
}

const CANVAS_W = 800;
const CANVAS_H = 500;

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function DesignEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<ShapeType>("select");
  const [shapes, setShapes] = useState<CanvasShape[]>([
    {
      id: generateId(),
      type: "rect",
      x: 100,
      y: 80,
      width: 200,
      height: 120,
      fillColor: "#E11D2E",
      strokeColor: "#FFFFFF",
      strokeWidth: 0,
      text: undefined,
    },
    {
      id: generateId(),
      type: "circle",
      x: 400,
      y: 150,
      width: 120,
      height: 120,
      fillColor: "#1F2230",
      strokeColor: "#E11D2E",
      strokeWidth: 2,
    },
    {
      id: generateId(),
      type: "text",
      x: 80,
      y: 280,
      width: 300,
      height: 40,
      fillColor: "transparent",
      strokeColor: "transparent",
      strokeWidth: 0,
      text: "FStudioX Design Canvas",
      fontSize: 24,
    },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fillColor, setFillColor] = useState("#E11D2E");
  const [strokeColor, setStrokeColor] = useState("#FFFFFF");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPos, setTextPos] = useState({ x: 0, y: 0 });

  const selectedShape = shapes.find((s) => s.id === selectedId);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = "#191B24";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (const shape of shapes) {
      ctx.save();
      ctx.fillStyle =
        shape.fillColor === "transparent" ? "rgba(0,0,0,0)" : shape.fillColor;
      ctx.strokeStyle =
        shape.strokeColor === "transparent"
          ? "rgba(0,0,0,0)"
          : shape.strokeColor;
      ctx.lineWidth = shape.strokeWidth;

      if (shape.type === "rect") {
        ctx.beginPath();
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
        if (shape.fillColor !== "transparent") ctx.fill();
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
        if (shape.fillColor !== "transparent") ctx.fill();
        if (shape.strokeWidth > 0) ctx.stroke();
      } else if (shape.type === "line") {
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        ctx.lineWidth = Math.max(shape.strokeWidth, 1);
        ctx.strokeStyle =
          shape.strokeColor !== "transparent" ? shape.strokeColor : "#FFFFFF";
        ctx.stroke();
      } else if (shape.type === "text" && shape.text) {
        ctx.fillStyle =
          shape.strokeColor !== "transparent" ? shape.strokeColor : "#FFFFFF";
        ctx.font = `${shape.fontSize || 18}px Inter, sans-serif`;
        ctx.fillText(shape.text, shape.x, shape.y + (shape.fontSize || 18));
      }

      // Selection indicator
      if (shape.id === selectedId) {
        ctx.strokeStyle = "#E11D2E";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(
          shape.x - 3,
          shape.y - 3,
          shape.width + 6,
          shape.height + 6,
        );
        ctx.setLineDash([]);
      }

      ctx.restore();
    }
  }, [shapes, selectedId]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    if (activeTool === "select") {
      const hit = [...shapes]
        .reverse()
        .find(
          (s) =>
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

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pos = getCanvasPos(e);
    const dx = pos.x - drawStart.x;
    const dy = pos.y - drawStart.y;

    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;

    const newShape: CanvasShape = {
      id: generateId(),
      type: activeTool as "rect" | "circle" | "line",
      x: Math.min(drawStart.x, pos.x),
      y: Math.min(drawStart.y, pos.y),
      width: Math.abs(dx),
      height: activeTool === "line" ? dy : Math.abs(dy),
      fillColor: activeTool === "line" ? "transparent" : fillColor,
      strokeColor,
      strokeWidth,
    };
    setShapes((prev) => [...prev, newShape]);
    setSelectedId(newShape.id);
  };

  const addText = () => {
    if (!textInput.trim()) return;
    const newShape: CanvasShape = {
      id: generateId(),
      type: "text",
      x: textPos.x,
      y: textPos.y,
      width: 200,
      height: 30,
      fillColor: "transparent",
      strokeColor: fillColor,
      strokeWidth: 0,
      text: textInput,
      fontSize: 20,
    };
    setShapes((prev) => [...prev, newShape]);
    setSelectedId(newShape.id);
    setTextInput("");
    setShowTextInput(false);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setShapes((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  };

  const moveSelected = (dir: "up" | "down") => {
    if (!selectedId) return;
    setShapes((prev) => {
      const idx = prev.findIndex((s) => s.id === selectedId);
      if (idx < 0) return prev;
      const arr = [...prev];
      if (dir === "up" && idx < arr.length - 1)
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      if (dir === "down" && idx > 0)
        [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
      return arr;
    });
  };

  const toolButtons: {
    id: ShapeType;
    icon: React.ElementType;
    label: string;
  }[] = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "text", icon: Type, label: "Text" },
    { id: "image", icon: ImageIcon, label: "Image" },
  ];

  return (
    <div
      data-ocid="design_editor.panel"
      className="flex h-full overflow-hidden"
      style={{ backgroundColor: "var(--fsx-bg-primary)" }}
    >
      {/* Left Toolbox */}
      <div
        className="w-14 shrink-0 border-r flex flex-col items-center py-4 gap-2"
        style={{
          backgroundColor: "var(--fsx-bg-surface)",
          borderColor: "var(--fsx-border)",
        }}
      >
        {toolButtons.map(({ id, icon: Icon, label }) => (
          <button
            type="button"
            key={id}
            data-ocid={`design_editor.${id}.toggle`}
            title={label}
            onClick={() => setActiveTool(id)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{
              backgroundColor:
                activeTool === id ? "rgba(225,29,46,0.15)" : "transparent",
              color:
                activeTool === id
                  ? "var(--fsx-accent)"
                  : "var(--fsx-text-muted)",
              border:
                activeTool === id
                  ? "1px solid rgba(225,29,46,0.3)"
                  : "1px solid transparent",
            }}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6">
        <div className="relative">
          {showTextInput && (
            <div
              className="absolute z-10 flex gap-2"
              style={{
                left:
                  (textPos.x *
                    (canvasRef.current?.getBoundingClientRect().width ??
                      CANVAS_W)) /
                  CANVAS_W,
                top:
                  (textPos.y *
                    (canvasRef.current?.getBoundingClientRect().height ??
                      CANVAS_H)) /
                  CANVAS_H,
              }}
            >
              <input
                data-ocid="design_editor.text.input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addText();
                  if (e.key === "Escape") setShowTextInput(false);
                }}
                className="px-2 py-1 text-sm border rounded outline-none"
                style={{
                  backgroundColor: "var(--fsx-bg-surface)",
                  borderColor: "var(--fsx-accent)",
                  color: "white",
                }}
                placeholder="Type text..."
              />
              <button
                type="button"
                data-ocid="design_editor.text.submit_button"
                onClick={addText}
                className="px-2 py-1 text-xs rounded text-white"
                style={{ backgroundColor: "var(--fsx-accent)" }}
              >
                Add
              </button>
            </div>
          )}
          <canvas
            data-ocid="design_editor.canvas_target"
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            className="rounded-xl"
            style={{
              cursor: activeTool === "select" ? "default" : "crosshair",
              border: "1px solid var(--fsx-border)",
              maxWidth: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      </div>

      {/* Right Panel: Properties */}
      <aside
        className="w-60 shrink-0 border-l p-4 flex flex-col gap-4 overflow-y-auto"
        style={{
          backgroundColor: "var(--fsx-bg-surface)",
          borderColor: "var(--fsx-border)",
        }}
      >
        <h3 className="text-sm font-semibold text-white">Properties</h3>

        {/* Color controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span
              className="text-xs"
              style={{ color: "var(--fsx-text-secondary)" }}
            >
              Fill
            </span>
            <input
              data-ocid="design_editor.fill_color.input"
              type="color"
              value={fillColor}
              onChange={(e) => {
                setFillColor(e.target.value);
                if (selectedId)
                  setShapes((prev) =>
                    prev.map((s) =>
                      s.id === selectedId
                        ? { ...s, fillColor: e.target.value }
                        : s,
                    ),
                  );
              }}
              className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between">
            <span
              className="text-xs"
              style={{ color: "var(--fsx-text-secondary)" }}
            >
              Stroke
            </span>
            <input
              data-ocid="design_editor.stroke_color.input"
              type="color"
              value={strokeColor}
              onChange={(e) => {
                setStrokeColor(e.target.value);
                if (selectedId)
                  setShapes((prev) =>
                    prev.map((s) =>
                      s.id === selectedId
                        ? { ...s, strokeColor: e.target.value }
                        : s,
                    ),
                  );
              }}
              className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span
                className="text-xs"
                style={{ color: "var(--fsx-text-secondary)" }}
              >
                Stroke Width
              </span>
              <span
                className="text-xs font-mono"
                style={{ color: "var(--fsx-accent)" }}
              >
                {strokeWidth}px
              </span>
            </div>
            <input
              data-ocid="design_editor.stroke_width.input"
              type="range"
              min={0}
              max={20}
              value={strokeWidth}
              onChange={(e) => {
                setStrokeWidth(Number(e.target.value));
                if (selectedId)
                  setShapes((prev) =>
                    prev.map((s) =>
                      s.id === selectedId
                        ? { ...s, strokeWidth: Number(e.target.value) }
                        : s,
                    ),
                  );
              }}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "var(--fsx-accent)" }}
            />
          </div>
        </div>

        {/* Selected shape info */}
        {selectedShape && (
          <div
            className="border-t pt-4 space-y-2"
            style={{ borderColor: "var(--fsx-border)" }}
          >
            <h4 className="text-xs font-semibold text-white">Selected Shape</h4>
            {(
              [
                ["X", selectedShape.x.toFixed(0)],
                ["Y", selectedShape.y.toFixed(0)],
                ["W", selectedShape.width.toFixed(0)],
                ["H", selectedShape.height.toFixed(0)],
              ] as [string, string][]
            ).map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span
                  className="text-xs"
                  style={{ color: "var(--fsx-text-muted)" }}
                >
                  {label}
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--fsx-text-secondary)" }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Shape actions */}
        {selectedShape && (
          <div
            className="border-t pt-4 flex flex-col gap-2"
            style={{ borderColor: "var(--fsx-border)" }}
          >
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="design_editor.layer_up.button"
                onClick={() => moveSelected("up")}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  backgroundColor: "var(--fsx-bg-elevated)",
                  border: "1px solid var(--fsx-border)",
                  color: "var(--fsx-text-secondary)",
                }}
              >
                <ChevronUp size={12} /> Up
              </button>
              <button
                type="button"
                data-ocid="design_editor.layer_down.button"
                onClick={() => moveSelected("down")}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  backgroundColor: "var(--fsx-bg-elevated)",
                  border: "1px solid var(--fsx-border)",
                  color: "var(--fsx-text-secondary)",
                }}
              >
                <ChevronDown size={12} /> Down
              </button>
            </div>
            <button
              type="button"
              data-ocid="design_editor.delete.delete_button"
              onClick={deleteSelected}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: "rgba(225,29,46,0.1)",
                border: "1px solid rgba(225,29,46,0.25)",
                color: "var(--fsx-accent)",
              }}
            >
              <Trash2 size={13} /> Delete Shape
            </button>
          </div>
        )}

        {/* Layer list */}
        <div
          className="border-t pt-4"
          style={{ borderColor: "var(--fsx-border)" }}
        >
          <h4 className="text-xs font-semibold text-white mb-3">
            Layers ({shapes.length})
          </h4>
          <div className="space-y-1">
            {[...shapes].reverse().map((shape, i) => (
              <button
                type="button"
                key={shape.id}
                data-ocid={`design_editor.layer.item.${i + 1}`}
                onClick={() => setSelectedId(shape.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-all"
                style={{
                  backgroundColor:
                    selectedId === shape.id
                      ? "rgba(225,29,46,0.1)"
                      : "transparent",
                  color:
                    selectedId === shape.id ? "white" : "var(--fsx-text-muted)",
                }}
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor:
                      shape.fillColor === "transparent"
                        ? shape.strokeColor
                        : shape.fillColor,
                  }}
                />
                <span className="capitalize">
                  {shape.type}
                  {shape.text ? `: "${shape.text.slice(0, 10)}"` : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
