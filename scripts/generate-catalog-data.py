#!/usr/bin/env python3
"""
Regenerates public catalog data from the Excel workbook + supplier PDF.

What juniors need to know:
- The spreadsheet lives at repo root: PayEasy_Product_Pricing_Updated_Calculation.xlsx
- We ONLY export client-safe fields (no cost price, no fee % columns, no source strings).
- Product photos are embedded images inside the PDF; we copy them into /public/products.
- After editing the spreadsheet, re-run this script, then commit the updated JSON + images.

Requires: macOS/Homebrew poppler (pdfimages) — `brew install poppler`
Python: system /usr/bin/python3 (Excel parsing uses stdlib only).
"""

from __future__ import annotations

import json
import math
import re
import shutil
import subprocess
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB = Path(__file__).resolve().parents[1]
XLSX = ROOT / "PayEasy_Product_Pricing_Updated_Calculation.xlsx"


def source_pdf_path() -> Path:
    """
    Never hard-code supplier filenames in this repo.

    Resolution order:
    1) PAYEASY_CATALOGUE_PDF env var (absolute or relative path)
    2) payeasy-source-catalogue.pdf next to the Excel workbook (repo root)
    """
    import os

    env = os.environ.get("PAYEASY_CATALOGUE_PDF", "").strip()
    if env:
        p = Path(env).expanduser()
        if p.is_file():
            return p
        raise SystemExit(f"PAYEASY_CATALOGUE_PDF is set but not a file: {p}")

    default = ROOT / "payeasy-source-catalogue.pdf"
    if default.is_file():
        return default

    raise SystemExit(
        "Missing source catalogue PDF.\n"
        f"- Add {default} (recommended: symlink to your latest export), or\n"
        "- Set PAYEASY_CATALOGUE_PDF to the PDF path.\n"
        "Then re-run: npm run generate:catalog"
    )
OUT_JSON = WEB / "src/data/products.json"
OUT_IMG_DIR = WEB / "public/products"
TMP_DIR = WEB / ".tmp_pdf_images"

NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def pdfimages_bin() -> str:
    path = shutil.which("pdfimages")
    if path:
        return path
    for candidate in ("/opt/homebrew/bin/pdfimages", "/usr/local/bin/pdfimages"):
        if Path(candidate).exists():
            return candidate
    raise SystemExit(
        "Could not find `pdfimages` (Poppler). Install with: brew install poppler"
    )


def get_inline_text(cell) -> str | None:
    is_el = cell.find("x:is", NS)
    if is_el is None:
        return None
    parts: list[str] = []
    for t in is_el.findall(".//x:t", NS):
        if t.text:
            parts.append(t.text)
    return "".join(parts) or None


def get_cell_value(cell) -> str | float | None:
    if cell is None:
        return None
    t = cell.attrib.get("t")
    if t == "inlineStr":
        return get_inline_text(cell)
    v = cell.find("x:v", NS)
    if v is None or v.text is None:
        return None
    if t == "n" or t is None:
        try:
            return float(v.text)
        except ValueError:
            return v.text
    return v.text


def parse_source_page(j_val: object) -> int | None:
    if j_val is None:
        return None
    m = re.search(r"(\d+)\s*$", str(j_val).strip())
    return int(m.group(1)) if m else None


def money(x: object) -> float | None:
    if x is None:
        return None
    if isinstance(x, (int, float)):
        if isinstance(x, float) and (math.isnan(x) or math.isinf(x)):
            return None
        return round(float(x), 2)
    try:
        return round(float(str(x)), 2)
    except ValueError:
        return None


def slugify(name: str, row: int) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    base = base[:72] if base else f"item-{row}"
    return f"{base}-r{row}"


def read_rows():
    import xml.etree.ElementTree as ET

    z = zipfile.ZipFile(XLSX)
    sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
    rows: list[tuple[int, dict[str, object]]] = []
    for row in sheet.findall("x:sheetData/x:row", NS):
        ridx = int(row.attrib["r"])
        cells: dict[str, object] = {}
        for c in row.findall("x:c", NS):
            ref = c.attrib["r"]
            col = re.sub(r"\d+", "", ref)
            cells[col] = c
        rows.append((ridx, cells))
    rows.sort(key=lambda x: x[0])
    return rows


def parse_pdfimage_list(pdf: Path) -> list[dict]:
    out = subprocess.check_output([pdfimages_bin(), "-list", str(pdf)], text=True)
    lines = [ln for ln in out.splitlines() if re.match(r"^\s*\d+", ln)]
    entries: list[dict] = []
    file_index = 0
    for ln in lines:
        parts = ln.split()
        page = int(parts[0])
        img_type = parts[2]
        w, h = int(parts[3]), int(parts[4])
        comp = parts[6]
        row = {
            "page": page,
            "type": img_type,
            "w": w,
            "h": h,
            "comp": comp,
            "file_index": file_index,
        }
        file_index += 1
        entries.append(row)
    return entries


def suitable_product_image(row: dict) -> bool:
    if row["type"] != "image":
        return False
    if row["comp"] != "3":
        return False
    w, h = row["w"], row["h"]
    if min(w, h) < 140:
        return False
    ar = max(w, h) / max(min(w, h), 1)
    if ar > 3.8:
        return False
    return True


def build_page_image_indices(entries: list[dict]) -> dict[int, list[int]]:
    per_page: dict[int, list[int]] = defaultdict(list)
    for e in entries:
        if suitable_product_image(e):
            per_page[e["page"]].append(e["file_index"])
    return per_page


def extract_all_pngs(pdf: Path) -> None:
    if TMP_DIR.exists():
        shutil.rmtree(TMP_DIR)
    TMP_DIR.mkdir(parents=True)
    subprocess.run(
        [pdfimages_bin(), "-png", str(pdf), str(TMP_DIR / "pe")],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def main() -> None:
    if not XLSX.exists():
        raise SystemExit(f"Missing workbook: {XLSX}")
    pdf = source_pdf_path()

    rows = read_rows()
    products: list[dict] = []
    by_page: dict[int, list[dict]] = defaultdict(list)

    for ridx, cells in rows[1:]:
        def cell(col: str):
            c = cells.get(col)
            return get_cell_value(c) if c is not None else None  # type: ignore[arg-type]

        name = cell("A")
        if not name or not isinstance(name, str) or name.strip().lower() == "product":
            continue
        cat = cell("B")
        category = cat.strip() if isinstance(cat, str) and cat.strip() else "General"

        p3 = money(cell("F"))
        p4 = money(cell("G"))
        p5 = money(cell("H"))
        p6 = money(cell("I"))
        prices = [x for x in (p3, p4, p5, p6) if x is not None]
        from_price = min(prices) if prices else None

        page = parse_source_page(cell("J")) or 2

        pid = slugify(name.strip(), ridx)
        prod = {
            "id": pid,
            "name": name.strip(),
            "category": category,
            "pricesGhs": {
                "months3": p3,
                "months4": p4,
                "months5": p5,
                "months6": p6,
            },
            "fromPriceGhs": from_price,
            "_page": page,
        }
        products.append(prod)
        by_page[page].append(prod)

    entries = parse_pdfimage_list(pdf)
    per_page_files = build_page_image_indices(entries)

    extract_all_pngs(pdf)

    OUT_IMG_DIR.mkdir(parents=True, exist_ok=True)
    for f in OUT_IMG_DIR.glob("*.png"):
        f.unlink()

    used_names: set[str] = set()

    for page, prods in sorted(by_page.items()):
        indices = per_page_files.get(page, [])
        if len(indices) < len(prods):
            raise SystemExit(
                f"Not enough images on PDF page {page}: need {len(prods)}, have {len(indices)}"
            )
        for prod, fi in zip(prods, indices):
            src = TMP_DIR / f"pe-{fi:03d}.png"
            if not src.exists():
                raise SystemExit(f"Missing extracted file {src}")
            dst_name = prod["id"] + ".png"
            dst = OUT_IMG_DIR / dst_name
            shutil.copyfile(src, dst)
            used_names.add(dst_name)
            prod["image"] = f"/products/{dst_name}"
            del prod["_page"]

    shutil.rmtree(TMP_DIR, ignore_errors=True)

    deal_ids = {p["id"] for p in sorted(products, key=lambda x: x["fromPriceGhs"] or 1e12)[:8]}
    for p in products:
        p["deal"] = p["id"] in deal_ids

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(products, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {len(products)} products -> {OUT_JSON}")
    print(f"Wrote {len(used_names)} images -> {OUT_IMG_DIR}")


if __name__ == "__main__":
    main()
