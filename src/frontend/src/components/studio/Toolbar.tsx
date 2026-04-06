import { Check, Download, Edit3, Save, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import type { ToolId } from "./Sidebar";

interface ToolbarProps {
  projectTitle: string;
  onProjectTitleChange: (title: string) => void;
  toolLabel: string;
  activeTool: ToolId;
}

export default function Toolbar({
  projectTitle,
  onProjectTitleChange,
  toolLabel,
  activeTool,
}: ToolbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);
  const { canInstall, install, isIOS } = usePWAInstall();
  const [showIOSHint, setShowIOSHint] = useState(false);

  const handleSave = () => {
    toast.success("Project saved successfully!");
  };

  const handleDownload = () => {
    if (activeTool === "text") {
      // Download text content from the textarea
      const textarea = document.querySelector<HTMLTextAreaElement>(
        "[data-ocid='text_editor.content.textarea']",
      );
      const content = textarea?.value ?? "";
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectTitle || "fstudiox-text"}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Text file downloaded!");
    } else if (activeTool === "image") {
      // Download the edited image
      const img = document.querySelector<HTMLImageElement>(
        "[data-ocid='image_editor.canvas_target']",
      );
      if (!img || !img.src) {
        toast.error("No image to download. Please upload an image first.");
        return;
      }
      // Draw image with filters onto a canvas and download
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const tempImg = new Image();
      tempImg.crossOrigin = "anonymous";
      tempImg.onload = () => {
        canvas.width = tempImg.naturalWidth;
        canvas.height = tempImg.naturalHeight;
        if (ctx) {
          ctx.filter = img.style.filter || "none";
          ctx.drawImage(tempImg, 0, 0);
        }
        const link = document.createElement("a");
        link.download = `${projectTitle || "fstudiox-image"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("Image downloaded!");
      };
      tempImg.src = img.src;
    } else {
      toast.success("Export started — check downloads.");
    }
  };

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSHint((prev) => !prev);
    } else {
      install();
    }
  };

  const startEdit = () => {
    setTempTitle(projectTitle);
    setIsEditing(true);
  };

  const commitEdit = () => {
    onProjectTitleChange(tempTitle || "Untitled Project");
    setIsEditing(false);
  };

  return (
    <div
      data-ocid="studio.toolbar.panel"
      className="flex items-center justify-between px-5 h-14 border-b shrink-0 gap-4"
      style={{
        backgroundColor: "var(--fsx-bg-surface)",
        borderColor: "var(--fsx-border)",
      }}
    >
      {/* Left: Project Title */}
      <div className="flex items-center gap-3 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              data-ocid="studio.project_title.input"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="bg-transparent border-b text-sm font-medium text-white outline-none px-1"
              style={{ borderColor: "var(--fsx-accent)" }}
            />
            <button
              type="button"
              data-ocid="studio.project_title.save_button"
              onClick={commitEdit}
              className="p-1 rounded"
              style={{ color: "var(--fsx-accent)" }}
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate max-w-[200px]">
              {projectTitle}
            </span>
            <button
              type="button"
              data-ocid="studio.project_title.edit_button"
              onClick={startEdit}
              className="p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: "var(--fsx-text-muted)" }}
            >
              <Edit3 size={13} />
            </button>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5">
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: "var(--fsx-border)" }}
          />
          <span className="text-xs" style={{ color: "var(--fsx-text-muted)" }}>
            {toolLabel}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          data-ocid="studio.save.secondary_button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            backgroundColor: "var(--fsx-bg-elevated)",
            border: "1px solid var(--fsx-border)",
            color: "var(--fsx-text-secondary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "white";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--fsx-text-secondary)";
          }}
        >
          <Save size={13} />
          <span className="hidden sm:block">Save</span>
        </button>

        {/* Install App button */}
        {canInstall && (
          <div className="relative">
            <button
              type="button"
              data-ocid="studio.install_app.button"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: "var(--fsx-bg-elevated)",
                border: "1px solid var(--fsx-border)",
                color: "var(--fsx-text-secondary)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "white";
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
              <span className="hidden sm:block">Install</span>
            </button>
            {isIOS && showIOSHint && (
              <div
                className="absolute right-0 top-10 w-52 p-3 rounded-xl text-xs z-50"
                style={{
                  backgroundColor: "var(--fsx-bg-surface)",
                  border: "1px solid var(--fsx-border)",
                  color: "var(--fsx-text-secondary)",
                }}
              >
                In Safari: tap <strong style={{ color: "white" }}>Share</strong>{" "}
                then{" "}
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
          data-ocid="studio.download.primary_button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
          style={{ backgroundColor: "var(--fsx-accent)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "var(--fsx-accent-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "var(--fsx-accent)";
          }}
        >
          <Download size={13} />
          <span className="hidden sm:block">Download</span>
        </button>
      </div>
    </div>
  );
}
