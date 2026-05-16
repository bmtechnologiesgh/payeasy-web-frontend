import {
  getMerchantProduct,
  uploadMerchantProductImage,
  type MerchantProduct,
} from "@/lib/merchant-products-api";

export const MAX_PRODUCT_IMAGES = 6;

export type PendingProductFiles = (File | null)[];

export function emptyPendingProductFiles(): PendingProductFiles {
  return Array<File | null>(MAX_PRODUCT_IMAGES).fill(null);
}

export function hasPendingProductFiles(pending: PendingProductFiles): boolean {
  return pending.some((file) => file !== null);
}

/** Upload staged files after product create (slot index preserved). */
export async function uploadStagedProductImages(
  token: string,
  productUuid: string,
  pendingFiles: PendingProductFiles,
): Promise<MerchantProduct> {
  let product: MerchantProduct | undefined;

  for (let slot = 0; slot < pendingFiles.length; slot++) {
    const file = pendingFiles[slot];
    if (!file) {
      continue;
    }
    const result = await uploadMerchantProductImage(token, productUuid, file, slot);
    product = result.product;
  }

  if (product) {
    return product;
  }

  const { product: fetched } = await getMerchantProduct(token, productUuid);
  return fetched;
}

export type ProductImageSlots = {
  slots: string[];
  displayIndex: number;
};

/** Expand API images into six fixed slots for the editor UI. */
export function productToImageSlots(product?: MerchantProduct | null): ProductImageSlots {
  const slots = Array<string>(MAX_PRODUCT_IMAGES).fill("");
  const list = product?.images ?? [];
  const images = list.length > 0 ? list : product?.image_url ? [product.image_url] : [];

  images.forEach((url, i) => {
    if (i < MAX_PRODUCT_IMAGES) {
      slots[i] = url;
    }
  });

  let displayIndex = product?.display_image_index ?? 0;
  if (images.length > 0) {
    displayIndex = Math.max(0, Math.min(images.length - 1, displayIndex));
  } else {
    displayIndex = 0;
  }

  return { slots, displayIndex };
}

/** Compact non-empty slots for API payload. */
export function imageSlotsToPayload(slots: string[], displaySlot: number): {
  images: string[];
  display_image_index: number;
} {
  const images: string[] = [];
  const compactIndexBySlot: number[] = [];

  for (let i = 0; i < MAX_PRODUCT_IMAGES; i++) {
    const trimmed = slots[i]?.trim() ?? "";
    if (trimmed !== "") {
      compactIndexBySlot[i] = images.length;
      images.push(trimmed);
    } else {
      compactIndexBySlot[i] = -1;
    }
  }

  let display_image_index = 0;
  if (images.length > 0) {
    const mapped = compactIndexBySlot[displaySlot];
    display_image_index = mapped !== undefined && mapped >= 0 ? mapped : 0;
  }

  return { images, display_image_index };
}

export function productDisplayImageUrl(product: MerchantProduct): string | null {
  const list = product.images ?? [];
  if (list.length > 0) {
    const idx = Math.min(Math.max(0, product.display_image_index ?? 0), list.length - 1);
    return list[idx] ?? list[0] ?? null;
  }

  return product.image_url;
}

export function productGalleryUrls(product: MerchantProduct): string[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }

  return product.image_url ? [product.image_url] : [];
}
