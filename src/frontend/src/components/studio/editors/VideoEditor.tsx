import {
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  Pause,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  Settings,
  SkipBack,
  SkipForward,
  Sliders,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ─── constants ────────────────────────────────────────────────────────────── */
const FILTER_PRESETS = [
  { id: "original", label: "Original", filter: "none", color: "#888" },
  {
    id: "warm",
    label: "Warm",
    filter: "sepia(0.3) saturate(1.4) brightness(1.05)",
    color: "#f4a261",
  },
  {
    id: "cool",
    label: "Cool",
    filter: "hue-rotate(180deg) saturate(0.8)",
    color: "#4ecdc4",
  },
  { id: "bw", label: "B&W", filter: "grayscale(1)", color: "#aaa" },
  {
    id: "vintage",
    label: "Vintage",
    filter: "sepia(0.5) contrast(1.2) brightness(0.9)",
    color: "#c9a96e",
  },
  {
    id: "clarendon",
    label: "Clarendon",
    filter: "contrast(1.2) saturate(1.35)",
    color: "#5fa8d3",
  },
  {
    id: "juno",
    label: "Juno",
    filter: "saturate(1.8) contrast(0.9)",
    color: "#f9c74f",
  },
  {
    id: "lark",
    label: "Lark",
    filter: "brightness(1.1) contrast(0.9) saturate(1.1)",
    color: "#b7e4c7",
  },
  {
    id: "fade",
    label: "Fade",
    filter: "opacity(0.8) brightness(1.1)",
    color: "#ccc",
  },
  {
    id: "vivid",
    label: "Vivid",
    filter: "saturate(1.8) contrast(1.1)",
    color: "#e63946",
  },
  {
    id: "muted",
    label: "Muted",
    filter: "saturate(0.6) brightness(1.05)",
    color: "#6b7280",
  },
  {
    id: "retro",
    label: "Retro",
    filter: "sepia(0.7) contrast(1.1) hue-rotate(-10deg)",
    color: "#d4a373",
  },
  {
    id: "neon",
    label: "Neon",
    filter: "saturate(2) brightness(1.2) contrast(1.3) hue-rotate(30deg)",
    color: "#06d6a0",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    filter: "contrast(1.4) brightness(0.85) saturate(0.9)",
    color: "#264653",
  },
  {
    id: "dreamy",
    label: "Dreamy",
    filter: "brightness(1.15) blur(0.5px) saturate(1.2)",
    color: "#c77dff",
  },
  {
    id: "sunset",
    label: "Sunset",
    filter: "sepia(0.4) hue-rotate(-20deg) saturate(1.6)",
    color: "#f77f00",
  },
];

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4];

const EMOJI_STICKERS = [
  "🎬",
  "🎵",
  "🔥",
  "⭐",
  "💫",
  "✨",
  "🎉",
  "🎊",
  "❤️",
  "🌟",
  "💥",
  "🎯",
  "🎨",
  "🌈",
  "🦋",
  "🌺",
  "🏆",
  "💎",
  "🚀",
  "🎪",
];

const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "soft-light",
  "hard-light",
] as const;
type BlendMode = (typeof BLEND_MODES)[number];

/* ─── types ────────────────────────────────────────────────────────────────── */
type Tab = "trim" | "effects" | "adjust" | "overlays" | "settings";

type Adjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  exposure: number;
  shadows: number;
  highlights: number;
  blur: number;
  sharpen: number;
};

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  exposure: 0,
  shadows: 0,
  highlights: 0,
  blur: 0,
  sharpen: 0,
};

type TextOverlay = {
  id: string;
  type: "text" | "emoji";
  content: string;
  fontSize: number;
  color: string;
  opacity: number;
  x: number;
  y: number;
  blendMode: BlendMode;
  visible: boolean;
};

type EditState = {
  filter: string;
  adjustments: Adjustments;
  trimStart: number;
  trimEnd: number;
  overlays: TextOverlay[];
};

/* ─── main component ───────────────────────────────────────────────────────── */
export default function VideoEditor() {
  /* video state */
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  /* editing state */
  const [activeFilter, setActiveFilter] = useState("original");
  const [adjustments, setAdjustments] = useState<Adjustments>({
    ...DEFAULT_ADJUSTMENTS,
  });
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);

  /* overlays */
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null,
  );
  const [newTextInput, setNewTextInput] = useState("");

  /* timeline drag state */
  const [draggingHandle, setDraggingHandle] = useState<
    "start" | "end" | "playhead" | null
  >(null);
  const [showStartLabel, setShowStartLabel] = useState(false);
  const [showEndLabel, setShowEndLabel] = useState(false);

  /* undo/redo */
  const [history, setHistory] = useState<EditState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef<EditState[]>([]);
  const historyIndexRef = useRef(-1);

  /* tabs */
  const [activeTab, setActiveTab] = useState<Tab>("trim");

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const trimIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoFileRef = useRef<File | null>(null);

  /* ─── computed filter ──────────────────────────────────────────────────── */
  const getComputedFilter = useCallback((): string => {
    const preset = FILTER_PRESETS.find((f) => f.id === activeFilter);
    const b = 1 + (adjustments.brightness + adjustments.exposure * 0.5) / 100;
    const c = 1 + (adjustments.contrast + adjustments.highlights * 0.3) / 100;
    const s = 1 + adjustments.saturation / 100;
    const blurVal =
      adjustments.blur > 0 ? `blur(${(adjustments.blur / 100) * 5}px)` : "";
    const adj = `brightness(${b.toFixed(3)}) contrast(${c.toFixed(3)}) saturate(${s.toFixed(3)}) ${blurVal}`;
    const base =
      preset?.filter && preset.filter !== "none"
        ? `${preset.filter} ${adj}`
        : adj;
    return base.trim();
  }, [activeFilter, adjustments]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.style.filter = getComputedFilter();
  }, [getComputedFilter]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume / 100;
  }, [volume]);

  /* ─── history ──────────────────────────────────────────────────────────── */
  const captureState = useCallback(
    (): EditState => ({
      filter: activeFilter,
      adjustments: { ...adjustments },
      trimStart,
      trimEnd,
      overlays: overlays.map((o) => ({ ...o })),
    }),
    [activeFilter, adjustments, trimStart, trimEnd, overlays],
  );

  const pushHistory = useCallback((state: EditState) => {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(state);
    if (newHistory.length > 50) newHistory.shift();
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setHistory([...newHistory]);
    setHistoryIndex(newHistory.length - 1);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const idx = historyIndexRef.current - 1;
    const state = historyRef.current[idx];
    historyIndexRef.current = idx;
    setHistoryIndex(idx);
    setActiveFilter(state.filter);
    setAdjustments({ ...state.adjustments });
    setTrimStart(state.trimStart);
    setTrimEnd(state.trimEnd);
    setOverlays(state.overlays.map((o) => ({ ...o })));
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const idx = historyIndexRef.current + 1;
    const state = historyRef.current[idx];
    historyIndexRef.current = idx;
    setHistoryIndex(idx);
    setActiveFilter(state.filter);
    setAdjustments({ ...state.adjustments });
    setTrimStart(state.trimStart);
    setTrimEnd(state.trimEnd);
    setOverlays(state.overlays.map((o) => ({ ...o })));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  /* ─── file loading ─────────────────────────────────────────────────────── */
  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) return;
    videoFileRef.current = file;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setTrimStart(0);
    setTrimEnd(100);
    setActiveFilter("original");
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    setOverlays([]);
    setPlaybackSpeed(1);
    setHistoryIndex(-1);
    historyRef.current = [];
    setHistory([]);
    setActiveTab("trim");
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

  /* ─── playback ─────────────────────────────────────────────────────────── */
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const skipBack = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, currentTime - 5);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(duration, currentTime + 5);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  /* ─── timeline ─────────────────────────────────────────────────────────── */
  const getTimelinePercent = useCallback((clientX: number): number => {
    const el = timelineRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100),
    );
  }, []);

  const handleTimelineMouseDown = (
    e: React.MouseEvent,
    handle: "start" | "end" | "playhead",
  ) => {
    e.preventDefault();
    setDraggingHandle(handle);
    if (handle === "start") setShowStartLabel(true);
    if (handle === "end") setShowEndLabel(true);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (draggingHandle) return;
    const pct = getTimelinePercent(e.clientX);
    const t = (pct / 100) * duration;
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  useEffect(() => {
    if (!draggingHandle) return;
    const onMove = (e: MouseEvent) => {
      const pct = getTimelinePercent(e.clientX);
      if (draggingHandle === "start") {
        setTrimStart(Math.min(pct, trimEnd - 2));
      } else if (draggingHandle === "end") {
        setTrimEnd(Math.max(pct, trimStart + 2));
      } else if (draggingHandle === "playhead") {
        const t = (pct / 100) * duration;
        setCurrentTime(t);
        if (videoRef.current) videoRef.current.currentTime = t;
      }
    };
    const onUp = () => {
      setDraggingHandle(null);
      setShowStartLabel(false);
      setShowEndLabel(false);
      pushHistory(captureState());
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [
    draggingHandle,
    trimStart,
    trimEnd,
    duration,
    captureState,
    pushHistory,
    getTimelinePercent,
  ]);

  /* ─── playback loop (trim) ─────────────────────────────────────────────── */
  const playTrimmed = () => {
    if (!videoRef.current || duration === 0) return;
    const startSec = (trimStart / 100) * duration;
    const endSec = (trimEnd / 100) * duration;
    videoRef.current.currentTime = startSec;
    videoRef.current.play();
    setIsPlaying(true);
    if (trimIntervalRef.current) clearInterval(trimIntervalRef.current);
    trimIntervalRef.current = setInterval(() => {
      if (!videoRef.current) return;
      if (videoRef.current.currentTime >= endSec) {
        videoRef.current.pause();
        setIsPlaying(false);
        clearInterval(trimIntervalRef.current!);
      }
    }, 100);
  };

  /* ─── overlays ─────────────────────────────────────────────────────────── */
  const addTextOverlay = () => {
    if (!newTextInput.trim()) return;
    const overlay: TextOverlay = {
      id: `ov_${Date.now()}`,
      type: "text",
      content: newTextInput.trim(),
      fontSize: 24,
      color: "#ffffff",
      opacity: 100,
      x: 50,
      y: 50,
      blendMode: "normal",
      visible: true,
    };
    const next = [...overlays, overlay];
    setOverlays(next);
    setSelectedOverlayId(overlay.id);
    setNewTextInput("");
    pushHistory({ ...captureState(), overlays: next });
  };

  const addEmojiOverlay = (emoji: string) => {
    const overlay: TextOverlay = {
      id: `ov_${Date.now()}`,
      type: "emoji",
      content: emoji,
      fontSize: 40,
      color: "#ffffff",
      opacity: 100,
      x: 50,
      y: 50,
      blendMode: "normal",
      visible: true,
    };
    const next = [...overlays, overlay];
    setOverlays(next);
    setSelectedOverlayId(overlay.id);
    pushHistory({ ...captureState(), overlays: next });
  };

  const updateOverlay = (id: string, patch: Partial<TextOverlay>) => {
    setOverlays((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    );
  };

  const deleteOverlay = (id: string) => {
    const next = overlays.filter((o) => o.id !== id);
    setOverlays(next);
    if (selectedOverlayId === id) setSelectedOverlayId(null);
    pushHistory({ ...captureState(), overlays: next });
  };

  const toggleOverlayVisibility = (id: string) => {
    updateOverlay(id, { visible: !overlays.find((o) => o.id === id)?.visible });
  };

  const selectedOverlay =
    overlays.find((o) => o.id === selectedOverlayId) ?? null;

  /* ─── download ─────────────────────────────────────────────────────────── */
  const downloadVideo = () => {
    const file = videoFileRef.current;
    if (!file || !videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = file.name;
    a.click();
  };

  /* ─── render ───────────────────────────────────────────────────────────── */
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trimmedDuration =
    duration > 0 ? ((trimEnd - trimStart) / 100) * duration : 0;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "trim", label: "Trim", icon: <SkipBack size={12} /> },
    { id: "effects", label: "Effects", icon: <Sparkles size={12} /> },
    { id: "adjust", label: "Adjust", icon: <Sliders size={12} /> },
    { id: "overlays", label: "Overlays", icon: <Layers size={12} /> },
    { id: "settings", label: "Settings", icon: <Settings size={12} /> },
  ];

  return (
    <div
      data-ocid="video_editor.panel"
      className="flex flex-col overflow-hidden"
      style={{ height: "100%", backgroundColor: "var(--fsx-bg-primary)" }}
    >
      {/* ══════════════════════════ TOP 50%: PREVIEW ═════════════════════════ */}
      <div
        className="relative flex items-center justify-center overflow-hidden shrink-0"
        style={{ height: "50%", backgroundColor: "#000" }}
      >
        {!videoUrl ? (
          /* ── Upload dropzone ── */
          <div
            data-ocid="video_editor.dropzone"
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
                ? "rgba(225,29,46,0.05)"
                : "var(--fsx-bg-surface)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: "rgba(225,29,46,0.12)",
                border: "1px solid rgba(225,29,46,0.25)",
              }}
            >
              <Video size={28} style={{ color: "var(--fsx-accent)" }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white mb-1">
                Drag video here or tap to upload
              </p>
              <p className="text-xs" style={{ color: "var(--fsx-text-muted)" }}>
                MP4 · MOV · WebM · MKV
              </p>
            </div>
            <label className="fsx-btn-primary cursor-pointer text-sm px-5 py-2.5">
              <input
                data-ocid="video_editor.upload_button"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <span className="flex items-center gap-2">
                <Upload size={13} /> Choose Video
              </span>
            </label>
          </div>
        ) : (
          <>
            {/* ── Video element ── */}
            <video
              data-ocid="video_editor.canvas_target"
              ref={videoRef}
              src={videoUrl}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: "calc(100% - 56px)", maxWidth: "100%" }}
              onTimeUpdate={() =>
                setCurrentTime(videoRef.current?.currentTime ?? 0)
              }
              onLoadedMetadata={() => {
                const d = videoRef.current?.duration ?? 0;
                setDuration(d);
                setTrimEnd(100);
                pushHistory(captureState());
              }}
              onEnded={() => {
                setIsPlaying(false);
              }}
            >
              <track kind="captions" />
            </video>

            {/* ── Text/Emoji Overlays rendered on top of video ── */}
            {overlays
              .filter((o) => o.visible)
              .map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelectedOverlayId(o.id)}
                  className="absolute pointer-events-auto cursor-pointer select-none bg-transparent border-0 p-0"
                  style={{
                    left: `${o.x}%`,
                    top: `${o.y}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: `${o.fontSize}px`,
                    color: o.color,
                    opacity: o.opacity / 100,
                    mixBlendMode: o.blendMode,
                    textShadow:
                      o.type === "text" ? "0 1px 4px rgba(0,0,0,0.8)" : "none",
                    fontWeight: 700,
                    outline:
                      selectedOverlayId === o.id
                        ? "2px solid var(--fsx-accent)"
                        : "none",
                    outlineOffset: "4px",
                    borderRadius: "4px",
                    padding: "2px 4px",
                    zIndex: 10,
                    userSelect: "none",
                  }}
                >
                  {o.content}
                </button>
              ))}

            {/* ── Playback controls gradient overlay ── */}
            <div
              className="absolute bottom-0 left-0 right-0 px-3 pt-8 pb-1"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
              }}
            >
              {/* ── Visual Timeline ── */}
              <div
                ref={timelineRef}
                onClick={handleTimelineClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleTimelineClick(e as unknown as React.MouseEvent);
                }}
                role="slider"
                tabIndex={0}
                aria-label="Timeline"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="relative mb-2 select-none"
                style={{ height: "24px", cursor: "pointer" }}
              >
                {/* Track base */}
                <div
                  className="absolute inset-y-0 my-auto rounded-full"
                  style={{
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor: "rgba(255,255,255,0.18)",
                  }}
                />
                {/* Darkened left of trim start */}
                <div
                  className="absolute inset-y-0 my-auto rounded-l-full"
                  style={{
                    left: 0,
                    width: `${trimStart}%`,
                    height: "4px",
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                />
                {/* Active trim region (red) */}
                <div
                  className="absolute inset-y-0 my-auto"
                  style={{
                    left: `${trimStart}%`,
                    width: `${trimEnd - trimStart}%`,
                    height: "4px",
                    backgroundColor: "var(--fsx-accent)",
                  }}
                />
                {/* Darkened right of trim end */}
                <div
                  className="absolute inset-y-0 my-auto rounded-r-full"
                  style={{
                    left: `${trimEnd}%`,
                    right: 0,
                    height: "4px",
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                />

                {/* Trim Start handle */}
                <div
                  data-ocid="video_editor.timeline.handle_start"
                  onMouseDown={(e) => handleTimelineMouseDown(e, "start")}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-5 rounded-sm flex items-center justify-center cursor-ew-resize z-20"
                  style={{
                    left: `${trimStart}%`,
                    backgroundColor: "var(--fsx-accent)",
                    border: "1.5px solid white",
                  }}
                >
                  {showStartLabel && (
                    <span
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono px-1 py-0.5 rounded whitespace-nowrap"
                      style={{
                        backgroundColor: "var(--fsx-accent)",
                        color: "white",
                        fontSize: "9px",
                      }}
                    >
                      {formatTime((trimStart / 100) * duration)}
                    </span>
                  )}
                </div>

                {/* Trim End handle */}
                <div
                  data-ocid="video_editor.timeline.handle_end"
                  onMouseDown={(e) => handleTimelineMouseDown(e, "end")}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-5 rounded-sm flex items-center justify-center cursor-ew-resize z-20"
                  style={{
                    left: `${trimEnd}%`,
                    backgroundColor: "var(--fsx-accent)",
                    border: "1.5px solid white",
                  }}
                >
                  {showEndLabel && (
                    <span
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono px-1 py-0.5 rounded whitespace-nowrap"
                      style={{
                        backgroundColor: "var(--fsx-accent)",
                        color: "white",
                        fontSize: "9px",
                      }}
                    >
                      {formatTime((trimEnd / 100) * duration)}
                    </span>
                  )}
                </div>

                {/* Playhead */}
                <div
                  data-ocid="video_editor.timeline.playhead"
                  onMouseDown={(e) => handleTimelineMouseDown(e, "playhead")}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-col-resize"
                  style={{ left: `${progressPercent}%` }}
                >
                  <div
                    style={{
                      width: "2px",
                      height: "20px",
                      backgroundColor: "white",
                      borderRadius: "1px",
                      boxShadow: "0 0 4px rgba(255,255,255,0.6)",
                    }}
                  />
                </div>
              </div>

              {/* ── Controls row ── */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={skipBack}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                    aria-label="Skip back 5s"
                  >
                    <SkipBack size={11} />
                  </button>
                  <button
                    type="button"
                    data-ocid="video_editor.play_pause.toggle"
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all"
                    style={{ backgroundColor: "var(--fsx-accent)" }}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={skipForward}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                    aria-label="Skip forward 5s"
                  >
                    <SkipForward size={11} />
                  </button>
                  <span
                    className="text-xs font-mono ml-1"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {formatTime(currentTime)}{" "}
                    <span style={{ color: "rgba(255,255,255,0.35)" }}>/</span>{" "}
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Undo/Redo */}
                  <button
                    type="button"
                    onClick={undo}
                    disabled={!canUndo}
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                    style={{
                      color: canUndo
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.2)",
                    }}
                    aria-label="Undo"
                  >
                    <Undo2 size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={redo}
                    disabled={!canRedo}
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                    style={{
                      color: canRedo
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.2)",
                    }}
                    aria-label="Redo"
                  >
                    <Redo2 size={12} />
                  </button>
                  {/* Mute + volume */}
                  <button
                    type="button"
                    data-ocid="video_editor.mute.toggle"
                    onClick={toggleMute}
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-14 h-1 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "var(--fsx-accent)" }}
                    aria-label="Volume"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════ BOTTOM 50%: TOOLS (scrollable) ═══════════════ */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{
          backgroundColor: "var(--fsx-bg-primary)",
          borderTop: "1px solid var(--fsx-border)",
        }}
      >
        {!videoUrl ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs" style={{ color: "var(--fsx-text-muted)" }}>
              Load a video to access editing controls
            </p>
          </div>
        ) : (
          <>
            {/* ── Tab bar ── */}
            <div
              className="flex shrink-0 overflow-x-auto"
              style={{
                backgroundColor: "var(--fsx-bg-surface)",
                borderBottom: "1px solid var(--fsx-border)",
                scrollbarWidth: "none",
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  data-ocid={`video_editor.tab.${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-none flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap"
                  style={{
                    color:
                      activeTab === tab.id
                        ? "var(--fsx-accent)"
                        : "var(--fsx-text-muted)",
                    borderBottom:
                      activeTab === tab.id
                        ? "2px solid var(--fsx-accent)"
                        : "2px solid transparent",
                    backgroundColor: "transparent",
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab content (scrollable) ── */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              {/* ════ TRIM TAB ════ */}
              {activeTab === "trim" && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      Trim Video
                    </h4>
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--fsx-text-secondary)" }}
                    >
                      Duration: {formatTime(trimmedDuration)}
                    </span>
                  </div>

                  {/* Start slider */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span
                        className="text-xs"
                        style={{ color: "var(--fsx-text-muted)" }}
                      >
                        Start
                      </span>
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--fsx-accent)" }}
                      >
                        {formatTime((trimStart / 100) * duration)}
                      </span>
                    </div>
                    <input
                      data-ocid="video_editor.trim_start.input"
                      type="range"
                      min={0}
                      max={trimEnd - 2}
                      step={0.1}
                      value={trimStart}
                      onChange={(e) => setTrimStart(Number(e.target.value))}
                      onMouseUp={() => pushHistory(captureState())}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: "var(--fsx-accent)" }}
                    />
                  </div>

                  {/* End slider */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span
                        className="text-xs"
                        style={{ color: "var(--fsx-text-muted)" }}
                      >
                        End
                      </span>
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--fsx-accent)" }}
                      >
                        {formatTime((trimEnd / 100) * duration)}
                      </span>
                    </div>
                    <input
                      data-ocid="video_editor.trim_end.input"
                      type="range"
                      min={trimStart + 2}
                      max={100}
                      step={0.1}
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(Number(e.target.value))}
                      onMouseUp={() => pushHistory(captureState())}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: "var(--fsx-accent)" }}
                    />
                  </div>

                  {/* Play trimmed */}
                  <button
                    type="button"
                    data-ocid="video_editor.play_trimmed.button"
                    onClick={playTrimmed}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{
                      backgroundColor: "rgba(225,29,46,0.12)",
                      border: "1px solid rgba(225,29,46,0.3)",
                      color: "var(--fsx-accent)",
                    }}
                  >
                    <Play size={12} /> Preview Trimmed (
                    {formatTime(trimmedDuration)})
                  </button>

                  {/* Reset trim */}
                  <button
                    type="button"
                    onClick={() => {
                      setTrimStart(0);
                      setTrimEnd(100);
                      pushHistory({
                        ...captureState(),
                        trimStart: 0,
                        trimEnd: 100,
                      });
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{
                      backgroundColor: "var(--fsx-bg-elevated)",
                      border: "1px solid var(--fsx-border)",
                      color: "var(--fsx-text-muted)",
                    }}
                  >
                    <RotateCcw size={11} /> Reset Trim
                  </button>
                </div>
              )}

              {/* ════ EFFECTS TAB ════ */}
              {activeTab === "effects" && (
                <div className="p-4">
                  <h4
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "var(--fsx-text-muted)" }}
                  >
                    Filter Presets
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {FILTER_PRESETS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        data-ocid={`video_editor.filter.${f.id}`}
                        onClick={() => {
                          setActiveFilter(f.id);
                          pushHistory({ ...captureState(), filter: f.id });
                        }}
                        className="flex flex-col items-center gap-1.5 transition-all"
                      >
                        <div
                          className="w-full aspect-square rounded-xl overflow-hidden relative"
                          style={{
                            border:
                              activeFilter === f.id
                                ? "2.5px solid var(--fsx-accent)"
                                : "2px solid var(--fsx-border)",
                            boxShadow:
                              activeFilter === f.id
                                ? "0 0 0 1px var(--fsx-accent)"
                                : "none",
                          }}
                        >
                          <div
                            className="w-full h-full flex items-center justify-center text-xl"
                            style={{
                              backgroundColor: `${f.color}33`,
                              filter: f.filter === "none" ? "none" : f.filter,
                            }}
                          >
                            <span style={{ fontSize: "22px" }}>🎬</span>
                          </div>
                          {/* Color indicator bar */}
                          <div
                            className="absolute bottom-0 left-0 right-0 h-1"
                            style={{ backgroundColor: f.color }}
                          />
                        </div>
                        <span
                          className="text-xs leading-tight text-center"
                          style={{
                            color:
                              activeFilter === f.id
                                ? "var(--fsx-accent)"
                                : "var(--fsx-text-muted)",
                            fontWeight: activeFilter === f.id ? 600 : 400,
                            fontSize: "10px",
                          }}
                        >
                          {f.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ════ ADJUST TAB ════ */}
              {activeTab === "adjust" && (
                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      Adjustments
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustments({ ...DEFAULT_ADJUSTMENTS });
                        pushHistory({
                          ...captureState(),
                          adjustments: { ...DEFAULT_ADJUSTMENTS },
                        });
                      }}
                      className="flex items-center gap-1 text-xs transition-colors"
                      style={{ color: "var(--fsx-accent)" }}
                    >
                      <RotateCcw size={10} /> Reset All
                    </button>
                  </div>
                  {(
                    Object.keys(DEFAULT_ADJUSTMENTS) as (keyof Adjustments)[]
                  ).map((key) => {
                    const isPositiveOnly = key === "blur" || key === "sharpen";
                    const min = isPositiveOnly ? 0 : -100;
                    const val = adjustments[key];
                    return (
                      <AdjustmentSlider
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={val}
                        min={min}
                        onChange={(v) => {
                          const next = { ...adjustments, [key]: v };
                          setAdjustments(next);
                        }}
                        onCommit={() => pushHistory(captureState())}
                      />
                    );
                  })}
                </div>
              )}

              {/* ════ OVERLAYS TAB ════ */}
              {activeTab === "overlays" && (
                <div className="p-4 space-y-4">
                  {/* Add text */}
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      Add Text
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter text…"
                        value={newTextInput}
                        onChange={(e) => setNewTextInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addTextOverlay();
                        }}
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          backgroundColor: "var(--fsx-bg-elevated)",
                          border: "1px solid var(--fsx-border)",
                          color: "white",
                        }}
                      />
                      <button
                        type="button"
                        onClick={addTextOverlay}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: "var(--fsx-accent)",
                          color: "white",
                        }}
                        aria-label="Add text overlay"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Emoji stickers */}
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      Stickers
                    </h4>
                    <div className="grid grid-cols-10 gap-1">
                      {EMOJI_STICKERS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addEmojiOverlay(emoji)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110"
                          style={{
                            backgroundColor: "var(--fsx-bg-elevated)",
                            border: "1px solid var(--fsx-border)",
                          }}
                          aria-label={`Add ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Overlay list */}
                  {overlays.length > 0 && (
                    <div>
                      <h4
                        className="text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{ color: "var(--fsx-text-muted)" }}
                      >
                        Layers
                      </h4>
                      <div className="space-y-1.5">
                        {overlays.map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setSelectedOverlayId(o.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-left"
                            style={{
                              backgroundColor:
                                selectedOverlayId === o.id
                                  ? "rgba(225,29,46,0.12)"
                                  : "var(--fsx-bg-elevated)",
                              border:
                                selectedOverlayId === o.id
                                  ? "1px solid rgba(225,29,46,0.4)"
                                  : "1px solid var(--fsx-border)",
                            }}
                          >
                            <span className="text-base">
                              {o.type === "emoji" ? o.content : "T"}
                            </span>
                            <span
                              className="flex-1 text-xs truncate"
                              style={{ color: "var(--fsx-text-secondary)" }}
                            >
                              {o.type === "text"
                                ? o.content
                                : `Sticker ${o.content}`}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleOverlayVisibility(o.id);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded transition-colors"
                              style={{
                                color: o.visible
                                  ? "var(--fsx-text-secondary)"
                                  : "var(--fsx-text-muted)",
                              }}
                              aria-label={
                                o.visible ? "Hide overlay" : "Show overlay"
                              }
                            >
                              {o.visible ? (
                                <Eye size={11} />
                              ) : (
                                <EyeOff size={11} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteOverlay(o.id);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded transition-colors"
                              style={{ color: "var(--fsx-text-muted)" }}
                              aria-label="Delete overlay"
                            >
                              <Trash2 size={11} />
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected overlay controls */}
                  {selectedOverlay && (
                    <div
                      className="p-3 rounded-xl space-y-3"
                      style={{
                        backgroundColor: "var(--fsx-bg-elevated)",
                        border: "1px solid var(--fsx-border)",
                      }}
                    >
                      <h4
                        className="text-xs font-semibold"
                        style={{ color: "var(--fsx-text-muted)" }}
                      >
                        Edit Overlay
                      </h4>

                      {selectedOverlay.type === "text" && (
                        <input
                          type="text"
                          value={selectedOverlay.content}
                          onChange={(e) =>
                            updateOverlay(selectedOverlay.id, {
                              content: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                          style={{
                            backgroundColor: "var(--fsx-bg-surface)",
                            border: "1px solid var(--fsx-border)",
                            color: "white",
                          }}
                        />
                      )}

                      <MiniSlider
                        label="Font Size"
                        value={selectedOverlay.fontSize}
                        min={10}
                        max={100}
                        onChange={(v) =>
                          updateOverlay(selectedOverlay.id, { fontSize: v })
                        }
                      />
                      <MiniSlider
                        label="Opacity"
                        value={selectedOverlay.opacity}
                        min={0}
                        max={100}
                        onChange={(v) =>
                          updateOverlay(selectedOverlay.id, { opacity: v })
                        }
                      />
                      <MiniSlider
                        label="X Position"
                        value={selectedOverlay.x}
                        min={0}
                        max={100}
                        onChange={(v) =>
                          updateOverlay(selectedOverlay.id, { x: v })
                        }
                      />
                      <MiniSlider
                        label="Y Position"
                        value={selectedOverlay.y}
                        min={0}
                        max={100}
                        onChange={(v) =>
                          updateOverlay(selectedOverlay.id, { y: v })
                        }
                      />

                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs"
                          style={{ color: "var(--fsx-text-muted)" }}
                        >
                          Color
                        </span>
                        <input
                          type="color"
                          value={selectedOverlay.color}
                          onChange={(e) =>
                            updateOverlay(selectedOverlay.id, {
                              color: e.target.value,
                            })
                          }
                          className="w-8 h-6 rounded cursor-pointer"
                          style={{
                            border: "1px solid var(--fsx-border)",
                            backgroundColor: "transparent",
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs"
                          style={{ color: "var(--fsx-text-muted)" }}
                        >
                          Blend Mode
                        </span>
                        <div className="relative">
                          <select
                            value={selectedOverlay.blendMode}
                            onChange={(e) =>
                              updateOverlay(selectedOverlay.id, {
                                blendMode: e.target.value as BlendMode,
                              })
                            }
                            className="text-xs pl-2 pr-6 py-1 rounded-lg outline-none appearance-none cursor-pointer"
                            style={{
                              backgroundColor: "var(--fsx-bg-surface)",
                              border: "1px solid var(--fsx-border)",
                              color: "var(--fsx-text-secondary)",
                            }}
                          >
                            {BLEND_MODES.map((m) => (
                              <option key={m} value={m}>
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={10}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "var(--fsx-text-muted)" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ════ SETTINGS TAB ════ */}
              {activeTab === "settings" && (
                <div className="p-4 space-y-5">
                  {/* Speed */}
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      Playback Speed
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {SPEED_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          data-ocid={`video_editor.speed.${s}x`}
                          onClick={() => setPlaybackSpeed(s)}
                          className="py-2 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            backgroundColor:
                              playbackSpeed === s
                                ? "var(--fsx-accent)"
                                : "var(--fsx-bg-elevated)",
                            color:
                              playbackSpeed === s
                                ? "white"
                                : "var(--fsx-text-secondary)",
                            border:
                              playbackSpeed === s
                                ? "1px solid var(--fsx-accent)"
                                : "1px solid var(--fsx-border)",
                          }}
                        >
                          {s}×
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume */}
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      Volume
                    </h4>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        data-ocid="video_editor.mute.toggle"
                        onClick={toggleMute}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: "var(--fsx-bg-elevated)",
                          border: "1px solid var(--fsx-border)",
                          color: "var(--fsx-text-secondary)",
                        }}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? (
                          <VolumeX size={13} />
                        ) : (
                          <Volume2 size={13} />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: "var(--fsx-accent)" }}
                        aria-label="Volume"
                      />
                      <span
                        className="text-xs font-mono w-8 text-right"
                        style={{ color: "var(--fsx-text-muted)" }}
                      >
                        {volume}%
                      </span>
                    </div>
                  </div>

                  {/* Replace video */}
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      Video File
                    </h4>
                    <label
                      data-ocid="video_editor.replace.upload_button"
                      className="fsx-btn-secondary text-xs cursor-pointer w-full flex items-center justify-center gap-2"
                    >
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                      <Upload size={12} /> Replace Video
                    </label>
                  </div>

                  {/* Download */}
                  <div
                    className="p-3 rounded-xl space-y-3"
                    style={{
                      backgroundColor: "var(--fsx-bg-elevated)",
                      border: "1px solid var(--fsx-border)",
                    }}
                  >
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      Export
                    </h4>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--fsx-text-muted)" }}
                    >
                      Effects and adjustments are applied as real-time preview.
                      Download saves the original video file.
                    </p>
                    <button
                      type="button"
                      data-ocid="video_editor.download.button"
                      onClick={downloadVideo}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{
                        backgroundColor: "var(--fsx-accent)",
                        color: "white",
                      }}
                    >
                      <Upload
                        size={12}
                        style={{ transform: "rotate(180deg)" }}
                      />{" "}
                      Download Video
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── AdjustmentSlider ──────────────────────────────────────────────────────── */
type AdjSliderProps = {
  label: string;
  value: number;
  min?: number;
  onChange: (v: number) => void;
  onCommit?: () => void;
};
function AdjustmentSlider({
  label,
  value,
  min = -100,
  onChange,
  onCommit,
}: AdjSliderProps) {
  return (
    <div className="py-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: "var(--fsx-text-muted)" }}>
          {label}
        </span>
        <span
          className="text-xs font-mono"
          style={{
            color: value === 0 ? "var(--fsx-text-muted)" : "var(--fsx-accent)",
          }}
        >
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <input
        data-ocid={`video_editor.adjust.${label.toLowerCase()}`}
        type="range"
        min={min}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onCommit}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "var(--fsx-accent)" }}
      />
    </div>
  );
}

/* ─── MiniSlider ────────────────────────────────────────────────────────────── */
type MiniSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
};
function MiniSlider({ label, value, min, max, onChange }: MiniSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs w-20 shrink-0"
        style={{ color: "var(--fsx-text-muted)" }}
      >
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "var(--fsx-accent)" }}
        aria-label={label}
      />
      <span
        className="text-xs font-mono w-8 text-right"
        style={{ color: "var(--fsx-text-muted)" }}
      >
        {value}
      </span>
    </div>
  );
}
