import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fileToDataUrl,
  generateThumbnail,
  saveFile,
  type StoredFile,
} from "@/lib/file-storage";

/* ═══════════════════════════════════════════
   FILE UPLOAD — with animated progress
   Drag & drop + click to upload
   ═══════════════════════════════════════════ */

interface FileUploadProps {
  category: string;
  onUploaded?: (file: StoredFile) => void;
  className?: string;
  maxSizeMB?: number;
}

type UploadState = "idle" | "reading" | "processing" | "saving" | "done" | "error";

export function FileUpload({
  category,
  onUploaded,
  className,
  maxSizeMB = 5,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Hanya file gambar yang diperbolehkan.");
        setState("error");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Ukuran maksimal ${maxSizeMB}MB.`);
        setState("error");
        return;
      }

      setError(null);
      setState("reading");
      setProgress(0);

      try {
        // Step 1: Read file with progress
        const dataUrl = await fileToDataUrl(file, (p) => {
          setProgress(Math.round(p * 0.6)); // 0-60%
        });
        setPreview(dataUrl);

        // Step 2: Generate thumbnail
        setState("processing");
        setProgress(65);
        await new Promise((r) => setTimeout(r, 300)); // visual delay
        const thumbnail = await generateThumbnail(dataUrl);
        setProgress(80);

        // Step 3: Save to IndexedDB
        setState("saving");
        setProgress(85);
        await new Promise((r) => setTimeout(r, 200)); // visual delay

        const storedFile: StoredFile = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          category,
          uploadedAt: new Date().toISOString(),
          thumbnail,
        };

        setProgress(92);
        await saveFile(storedFile);
        setProgress(100);

        setState("done");
        onUploaded?.(storedFile);

        // Reset after 2s
        setTimeout(() => {
          setState("idle");
          setProgress(0);
          setPreview(null);
        }, 2000);
      } catch (err) {
        setError("Gagal mengupload file. Coba lagi.");
        setState("error");
      }
    },
    [category, maxSizeMB, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFile]
  );

  const isUploading = state === "reading" || state === "processing" || state === "saving";

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        disabled={isUploading}
        className={cn(
          "w-full border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
          "flex flex-col items-center gap-2 text-center",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-accent/30",
          isUploading && "pointer-events-none opacity-80",
          state === "done" && "border-emerald-500 bg-emerald-500/5",
          state === "error" && "border-destructive bg-destructive/5"
        )}
      >
        {state === "done" ? (
          <>
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/15">
              <Check className="size-5 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-emerald-500">Upload selesai!</p>
          </>
        ) : isUploading ? (
          <>
            <Loader2 className="size-6 text-primary animate-spin" />
            <p className="text-sm font-medium">
              {state === "reading" && "Membaca file..."}
              {state === "processing" && "Memproses gambar..."}
              {state === "saving" && "Menyimpan..."}
            </p>
          </>
        ) : (
          <>
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Upload className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Klik atau seret gambar ke sini
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PNG, JPG, WEBP — Maks {maxSizeMB}MB
              </p>
            </div>
          </>
        )}
      </button>

      {/* Progress bar — animated */}
      {isUploading && (
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{progress}% selesai</span>
            <span>
              {state === "reading" && "Reading..."}
              {state === "processing" && "Processing..."}
              {state === "saving" && "Saving..."}
            </span>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && state === "done" && (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <X className="size-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Inline image picker — browse uploaded files ── */
interface ImagePickerProps {
  category: string;
  selectedId?: string;
  onSelect?: (file: StoredFile) => void;
  className?: string;
}

export function ImagePicker({ category, selectedId, onSelect, className }: ImagePickerProps) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadFiles = useCallback(async () => {
    try {
      const { getAllFiles } = await import("@/lib/file-storage");
      const all = await getAllFiles(category);
      setFiles(all.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)));
    } catch { /* ignore */ }
    setLoaded(true);
  }, [category]);

  // Load on mount and when category changes
  useState(() => { loadFiles(); });

  if (!loaded) {
    return (
      <div className={cn("grid grid-cols-4 gap-2", className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        Belum ada gambar di kategori ini. Upload terlebih dahulu.
      </p>
    );
  }

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {files.map((file) => (
        <button
          key={file.id}
          type="button"
          onClick={() => onSelect?.(file)}
          className={cn(
            "aspect-square rounded-lg overflow-hidden border-2 transition-all",
            selectedId === file.id
              ? "border-primary ring-2 ring-primary/20"
              : "border-transparent hover:border-border"
          )}
        >
          <img
            src={file.thumbnail || file.dataUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
