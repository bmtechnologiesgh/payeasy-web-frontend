"use client";

import { MerchantProductDetailPreview } from "@/components/merchant/MerchantProductDetailPreview";
import { MerchantProductImagesEditor } from "@/components/merchant/MerchantProductImagesEditor";
import { StatusBadge } from "@/components/merchant/StatusBadge";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  createMerchantProduct,
  updateMerchantProduct,
  type MerchantProduct,
  type MerchantProductPayload,
} from "@/lib/merchant-products-api";
import {
  emptyPendingProductFiles,
  hasPendingProductFiles,
  imageSlotsToPayload,
  productToImageSlots,
  uploadStagedProductImages,
  type PendingProductFiles,
} from "@/lib/merchant-product-images";
import { getAccessToken } from "@/lib/auth-token";
import { listBrands, listProductModels } from "@/lib/product-brands-api";
import { listProductCategories } from "@/lib/product-categories-api";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchableSelectOption } from "@/components/ui/SearchableSelect";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

type Props = {
  product?: MerchantProduct;
};

function priceField(
  product: MerchantProduct | undefined,
  key: keyof MerchantProduct["prices_ghs"],
): string {
  const v = product?.prices_ghs[key];
  return v != null ? String(v) : "";
}

const fieldLabelClass = "block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]";

function withCurrentOption(
  options: SearchableSelectOption[],
  current: string,
): SearchableSelectOption[] {
  const trimmed = current.trim();
  if (trimmed === "" || options.some((o) => o.value === trimmed)) {
    return options;
  }

  return [{ value: trimmed, label: trimmed }, ...options];
}

export function MerchantProductForm({ product }: Props) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialImages = productToImageSlots(product);
  const [imageSlots, setImageSlots] = useState(initialImages.slots);
  const [displayImageIndex, setDisplayImageIndex] = useState(initialImages.displayIndex);
  const [pendingFiles, setPendingFiles] = useState<PendingProductFiles>(emptyPendingProductFiles);
  const imageSlotsRef = useRef(imageSlots);
  imageSlotsRef.current = imageSlots;

  useEffect(() => {
    return () => {
      imageSlotsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [model, setModel] = useState(product?.model ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [status, setStatus] = useState(product?.status ?? "draft");
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [brandOptions, setBrandOptions] = useState<SearchableSelectOption[]>([]);
  const [modelOptions, setModelOptions] = useState<SearchableSelectOption[]>([]);

  useEffect(() => {
    listProductCategories()
      .then((items) => setCategoryOptions(items.map((c) => ({ value: c.name, label: c.name }))))
      .catch(() => {
        setCategoryOptions([]);
      });
  }, []);

  useEffect(() => {
    listBrands()
      .then((items) => setBrandOptions(items.map((b) => ({ value: b.name, label: b.name }))))
      .catch(() => setBrandOptions([]));
  }, []);

  const loadModelsForBrand = useCallback((brandName: string) => {
    const trimmed = brandName.trim();
    if (trimmed === "") {
      setModelOptions([]);
      return;
    }

    listProductModels(trimmed)
      .then((items) => setModelOptions(items.map((m) => ({ value: m.name, label: m.name }))))
      .catch(() => setModelOptions([]));
  }, []);

  useEffect(() => {
    loadModelsForBrand(brand);
  }, [brand, loadModelsForBrand]);

  const brandSelectOptions = useMemo(() => withCurrentOption(brandOptions, brand), [brand, brandOptions]);

  const modelSelectOptions = useMemo(() => withCurrentOption(modelOptions, model), [model, modelOptions]);
  const [sku, setSku] = useState(product?.sku ?? "");
  const [stock, setStock] = useState(product?.stock_quantity != null ? String(product.stock_quantity) : "");
  const [isDeal, setIsDeal] = useState(product?.is_deal ?? false);
  const [price3, setPrice3] = useState(priceField(product, "months3"));
  const [price4, setPrice4] = useState(priceField(product, "months4"));
  const [price5, setPrice5] = useState(priceField(product, "months5"));
  const [price6, setPrice6] = useState(priceField(product, "months6"));

  const previewFromPrice = useMemo(() => {
    const prices = [price3, price4, price5, price6]
      .map((p) => {
        const t = p.trim();
        if (t === "") return null;
        const n = Number(t);
        return Number.isFinite(n) ? n : null;
      })
      .filter((n): n is number => n !== null);
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [price3, price4, price5, price6]);

  const inputClass =
    "mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2 disabled:opacity-60";
  const textareaClass = `${inputClass} min-h-[120px] resize-y`;

  function parseOptionalNumber(raw: string): number | null {
    const t = raw.trim();
    if (t === "") {
      return null;
    }
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  function buildPayload(includeDisplayIndex = true): MerchantProductPayload {
    const payload: MerchantProductPayload = {
      name: name.trim(),
      brand: brand.trim() === "" ? null : brand.trim(),
      model: model.trim() === "" ? null : model.trim(),
      description: description.trim() === "" ? null : description.trim(),
      category: category.trim(),
      status,
      sku: sku.trim() === "" ? null : sku.trim(),
      stock_quantity: parseOptionalNumber(stock),
      is_deal: isDeal,
      prices_ghs: {
        months3: parseOptionalNumber(price3),
        months4: parseOptionalNumber(price4),
        months5: parseOptionalNumber(price5),
        months6: parseOptionalNumber(price6),
      },
    };

    if (includeDisplayIndex) {
      const { display_image_index } = imageSlotsToPayload(imageSlots, displayImageIndex);
      payload.display_image_index = display_image_index;
    }

    return payload;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) {
      return;
    }

    if (!name.trim() || !category.trim()) {
      setError("Name and category are required.");
      return;
    }

    setError(null);
    setBusy(true);

    try {
      if (isEdit && product) {
        await updateMerchantProduct(token, product.uuid, buildPayload());
        router.push(portalHref("merchant", "/products"));
        return;
      }

      const stagingPhotos = hasPendingProductFiles(pendingFiles);
      const { product: created } = await createMerchantProduct(
        token,
        buildPayload(!stagingPhotos),
      );

      if (stagingPhotos) {
        await uploadStagedProductImages(token, created.uuid, pendingFiles);
        const { display_image_index } = imageSlotsToPayload(imageSlots, displayImageIndex);
        await updateMerchantProduct(token, created.uuid, { display_image_index });
      }

      router.push(portalHref("merchant", "/products"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[color:var(--color-muted)]">
            <Link
              href={portalHref("merchant", "/products")}
              className="font-semibold text-[color:var(--color-primary)] hover:underline"
            >
              ← All products
            </Link>
          </p>
          {isEdit && product?.status ? <StatusBadge status={product.status} /> : null}
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
          >
            {error}
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                Product photos
              </h2>
              <div className="mt-4">
                <MerchantProductImagesEditor
                  productUuid={product?.uuid ?? null}
                  slots={imageSlots}
                  displayIndex={displayImageIndex}
                  pendingFiles={isEdit ? undefined : pendingFiles}
                  onPendingFilesChange={isEdit ? undefined : setPendingFiles}
                  onChange={({ slots, displayIndex }) => {
                    setImageSlots(slots);
                    setDisplayImageIndex(displayIndex);
                  }}
                  onError={setError}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                Listing details
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="product-name" className={fieldLabelClass}>
                    Product name <span className="text-[color:var(--color-danger)]">*</span>
                  </label>
                  <input
                    id="product-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <SearchableSelect
                  id="product-brand"
                  label="Brand (optional)"
                  value={brand}
                  onChange={(next) => {
                    if (next.trim() !== brand.trim()) {
                      setModel("");
                    }
                    setBrand(next);
                  }}
                  options={brandSelectOptions}
                  placeholder="Select or add brand"
                  searchPlaceholder="Search brands…"
                  emptyMessage="No brands found"
                  allowCustom
                  customOptionLabel={(query) => `Use brand "${query}"`}
                />
                <SearchableSelect
                  id="product-model"
                  label="Model (optional)"
                  value={model}
                  onChange={setModel}
                  options={modelSelectOptions}
                  placeholder={brand.trim() ? "Select or add model" : "Select a brand first"}
                  searchPlaceholder="Search models…"
                  emptyMessage={brand.trim() ? "No models found" : "Choose a brand first"}
                  allowCustom={brand.trim() !== ""}
                  customOptionLabel={(query) => `Use model "${query}"`}
                  disabled={brand.trim() === ""}
                />
                <div className="sm:col-span-2">
                  <label htmlFor="product-description" className={fieldLabelClass}>
                    Description <span className="font-normal normal-case text-[color:var(--color-muted)]">(optional)</span>
                  </label>
                  <textarea
                    id="product-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={textareaClass}
                    rows={5}
                    maxLength={5000}
                    placeholder="Specs, features, warranty, and what is included in the box."
                  />
                  <p className="mt-1 text-xs text-[color:var(--color-muted)]">{description.length} / 5000 characters</p>
                </div>
                <SearchableSelect
                  id="product-category"
                  label="Category"
                  required
                  value={category}
                  onChange={setCategory}
                  options={categoryOptions}
                  placeholder="Select category"
                  searchPlaceholder="Search categories…"
                />
                <SearchableSelect
                  id="product-status"
                  label="Listing status"
                  value={status}
                  onChange={setStatus}
                  options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
                {isEdit && product?.slug ? (
                  <div className="sm:col-span-2">
                    <p className={fieldLabelClass}>Product URL</p>
                    <p className="mt-2 font-mono text-sm text-[color:var(--color-foreground)]">{product.slug}</p>
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                      Generated automatically when you save. Updates if you change the product name.
                    </p>
                  </div>
                ) : null}
                <div>
                  <label htmlFor="product-sku" className={fieldLabelClass}>
                    SKU <span className="font-normal normal-case text-[color:var(--color-muted)]">(optional)</span>
                  </label>
                  <input id="product-sku" value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="product-stock" className={fieldLabelClass}>
                    Stock quantity <span className="font-normal normal-case text-[color:var(--color-muted)]">(optional)</span>
                  </label>
                  <input
                    id="product-stock"
                    inputMode="numeric"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[color:var(--color-foreground)]">
                    <input
                      type="checkbox"
                      checked={isDeal}
                      onChange={(e) => setIsDeal(e.target.checked)}
                      className="size-4 rounded border-[color:var(--color-border-strong)]"
                    />
                    Mark as deal / featured offer
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                PayEasy plan prices (GHS)
              </h2>
              <p className="mt-1 text-sm text-[color:var(--color-muted)]">
                Total selling price per tenure — same structure as the public catalogue. Leave blank if not offered.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["3 months", "price-3", price3, setPrice3],
                    ["4 months", "price-4", price4, setPrice4],
                    ["5 months", "price-5", price5, setPrice5],
                    ["6 months", "price-6", price6, setPrice6],
                  ] as const
                ).map(([label, id, value, setter]) => (
                  <div key={id}>
                    <label htmlFor={id} className={fieldLabelClass}>
                      {label}
                    </label>
                    <input
                      id={id}
                      inputMode="decimal"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
              >
                {busy ? "Saving…" : isEdit ? "Save product" : hasPendingProductFiles(pendingFiles) ? "Create product & upload photos" : "Create product"}
              </button>
              <Link
                href={portalHref("merchant", "/products")}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)]"
              >
                Cancel
              </Link>
            </div>
          </div>

          <MerchantProductDetailPreview
            name={name}
            brand={brand}
            model={model}
            description={description}
            category={category}
            slots={imageSlots}
            displaySlot={displayImageIndex}
            fromPriceGhs={previewFromPrice}
            savedProduct={product}
          />
        </div>
      </form>
    </div>
  );
}
