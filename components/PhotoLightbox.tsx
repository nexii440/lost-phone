"use client";

import { useEffect, useState } from "react";

export type LightboxFile = {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
};

export function PhotoLightbox({ files }: { files: LightboxFile[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const openFile = openIndex !== null ? files[openIndex] : null;

  useEffect(() => {
    if (openIndex === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenIndex(null);
        setZoomed(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex]);

  if (files.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {files.map((file, i) => (
          <button
            key={file.id}
            type="button"
            onClick={() => {
              setOpenIndex(i);
              setZoomed(false);
            }}
            className="group overflow-hidden rounded-md border border-ink-800/15 bg-white text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- signed URL, not a static asset next/image can optimize */}
            <img
              src={file.url}
              alt={file.fileName}
              className="aspect-square w-full object-cover transition group-hover:opacity-90"
            />
            <p className="truncate px-2 py-1.5 text-xs text-ink-600">{file.fileName}</p>
          </button>
        ))}
      </div>

      {openFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 p-4"
          onClick={() => {
            setOpenIndex(null);
            setZoomed(false);
          }}
        >
          <div
            className="relative flex max-h-full max-w-full flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex w-full items-center justify-between gap-4 text-paper-50">
              <p className="truncate text-sm">{openFile.fileName}</p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setZoomed((z) => !z)}
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  {zoomed ? "Zoom out" : "Zoom in"}
                </button>
                <a
                  href={openFile.url}
                  download={openFile.fileName}
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setOpenIndex(null);
                    setZoomed(false);
                  }}
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                  aria-label="Close"
                >
                  Close
                </button>
              </div>
            </div>
            <div className={zoomed ? "max-h-[80vh] overflow-auto" : "max-h-[80vh]"}>
              {/* eslint-disable-next-line @next/next/no-img-element -- signed URL, not a static asset next/image can optimize */}
              <img
                src={openFile.url}
                alt={openFile.fileName}
                onClick={() => setZoomed((z) => !z)}
                className={
                  zoomed
                    ? "max-w-none cursor-zoom-out"
                    : "max-h-[80vh] max-w-full cursor-zoom-in object-contain"
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
