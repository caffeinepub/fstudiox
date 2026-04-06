import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Landing from "./pages/Landing";
import Studio from "./pages/Studio";

export type Page = "landing" | "studio";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--fsx-bg-primary)" }}
    >
      {currentPage === "landing" && <Landing onNavigate={setCurrentPage} />}
      {currentPage === "studio" && <Studio onNavigate={setCurrentPage} />}
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "#14151C",
            border: "1px solid #2A2D3A",
            color: "#FFFFFF",
          },
        }}
      />
    </div>
  );
}
