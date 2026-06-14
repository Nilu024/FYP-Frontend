import { useEffect, useCallback, useState, useRef, MouseEvent } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ImagePreviewModalProps {
  images: string[];
  activeIndex: number;
  zoom: number;
  apiBase: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export default function ImagePreviewModal({
  images,
  activeIndex,
  zoom,
  apiBase,
  onClose,
  onNavigate,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ImagePreviewModalProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  const prev = useCallback(() => {
    onNavigate((activeIndex - 1 + images.length) % images.length);
    setPan({ x: 0, y: 0 });
  }, [activeIndex, images.length, onNavigate]);

  const next = useCallback(() => {
    onNavigate((activeIndex + 1) % images.length);
    setPan({ x: 0, y: 0 });
  }, [activeIndex, images.length, onNavigate]);

  // Handle keyboard hotkeys cleanly
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "+" || e.key === "=") { e.preventDefault(); onZoomIn(); }
      if (e.key === "-") { e.preventDefault(); onZoomOut(); }
    },
    [prev, next, onClose, onZoomIn, onZoomOut]
  );

  // Handle mousewheel smart zoom 
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        if (zoom < 3) onZoomIn();
      } else {
        if (zoom > 0.5) onZoomOut();
      }
    },
    [zoom, onZoomIn, onZoomOut]
  );

  // Lock background screen layout shifting
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    
    const viewerElement = viewerRef.current;
    if (viewerElement) {
      viewerElement.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
      if (viewerElement) {
        viewerElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleKeyDown, handleWheel]);

  // Reset positioning offsets when changing scale levels or swapping images
  useEffect(() => {
    if (zoom === 1) setPan({ x: 0, y: 0 });
  }, [zoom, activeIndex]);

  // Drag-to-Pan Logic
  const handleMouseDown = (e: MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 ease-out animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl scale-100 transition-transform duration-300 ease-out animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border select-none">
          <h3 className="font-semibold text-sm text-foreground">
            Need images
            <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {activeIndex + 1} / {images.length}
            </span>
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onZoomOut}
              disabled={zoom <= 0.5}
              title="Zoom out ( - )"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-30 transition-all duration-200"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-muted-foreground min-w-[44px] text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={onZoomIn}
              disabled={zoom >= 3}
              title="Zoom in ( + )"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-30 transition-all duration-200"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { onResetZoom(); setPan({ x: 0, y: 0 }); }}
              title="Reset view"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted transition-all duration-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            <button
              type="button"
              onClick={onClose}
              title="Close (Esc)"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main image viewer wrapper */}
        <div
          ref={viewerRef}
          className="relative bg-zinc-950/40 flex items-center justify-center overflow-hidden select-none"
          style={{ height: "440px" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          <div
            className="w-full h-full flex items-center justify-center will-change-transform"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
          >
            <img
              key={activeIndex}
              src={`${apiBase}${images[activeIndex]}`}
              alt={`Need verification document view ${activeIndex + 1}`}
              className="max-w-full max-h-full object-contain pointer-events-none transition-opacity duration-200 ease-in-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x400/1a1a1a/555?text=Image+not+found";
              }}
            />
          </div>

          {/* Stepper Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                title="Previous (←)"
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white border border-white/10 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                title="Next (→)"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white border border-white/10 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Carousel strip */}
        {images.length > 1 && (
          <div className="flex gap-2.5 px-4 py-3.5 border-t border-border overflow-x-auto bg-muted/20 scrollbar-none justify-center">
            {images.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => onNavigate(idx)}
                className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 ${
                  idx === activeIndex
                    ? "border-primary ring-2 ring-primary/20 scale-105 opacity-100"
                    : "border-transparent opacity-40 hover:opacity-90"
                }`}
              >
                <img
                  src={`${apiBase}${img}`}
                  alt={`Thumbnail visualization index ${idx + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/56x56/1a1a1a/555?text=?";
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Keyboard interaction instructions */}
        <div className="px-4 py-2 border-t border-border bg-muted/10 select-none">
          <p className="text-[11px] text-muted-foreground text-center tracking-wide font-medium">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">Scroll</kbd> or <kbd className="px-1 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">+</kbd>/<kbd className="px-1 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">-</kbd> to zoom
            {images.length > 1 && (
              <>
                {" "}·{" "}
                <kbd className="px-1 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">←</kbd> / <kbd className="px-1 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">→</kbd> to change view
              </>
            )}
            {" "}·{" "}
            <kbd className="px-1 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">Esc</kbd> to exit
          </p>
        </div>
      </div>
    </div>
  );
}