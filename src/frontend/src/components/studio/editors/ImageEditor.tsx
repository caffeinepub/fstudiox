import { ImageIcon, RefreshCw, Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
};

interface SliderControlProps {
  label: string;
  field: keyof Adjustments;
  min: number;
  max: number;
  value: number;
  onChange: (field: keyof Adjustments, value: number) => void;
}

function SliderControl({
  label,
  field,
  min,
  max,
  value,
  onChange,
}: SliderControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span
          className="text-xs"
          style={{ color: "var(--fsx-text-secondary)" }}
        >
          {label}
        </span>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--fsx-accent)" }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(field, Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "var(--fsx-accent)" }}
      />
    </div>
  );
}

export default function ImageEditor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [adjustments, setAdjustments] =
    useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [isDragging, setIsDragging] = useState(false);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageName(file.name);
    setAdjustments(DEFAULT_ADJUSTMENTS);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleAdjustment = (field: keyof Adjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [field]: value }));
  };

  const filterStyle = `brightness(${1 + adjustments.brightness / 100}) contrast(${1 + adjustments.contrast / 100}) saturate(${1 + adjustments.saturation / 100}) blur(${adjustments.blur}px)`;

  return (
    <div
      data-ocid="image_editor.panel"
      className="flex h-full overflow-hidden"
      style={{ backgroundColor: "var(--fsx-bg-primary)" }}
    >
      {/* Main area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {!imageUrl ? (
          <div
            data-ocid="image_editor.dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="flex flex-col items-center justify-center gap-5 w-full max-w-lg h-80 rounded-2xl cursor-pointer transition-all"
            style={{
              border: `2px dashed ${isDragging ? "var(--fsx-accent)" : "var(--fsx-border)"}`,
              backgroundColor: isDragging
                ? "rgba(225,29,46,0.05)"
                : "var(--fsx-bg-surface)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: "rgba(225,29,46,0.1)",
                border: "1px solid rgba(225,29,46,0.2)",
              }}
            >
              <ImageIcon size={28} style={{ color: "var(--fsx-accent)" }} />
            </div>
            <div className="text-center">
              <p className="font-medium text-white mb-1">Drop an image here</p>
              <p className="text-sm" style={{ color: "var(--fsx-text-muted)" }}>
                or click to browse
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
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 max-w-3xl w-full">
            <div
              className="rounded-xl overflow-hidden w-full"
              style={{
                border: "1px solid var(--fsx-border)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <img
                data-ocid="image_editor.canvas_target"
                src={imageUrl}
                alt="Editing preview"
                className="w-full h-auto max-h-96 object-contain"
                style={{ filter: filterStyle }}
              />
            </div>
            <p className="text-xs" style={{ color: "var(--fsx-text-muted)" }}>
              {imageName}
            </p>
          </div>
        )}
      </div>

      {/* Right panel: Adjustments */}
      {imageUrl && (
        <aside
          className="w-64 shrink-0 border-l p-5 flex flex-col gap-5 overflow-y-auto"
          style={{
            backgroundColor: "var(--fsx-bg-surface)",
            borderColor: "var(--fsx-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Adjustments</h3>
            <button
              type="button"
              data-ocid="image_editor.reset.secondary_button"
              onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--fsx-text-muted)" }}
              title="Reset"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <SliderControl
            label="Brightness"
            field="brightness"
            min={-100}
            max={100}
            value={adjustments.brightness}
            onChange={handleAdjustment}
          />
          <SliderControl
            label="Contrast"
            field="contrast"
            min={-100}
            max={100}
            value={adjustments.contrast}
            onChange={handleAdjustment}
          />
          <SliderControl
            label="Saturation"
            field="saturation"
            min={-100}
            max={100}
            value={adjustments.saturation}
            onChange={handleAdjustment}
          />
          <SliderControl
            label="Blur"
            field="blur"
            min={0}
            max={10}
            value={adjustments.blur}
            onChange={handleAdjustment}
          />

          <div
            className="mt-auto pt-4 border-t"
            style={{ borderColor: "var(--fsx-border)" }}
          >
            <label className="fsx-btn-secondary text-xs cursor-pointer w-full flex items-center justify-center gap-2">
              <input
                data-ocid="image_editor.replace.upload_button"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <Upload size={13} /> Replace Image
            </label>
          </div>
        </aside>
      )}
    </div>
  );
}
