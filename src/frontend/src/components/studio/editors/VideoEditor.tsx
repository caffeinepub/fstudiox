import {
  Clock,
  Maximize,
  Pause,
  Play,
  Upload,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideoEditor() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoName(file.name);
    setIsPlaying(false);
    setCurrentTime(0);
    setTrimStart(0);
    setTrimEnd(100);
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

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  return (
    <div
      data-ocid="video_editor.panel"
      className="flex h-full overflow-hidden"
      style={{ backgroundColor: "var(--fsx-bg-primary)" }}
    >
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!videoUrl ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div
              data-ocid="video_editor.dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
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
                <Video size={28} style={{ color: "var(--fsx-accent)" }} />
              </div>
              <div className="text-center">
                <p className="font-medium text-white mb-1">Drop a video here</p>
                <p
                  className="text-sm"
                  style={{ color: "var(--fsx-text-muted)" }}
                >
                  MP4, MOV, WebM supported
                </p>
              </div>
              <label className="fsx-btn-primary cursor-pointer">
                <input
                  data-ocid="video_editor.upload_button"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <span className="flex items-center gap-2">
                  <Upload size={14} /> Choose Video
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Video Player */}
            <div className="flex-1 flex items-center justify-center bg-black p-4 overflow-hidden">
              <video
                data-ocid="video_editor.canvas_target"
                ref={videoRef}
                src={videoUrl}
                className="max-w-full max-h-full rounded-xl"
                onTimeUpdate={() =>
                  setCurrentTime(videoRef.current?.currentTime ?? 0)
                }
                onLoadedMetadata={() => {
                  const d = videoRef.current?.duration ?? 0;
                  setDuration(d);
                  setTrimEnd(d);
                }}
                onEnded={() => setIsPlaying(false)}
              >
                <track kind="captions" />
              </video>
            </div>

            {/* Custom Controls */}
            <div
              className="px-5 py-3 border-t space-y-3"
              style={{
                backgroundColor: "var(--fsx-bg-surface)",
                borderColor: "var(--fsx-border)",
              }}
            >
              {/* Seek bar */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: "var(--fsx-accent)" }}
              />

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    data-ocid="video_editor.play_pause.toggle"
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
                    style={{ backgroundColor: "var(--fsx-accent)" }}
                    onMouseEnter={(e) => {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "var(--fsx-accent-hover)";
                    }}
                    onMouseLeave={(e) => {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "var(--fsx-accent)";
                    }}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>

                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--fsx-text-muted)" }}
                  >
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-ocid="video_editor.mute.toggle"
                    onClick={toggleMute}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: "var(--fsx-text-muted)" }}
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "var(--fsx-accent)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right panel: Metadata & Trim */}
      {videoUrl && (
        <aside
          className="w-64 shrink-0 border-l p-5 flex flex-col gap-5 overflow-y-auto"
          style={{
            backgroundColor: "var(--fsx-bg-surface)",
            borderColor: "var(--fsx-border)",
          }}
        >
          <h3 className="text-sm font-semibold text-white">Video Info</h3>

          <div className="space-y-3">
            <div
              className="flex items-center gap-2"
              style={{ color: "var(--fsx-text-secondary)" }}
            >
              <Clock size={13} style={{ color: "var(--fsx-accent)" }} />
              <span className="text-xs">Duration: {formatTime(duration)}</span>
            </div>
            <div
              className="flex items-center gap-2"
              style={{ color: "var(--fsx-text-secondary)" }}
            >
              <Maximize size={13} style={{ color: "var(--fsx-accent)" }} />
              <span className="text-xs">File: {videoName}</span>
            </div>
          </div>

          <div
            className="border-t pt-4"
            style={{ borderColor: "var(--fsx-border)" }}
          >
            <h4 className="text-xs font-semibold mb-3 text-white">
              Trim Range
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
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
                    {formatTime(trimStart)}
                  </span>
                </div>
                <input
                  data-ocid="video_editor.trim_start.input"
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={trimStart}
                  onChange={(e) => setTrimStart(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "var(--fsx-accent)" }}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
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
                    {formatTime(trimEnd)}
                  </span>
                </div>
                <input
                  data-ocid="video_editor.trim_end.input"
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "var(--fsx-accent)" }}
                />
              </div>
            </div>
          </div>

          <div
            className="mt-auto pt-4 border-t"
            style={{ borderColor: "var(--fsx-border)" }}
          >
            <label className="fsx-btn-secondary text-xs cursor-pointer w-full flex items-center justify-center gap-2">
              <input
                data-ocid="video_editor.replace.upload_button"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <Upload size={13} /> Replace Video
            </label>
          </div>
        </aside>
      )}
    </div>
  );
}
