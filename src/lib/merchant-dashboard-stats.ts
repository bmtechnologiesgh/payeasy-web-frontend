import { listMerchantProducts } from "@/lib/merchant-products-api";

export type MerchantProductStats = {
  total: number;
  published: number;
  draft: number;
  archived: number;
};

export async function fetchMerchantProductStats(token: string): Promise<MerchantProductStats> {
  const [all, published, draft, archived] = await Promise.all([
    listMerchantProducts(token, { per_page: 1 }),
    listMerchantProducts(token, { status: "published", per_page: 1 }),
    listMerchantProducts(token, { status: "draft", per_page: 1 }),
    listMerchantProducts(token, { status: "archived", per_page: 1 }),
  ]);

  return {
    total: all.meta.count,
    published: published.meta.count,
    draft: draft.meta.count,
    archived: archived.meta.count,
  };
}

export function merchantProfileCompletionPercent(merchant: {
  trading_name?: string | null;
  country?: string | null;
  ship_from_line1?: string | null;
  ship_from_city?: string | null;
  payout_bank_name?: string | null;
  payout_account_number?: string | null;
  payout_mobile_money_number?: string | null;
  support_email?: string | null;
  support_phone?: string | null;
} | null): number {
  if (!merchant) {
    return 0;
  }

  const checks = [
    Boolean(merchant.trading_name?.trim()),
    Boolean(merchant.country?.trim()),
    Boolean(merchant.ship_from_line1?.trim() && merchant.ship_from_city?.trim()),
    Boolean(
      (merchant.payout_bank_name?.trim() && merchant.payout_account_number?.trim()) ||
        merchant.payout_mobile_money_number?.trim(),
    ),
    Boolean(merchant.support_email?.trim() || merchant.support_phone?.trim()),
  ];

  const done = checks.filter(Boolean).length;

  return Math.round((done / checks.length) * 100);
}
