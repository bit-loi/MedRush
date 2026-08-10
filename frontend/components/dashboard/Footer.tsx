import { FormEvent } from "react";
import { ActionButton } from "@/components/ui";
import { footerColumns } from "@/lib/constants";
import MedRushLogo from "./MedRushLogo";

interface FooterProps {
  newsletterEmail: string;
  setNewsletterEmail: (email: string) => void;
  newsletterMessage: string;
  onNewsletterSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNavClick: (target: string) => void;
  onRefresh: () => void;
}

export default function Footer({
  newsletterEmail,
  setNewsletterEmail,
  newsletterMessage,
  onNewsletterSubmit,
  onNavClick,
  onRefresh,
}: FooterProps) {
  return (
    <footer className="border-t-[3px] border-[var(--neo-teal)] bg-[#dfe9ec]" id="footer">
      <div className="mx-auto grid max-w-[1780px] gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[1.2fr_2fr] lg:gap-12 lg:px-20 lg:py-20 xl:py-24">
        <div>
          {/* Footer logo */}
          <div className="mb-8 flex items-center gap-3 sm:mb-10 sm:gap-4">
            <MedRushLogo className="h-12 w-[80px] sm:h-14 sm:w-[96px]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 sm:text-xs sm:tracking-[0.24em]">
                MedRush
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#111518] sm:mt-1 sm:text-sm">
                WhatsApp-first maternal health coordination
              </p>
            </div>
          </div>

          <h2 className="max-w-xl text-2xl font-medium leading-tight tracking-normal text-[#111518] sm:text-3xl md:text-4xl">
            Sign up for MedRush pilot updates and district health operations notes.
          </h2>

          <form className="mt-8 max-w-xl sm:mt-12" onSubmit={onNewsletterSubmit}>
            <div className="flex gap-2.5">
              <input
                aria-label="Email address for MedRush updates"
                className="min-w-0 flex-1 border-[3px] border-[var(--neo-teal)] rounded-[var(--neo-radius)] bg-white px-4 py-3 text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-[var(--neo-teal)] focus:bg-[var(--neo-teal-soft)] transition-all duration-200 sm:px-5 sm:py-4 sm:text-lg"
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="Enter email address"
                type="email"
                value={newsletterEmail}
              />
              <ActionButton
                aria-label="Subscribe to MedRush updates"
                className="!min-h-[50px] sm:!min-h-[60px] !px-5 !rounded-[var(--neo-radius)] text-2xl"
                type="submit"
              >
                →
              </ActionButton>
            </div>
            {newsletterMessage && (
              <p className="animate-fadeIn mt-3 text-xs font-bold text-[#111518] sm:mt-4 sm:text-sm">
                {newsletterMessage}
              </p>
            )}
          </form>

          <p className="mt-10 text-2xl font-medium tracking-normal text-[#111518] sm:mt-14 sm:text-3xl">
            Stay tuned on
          </p>
        </div>

        {/* Footer link columns */}
        <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 sm:gap-10">
          {footerColumns.map((column) => (
            <div key={column.label}>
              <h3 className="text-xs font-semibold uppercase tracking-normal text-[#111518] sm:text-sm">
                {column.label}
              </h3>
              <div className="mt-5 grid gap-4 sm:mt-8 sm:gap-6">
                {column.links.map((link) => (
                  <button
                    className="text-left text-base font-medium leading-tight tracking-normal text-[#111518] transition-colors duration-200 hover:text-medrush-accent sm:text-xl lg:text-2xl"
                    key={`${column.label}-${link.label}`}
                    onClick={() => {
                      if (link.label === "Sync API") void onRefresh();
                      onNavClick(link.target);
                    }}
                    type="button"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-[#111518]/20 px-4 py-4 text-center text-[10px] font-semibold text-slate-500 sm:px-8 sm:py-6 sm:text-xs">
        © {new Date().getFullYear()} MedRush. WhatsApp-first maternal health platform for Indonesian
        district health teams.
      </div>
    </footer>
  );
}
