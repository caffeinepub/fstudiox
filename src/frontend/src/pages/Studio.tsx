import { useState } from "react";
import type { Page } from "../App";
import ProjectsPanel from "../components/studio/ProjectsPanel";
import Sidebar, { type ToolId } from "../components/studio/Sidebar";
import Toolbar from "../components/studio/Toolbar";
import DesignEditor from "../components/studio/editors/DesignEditor";
import ImageEditor from "../components/studio/editors/ImageEditor";
import TextEditor from "../components/studio/editors/TextEditor";
import VideoEditor from "../components/studio/editors/VideoEditor";

interface StudioProps {
  onNavigate: (page: Page) => void;
}

export default function Studio({ onNavigate }: StudioProps) {
  const [activeTool, setActiveTool] = useState<ToolId>("text");
  const [projectTitle, setProjectTitle] = useState("Untitled Project");

  const toolLabels: Record<ToolId, string> = {
    text: "Text Editor",
    image: "Image Editor",
    video: "Video Editor",
    design: "Design Editor",
    projects: "My Projects",
  };

  return (
    <div
      data-ocid="studio.page"
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--fsx-bg-primary)" }}
    >
      {/* Sidebar */}
      <Sidebar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onNavigate={onNavigate}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          projectTitle={projectTitle}
          onProjectTitleChange={setProjectTitle}
          toolLabel={toolLabels[activeTool]}
          activeTool={activeTool}
        />

        {/* Editor Area */}
        <main
          className="flex-1 overflow-hidden"
          style={{ backgroundColor: "var(--fsx-bg-primary)" }}
        >
          {activeTool === "text" && <TextEditor />}
          {activeTool === "image" && <ImageEditor />}
          {activeTool === "video" && <VideoEditor />}
          {activeTool === "design" && <DesignEditor />}
          {activeTool === "projects" && <ProjectsPanel />}
        </main>
      </div>
    </div>
  );
}
