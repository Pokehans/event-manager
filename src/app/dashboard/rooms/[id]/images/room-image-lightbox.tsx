"use client";

import { useEffect, useState } from "react";

type Image = {
  id: string;
  file_name: string;
  alt_text: string | null;
  signedUrl: string | null;
};

type Props = {
  images: Image[];
};

export function RoomImageLightbox({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  function open(index: number) {
    setActiveIndex(index);
  }

  function close() {
    setActiveIndex(null);
  }

  function next() {
    setActiveIndex((current) => {
        if (current === null) return current;
        return (current + 1) % images.length;
    });
    }

    function prev() {
    setActiveIndex((current) => {
        if (current === null) return current;
        return (current - 1 + images.length) % images.length;
    });
    }

useEffect(() => {
  if (activeIndex === null) return;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      setActiveIndex(null);
    }

    if (event.key === "ArrowRight" && images.length > 1) {
      setActiveIndex((current) => {
        if (current === null) return current;
        return (current + 1) % images.length;
      });
    }

    if (event.key === "ArrowLeft" && images.length > 1) {
      setActiveIndex((current) => {
        if (current === null) return current;
        return (current - 1 + images.length) % images.length;
      });
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [activeIndex, images.length]);

useEffect(() => {
  if (activeIndex === null) return;

  const originalBodyOverflow = document.body.style.overflow;
  const originalHtmlOverflow = document.documentElement.style.overflow;
  const originalBodyPaddingRight = document.body.style.paddingRight;

  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
  };
}, [activeIndex]);

  return (
    <>
      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, index) => (
            <div
                key={img.id}
                className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                >
                <button
                type="button"
                onClick={() => open(index)}
                className="block w-full overflow-hidden"
                >
                {img.signedUrl ? (
                    <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={img.signedUrl}
                        alt={img.alt_text || img.file_name}
                        className="aspect-[4/3] w-full object-cover transition hover:scale-105"
                    />
                    </>
                ) : null}
                </button>

                <div className="space-y-3 p-3">
                    <p className="break-all text-sm font-medium leading-5 text-[var(--color-text)]">
                      {img.file_name}
                    </p>
                  </div>
            </div>
            ))}
      </div>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={close}
            onTouchStart={(e) => {
                setTouchStartX(e.touches[0].clientX);
                setTouchEndX(null);
            }}
            onTouchMove={(e) => {
                setTouchEndX(e.touches[0].clientX);
            }}
            onTouchEnd={() => {
                if (touchStartX === null || touchEndX === null) return;

                const distance = touchStartX - touchEndX;

                const threshold = 50; 

                if (distance > threshold && images.length > 1) {
                next();
                }

                if (distance < -threshold && images.length > 1) {
                prev();
                }
            }}
            >
          {/* Close */}
            <button
            type="button"
            onClick={(event) => {
                event.stopPropagation();
                close();
            }}
            className="absolute right-6 top-6 text-white text-xl"
            >
            ✕
            </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                prev();
                }}
              className="absolute left-6 text-white text-3xl"
            >
              ‹
            </button>
          )}

          {/* Image */}
          {images[activeIndex].signedUrl ? (
            <>
              <div
                className="flex items-center justify-center"
                onClick={(event) => event.stopPropagation()}
                >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={images[activeIndex].signedUrl}
                    alt={
                    images[activeIndex].alt_text ||
                    images[activeIndex].file_name
                    }
                    className="max-h-[90vh] max-w-[90vw] object-contain"
                />
            </div>
            </>
          ) : null}

          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4">
            <p className="mx-auto mb-3 max-w-[90vw] break-all text-center text-sm leading-5 text-white">
              {images[activeIndex].file_name}
            </p>

            {images.length > 1 ? (
                <div
                className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-2 pb-1"
                onClick={(event) => event.stopPropagation()}
                >
                {images.map((image, index) => (
                    <button
                    key={image.id}
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        setActiveIndex(index);
                    }}
                    className={[
                        "h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition",
                        index === activeIndex
                        ? "border-white opacity-100"
                        : "border-white/30 opacity-60 hover:opacity-100",
                    ].join(" ")}
                    >
                    {image.signedUrl ? (
                        <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image.signedUrl}
                            alt={image.alt_text || image.file_name}
                            className="h-full w-full object-cover"
                        />
                        </>
                    ) : null}
                    </button>
                ))}
                </div>
            ) : null}
            </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                next();
                }}
              className="absolute right-6 text-white text-3xl"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}