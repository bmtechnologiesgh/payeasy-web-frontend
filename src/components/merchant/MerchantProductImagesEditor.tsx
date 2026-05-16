"use client";

import {
  deleteMerchantProductImage,
  getMerchantProductImageSettings,
  uploadMerchantProductImage,
  type MerchantProductImageSettings,
} from "@/lib/merchant-products-api";
import {
  MAX_PRODUCT_IMAGES,
  type PendingProductFiles,
  productToImageSlots,
} from "@/lib/merchant-product-images";
import { getAccessToken } from "@/lib/auth-token";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  productUuid: string | null;
  slots: string[];
  displayIndex: number;
  pendingFiles?: PendingProductFiles;
  onPendingFilesChange?: (files: PendingProductFiles) => void;
  onChange: (next: { slots: string[]; displayIndex: number }) => void;
  onError?: (message: string) => void;
};

function acceptAttribute(): string {
  return "image/jpeg,image/png,image/webp";
}

function isBlobPreview(url: string): boolean {
  return url.startsWith("blob:");
}

function revokeIfBlob(url: string): void {
  if (isBlobPreview(url)) {
    URL.revokeObjectURL(url);
  }
}

export function MerchantProductImagesEditor({
  productUuid,
  slots,
  displayIndex,
  pendingFiles,
  onPendingFilesChange,
  onChange,
  onError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<MerchantProductImageSettings | null>(null);
  const [busySlot, setBusySlot] = useState<number | "add" | null>(null);
  const [pendingSlot, setPendingSlot] = useState<number | null>(null);

  const isStaging = !productUuid;
  const canStage = isStaging && Boolean(onPendingFilesChange && pendingFiles);

  const filledIndices = slots
    .map((url, index) => (url.trim() !== "" ? index : -1))
    .filter((index) => index >= 0);
  const filledCount = filledIndices.length;
  const canAddMore = filledCount < MAX_PRODUCT_IMAGES;

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }
    getMerchantProductImageSettings(token)
      .then(setSettings)
      .catch(() => {
        setSettings({
          max_count: MAX_PRODUCT_IMAGES,
          max_upload_kb: 5120,
          max_upload_mb: 5,
          max_dimension: 2000,
          allowed_types: ["JPEG", "PNG", "WebP"],
        });
      });
  }, []);

  function openFilePicker(slot: number) {
    setPendingSlot(slot);
    fileInputRef.current?.click();
  }

  function validateFile(file: File): string | null {
    const maxKb = settings?.max_upload_kb ?? 5120;
    if (file.size > maxKb * 1024) {
      const maxMb = settings?.max_upload_mb ?? Math.ceil(maxKb / 1024);
      return `Each photo must be smaller than ${maxMb} MB.`;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return "Use a JPEG, PNG, or WebP photo.";
    }
    return null;
  }

  function stageFileAtSlot(slot: number, file: File) {
    if (!pendingFiles || !onPendingFilesChange) {
      return;
    }

    const nextFiles = [...pendingFiles];
    const nextSlots = [...slots];

    if (nextSlots[slot]) {
      revokeIfBlob(nextSlots[slot]);
    }

    nextFiles[slot] = file;
    nextSlots[slot] = URL.createObjectURL(file);
    onPendingFilesChange(nextFiles);

    let nextDisplay = displayIndex;
    if (filledCount === 0) {
      nextDisplay = slot;
    }

    onChange({ slots: nextSlots, displayIndex: nextDisplay });
  }

  async function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    const slot = pendingSlot;
    setPendingSlot(null);

    if (!file || slot === null) {
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    if (canStage) {
      stageFileAtSlot(slot, file);
      return;
    }

    if (!productUuid) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      return;
    }

    const isAdd = slot >= filledCount;
    setBusySlot(isAdd ? "add" : slot);

    try {
      const { product } = await uploadMerchantProductImage(token, productUuid, file, slot);
      const mapped = productToImageSlots(product);
      onChange({ slots: mapped.slots, displayIndex: mapped.displayIndex });
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Could not upload photo.");
    } finally {
      setBusySlot(null);
    }
  }

  function setDisplay(index: number) {
    if (!slots[index]?.trim()) {
      return;
    }
    onChange({ slots, displayIndex: index });
  }

  function removeStagedImage(index: number) {
    if (!pendingFiles || !onPendingFilesChange) {
      return;
    }

    const nextFiles = [...pendingFiles];
    const nextSlots = [...slots];

    if (nextSlots[index]) {
      revokeIfBlob(nextSlots[index]);
    }

    nextFiles[index] = null;
    nextSlots[index] = "";
    onPendingFilesChange(nextFiles);

    let nextDisplay = displayIndex;
    if (displayIndex === index) {
      const firstFilled = nextSlots.findIndex((s) => s.trim() !== "");
      nextDisplay = firstFilled >= 0 ? firstFilled : 0;
    }

    onChange({ slots: nextSlots, displayIndex: nextDisplay });
  }

  async function removeImage(index: number) {
    if (!slots[index]?.trim()) {
      return;
    }

    if (canStage) {
      removeStagedImage(index);
      return;
    }

    if (!productUuid) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      return;
    }

    setBusySlot(index);

    try {
      const { product } = await deleteMerchantProductImage(token, productUuid, index);
      const mapped = productToImageSlots(product);
      onChange({ slots: mapped.slots, displayIndex: mapped.displayIndex });
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Could not remove photo.");
    } finally {
      setBusySlot(null);
    }
  }

  const hint = settings
    ? `JPEG, PNG, or WebP · up to ${settings.max_upload_mb} MB each · resized to ${settings.max_dimension}px max`
    : "JPEG, PNG, or WebP · up to 5 MB each";

  return (
    <div className="space-y-4">
      <p className="text-sm text-[color:var(--color-muted)]">
        {isStaging
          ? `Add up to ${MAX_PRODUCT_IMAGES} photos now — they upload when you create the product. Choose a display image for your product list. ${hint}.`
          : `Upload up to ${MAX_PRODUCT_IMAGES} product photos. Choose one as the display image — it appears in your product list and as the main photo on the product page. ${hint}.`}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttribute()}
        className="sr-only"
        onChange={onFileSelected}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filledIndices.map((index) => {
          const url = slots[index].trim();
          const isDisplay = displayIndex === index;
          const isBusy = busySlot === index;
          const useUnoptimized = isBlobPreview(url);

          return (
            <div
              key={index}
              className={`rounded-xl border p-3 transition ${
                isDisplay
                  ? "border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary)]/25"
                  : "border-[color:var(--color-border-strong)]"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                  Photo {index + 1}
                </span>
                {isDisplay ? (
                  <span className="rounded-full bg-[color:var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Display
                  </span>
                ) : null}
                {isStaging ? (
                  <span className="rounded-full bg-[color:var(--color-muted-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[color:var(--color-muted)]">
                    Pending
                  </span>
                ) : null}
              </div>
              <div className="product-media relative mb-3 aspect-square overflow-hidden rounded-lg">
                <Image
                  src={url}
                  alt=""
                  fill
                  unoptimized={useUnoptimized}
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 50vw, 200px"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isBusy || isDisplay}
                  onClick={() => setDisplay(index)}
                  className="text-xs font-semibold text-[color:var(--color-primary)] disabled:opacity-40"
                >
                  Set as display
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => openFilePicker(index)}
                  className="text-xs font-semibold text-[color:var(--color-foreground)] disabled:opacity-40"
                >
                  {isBusy ? "Working…" : "Replace"}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => removeImage(index)}
                  className="text-xs font-semibold text-[color:var(--color-muted)] hover:text-[color:var(--color-danger)] disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        {canAddMore ? (
          <button
            type="button"
            disabled={busySlot === "add"}
            onClick={() => openFilePicker(filledCount)}
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-muted-bg)] p-4 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:bg-white disabled:opacity-50"
          >
            <span className="text-2xl leading-none">+</span>
            {busySlot === "add" ? "Working…" : "Add photo"}
          </button>
        ) : null}
      </div>

      <p className="text-xs text-[color:var(--color-muted)]">
        {filledCount} of {MAX_PRODUCT_IMAGES} photos {isStaging ? "selected" : "added"}.
      </p>
    </div>
  );
}
