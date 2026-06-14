import { useEffect, useState, useCallback, useRef, MouseEvent } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ListChecks,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { adminAPI, needsAPI } from "../../services/api";
import {
  formatCurrency,
  getCategoryIcon,
  getUrgencyColor,
} from "../../lib/utils";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5001";

export default function AdminNeeds() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Image preview state
  const [previewImages, setPreviewImages] = useState<string[] | null>(null);

  useEffect(() => {
    loadNeeds();
  }, []);

  const loadNeeds = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingNeeds();
      setNeeds(res.data.data || []);
    } catch {
      setNeeds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (
    id: string,
    status: string,
    rejectionReason?: string,
  ) => {
    try {
      await needsAPI.updateStatus(id, { status, rejectionReason });
      toast.success(
        status === "approved" ? "Need approved ✅" : "Need rejected ❌",
      );
      setNeeds((prev) => prev.filter((n) => n._id !== id));
      setRejectingId(null);
      setRejectReason("");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-foreground">
          Needs Moderation
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and approve charity needs before they go live
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : needs.length === 0 ? (
        <div className="text-center py-20">
          <ListChecks className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-xl text-foreground mb-1">
            No pending needs
          </h3>
          <p className="text-muted-foreground text-sm">
            All charity needs have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {needs.map((need) => (
            <div
              key={need._id}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                <div className="flex-1 space-y-3">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl">
                      {getCategoryIcon(need.category)}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {need.category}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(need.urgency)}`}
                    >
                      {need.urgency}
                    </span>
                    {need.urgency === "critical" && (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Critical —
                        will broadcast push notification if approved
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-lg text-foreground">
                    {need.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {need.description}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>🏛 {need.charity?.name || "Unknown Charity"}</span>
                    <span>🎯 Target: {formatCurrency(need.targetAmount)}</span>
                    {need.deadline && (
                      <span>
                        📅 Deadline:{" "}
                        {new Date(need.deadline).toLocaleDateString("en-IN")}
                      </span>
                    )}
                    {need.beneficiaryCount > 0 && (
                      <span>👥 {need.beneficiaryCount} beneficiaries</span>
                    )}
                  </div>

                  {/* Tags */}
                  {need.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {need.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Images button */}
                {need.images?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewImages(need.images)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs bg-secondary hover:bg-secondary/70 border border-border rounded-lg transitions-colors font-medium h-fit"
                  >
                    <ImageIcon className="w-4 h-4" />
                    View Images ({need.images.length})
                  </button>
                )}

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleStatus(need._id, "approved")}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  {rejectingId === need._id ? (
                    <div className="space-y-2 min-w-[200px]">
                      <textarea
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-background border border-red-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStatus(need._id, "rejected", rejectReason)
                          }
                          disabled={!rejectReason.trim()}
                          className="flex-1 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                          className="px-3 py-2 bg-card border border-border rounded-lg text-xs hover:bg-accent transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRejectingId(need._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold rounded-xl text-sm transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reusable Smooth Image Preview Modal */}
      <ImagePreviewModal
        images={previewImages}
        onClose={() => setPreviewImages(null)}
      />
    </div>
  );
}

interface ImagePreviewModalProps {
  images: string[] | null;
  onClose: () => void;
}

function ImagePreviewModal({ images, onClose }: ImagePreviewModalProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  // Reset viewport state parameters when changing out image lists
  useEffect(() => {
    setActiveIndex(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [images]);

  const prev = useCallback(() => {
    if (!images) return;
    setActiveIndex((idx) => (idx - 1 + images.length) % images.length);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [images]);

  const next = useCallback(() => {
    if (!images) return;
    setActiveIndex((idx) => (idx + 1) % images.length);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [images]);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 3)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.5)), []);
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Keyboard Hotkeys Interceptor
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!images) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomIn(); }
      if (e.key === "-") { e.preventDefault(); zoomOut(); }
    },
    [images, prev, next, onClose, zoomIn, zoomOut],
  );

  // Smooth Scroll-Wheel Interceptor
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    },
    [zoomIn, zoomOut]
  );

  // Background UI interactions scroll-lock configuration
  useEffect(() => {
    if (!images) return;

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
  }, [images, handleKeyDown, handleWheel]);

  if (!images) return null;

  // Drag to pan setup handlers
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
            Attached need images
            <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {activeIndex + 1} / {images.length}
            </span>
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= 0.5}
              title="Zoom out  ( - )"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-30 transition-all duration-200"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-muted-foreground min-w-[44px] text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= 3}
              title="Zoom in  ( + )"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-30 transition-all duration-200"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={resetZoom}
              title="Reset view"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted transition-all duration-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            <button
              type="button"
              onClick={onClose}
              title="Close  (Esc)"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main interactive viewport container */}
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
              src={`${API_BASE}${images[activeIndex]}`}
              alt={`Need verification attachment ${activeIndex + 1}`}
              className="max-w-full max-h-full object-contain pointer-events-none transition-opacity duration-200 ease-in-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x400/1a1a1a/555?text=Image+not+found";
              }}
            />
          </div>

          {/* Navigational Steppers */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                title="Previous  (←)"
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white border border-white/10 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                title="Next  (→)"
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
                onClick={() => {
                  setActiveIndex(idx);
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 ${
                  idx === activeIndex
                    ? "border-primary ring-2 ring-primary/20 scale-105 opacity-100"
                    : "border-transparent opacity-40 hover:opacity-90"
                }`}
              >
                <img
                  src={`${API_BASE}${img}`}
                  alt={`Thumbnail item indicator ${idx + 1}`}
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

        {/* Keyboard Interaction Hints */}
        <div className="px-4 py-2 border-t border-border bg-muted/10 select-none">
          <p className="text-[11px] text-muted-foreground text-center tracking-wide font-medium">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">Scroll</kbd> or <kbd className="px-1 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">+</kbd>/<kbd className="px-1 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">-</kbd> to zoom
            {images.length > 1 && (
              <>
                {" "}·{" "}
                <kbd className="px-1 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">←</kbd> / <kbd className="px-1 py-0.5 bg-muted border border-border/60 rounded shadow-sm text-[10px]">→</kbd> to navigate
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