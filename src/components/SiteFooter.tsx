import Link from "next/link";
import { FooterNewsletter } from "@/components/FooterNewsletter";
import {
  PAYEASY_EMPLOYER_EMAIL,
  PAYEASY_SUPPORT_PHONE_DISPLAY,
  PAYEASY_SUPPORT_PHONE_TEL,
  PAYEASY_WHATSAPP_URL,
} from "@/lib/contact";

function FeatureBar() {
  const items = [
    {
      title: "Payroll-backed",
      text: "Repayments come straight from your salary — no cards, no chasing receipts.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18M7 15h4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Employer-approved",
      text: "Only employees of verified employers can buy on PayEasy — no payday-loan style sign-up.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 21V8l8-5 8 5v13" strokeLinejoin="round" />
          <path d="M9 21v-7h6v7" />
        </svg>
      ),
    },
    {
      title: "No hidden fees",
      text: "Every plan shows the total you'll pay before you commit. Service fee is baked in, not bolted on.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Salary-aware",
      text: "We cap your monthly deduction at 30% of gross salary. You stay in control.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 19V5M20 19V11M12 19V8" strokeLinecap="round" />
          <path d="M3 19h18" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-2xl bg-[color:var(--color-muted-bg)] px-4 py-8 sm:px-8">
      <div className="mx-auto grid max-w-[1280px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex gap-4">
            <span className="text-[color:var(--color-foreground)]">{item.icon}</span>
            <div>
              <p className="font-semibold text-[color:var(--color-foreground)]">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-muted)]">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[color:var(--color-border)] bg-white pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6">
        <FeatureBar />

        <div className="mt-12 grid gap-10 border-b border-[color:var(--color-border)] pb-12 lg:grid-cols-2">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 font-semibold text-[color:var(--color-foreground)]">
                <span aria-hidden>📞</span> Employee support
              </p>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                Questions about a deduction or order status? Reach our employee desk Mon–Fri, 8am–6pm GMT.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${PAYEASY_SUPPORT_PHONE_TEL}`}
                  className="text-lg font-semibold text-[color:var(--color-foreground)] underline-offset-4 hover:underline"
                >
                  {PAYEASY_SUPPORT_PHONE_DISPLAY}
                </a>
                <a
                  href={PAYEASY_WHATSAPP_URL}
                  className="rounded-full bg-[color:var(--color-muted-bg)] px-3 py-1 text-xs font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-app)]"
                >
                  WhatsApp
                </a>
              </div>
            </div>
            <div>
              <p className="flex items-center gap-2 font-semibold text-[color:var(--color-foreground)]">
                <span aria-hidden>🏢</span> Employer enquiries
              </p>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                HR and finance teams can request a payroll integration walkthrough.
              </p>
              <Link href="/employers#employer-lead-form" className="mt-3 inline-block text-sm font-semibold underline">
                Talk to our team
              </Link>
              <a
                href={`mailto:${PAYEASY_EMPLOYER_EMAIL}`}
                className="mt-2 block text-xs text-[color:var(--color-muted)] underline-offset-4 hover:underline"
              >
                {PAYEASY_EMPLOYER_EMAIL}
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)]">
              Stay in the loop
            </h3>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              New catalogue drops, eligibility tips, and employer onboarding updates — straight to your inbox.
            </p>
            <FooterNewsletter />
          </div>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="flex flex-wrap items-center gap-2 font-[family-name:var(--font-heading)] text-xl font-extrabold">
              PayEasy
              <span className="flex gap-0.5" aria-hidden>
                <span className="h-2 w-2 rounded-sm bg-[#e53935]" />
                <span className="h-2 w-2 rounded-sm bg-[#43a047]" />
                <span className="h-2 w-2 rounded-sm bg-[#1e88e5]" />
                <span className="h-2 w-2 rounded-sm bg-[#fbc02d]" />
              </span>
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
              Payroll-backed BNPL
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-muted)]">
              Pay-Small-Small, paid from your salary. PayEasy gives salaried Ghanaians employer-approved instalments
              on phones, appliances, and more — with the total payable shown before you commit.
            </p>
            <div className="mt-6 flex gap-4 text-[color:var(--color-foreground)]">
              <span className="sr-only">Social</span>
              <span aria-hidden className="cursor-default opacity-70">
                𝕏
              </span>
              <span aria-hidden className="cursor-default opacity-70">
                f
              </span>
              <span aria-hidden className="cursor-default opacity-70">
                ▶
              </span>
              <span aria-hidden className="cursor-default opacity-70">
                ⌁
              </span>
              <span aria-hidden className="cursor-default opacity-70">
                💬
              </span>
            </div>
          </div>

          <div>
            <p className="font-semibold text-[color:var(--color-foreground)]">Employees</p>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-muted)]">
              <li>
                <Link href="/eligibility" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  Check eligibility
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  How Pay-Small-Small works
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  My orders
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  Deduction FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-[color:var(--color-foreground)]">Employers</p>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-muted)]">
              <li>
                <Link href="/employers" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  Onboard your company
                </Link>
              </li>
              <li>
                <Link href="/employers" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  Payroll integration
                </Link>
              </li>
              <li>
                <Link href="/employers" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  Deduction mandate
                </Link>
              </li>
              <li>
                <Link href="/employers" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  Employer portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-[color:var(--color-foreground)]">Trust & policy</p>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-muted)]">
              <li>
                <Link href="/how-it-works" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  Fees & service charge
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  Privacy & data
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  Terms of use
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[color:var(--color-foreground)] hover:underline">
                  Responsible lending
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 border-t border-[color:var(--color-border)] py-8 text-sm text-[color:var(--color-muted)] lg:flex-row lg:justify-between">
          <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link href="/how-it-works" className="hover:underline">
              Privacy policy
            </Link>
            <Link href="/how-it-works" className="hover:underline">
              Terms of use
            </Link>
            <Link href="/how-it-works" className="hover:underline">
              Legal
            </Link>
            <Link href="/how-it-works" className="hover:underline">
              Site map
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="rounded border border-[color:var(--color-border)] px-2 py-1 text-xs font-medium text-[color:var(--color-foreground)]">
              Payroll deduction
            </span>
            <span className="rounded border border-[color:var(--color-border)] px-2 py-1 text-xs font-medium text-[color:var(--color-foreground)]">
              Employer-verified
            </span>
            <span className="rounded border border-[color:var(--color-border)] px-2 py-1 text-xs font-medium text-[color:var(--color-foreground)]">
              No hidden fees
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="inline-flex items-center gap-1 font-medium text-[color:var(--color-foreground)]">
              🌐 English
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-[color:var(--color-foreground)]">
              ₵ GHS
            </span>
          </div>
        </div>

        <p className="pb-10 text-center text-xs text-[color:var(--color-muted)]">
          Copyright © {year} PayEasy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
