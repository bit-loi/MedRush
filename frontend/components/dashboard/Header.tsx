import { FormEvent } from "react";
import { navItems } from "@/lib/constants";
import MedRushLogo from "./MedRushLogo";

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  busyAction: string | null;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNavClick: (target: string) => void;
  onScrollToSection: (target: string) => void;
}

export default function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
  searchQuery,
  setSearchQuery,
  busyAction,
  onSearchSubmit,
  onNavClick,
  onScrollToSection,
}: HeaderProps) {
  return (
    <header className="bg-[#111518] text-[#aaf4ff]">
      <nav className="mx-auto flex w-full max-w-[1780px] items-center justify-between gap-3 px-4 py-5 sm:px-8 lg:gap-6 lg:px-20 lg:py-8 xl:gap-8">
        {/* Logo */}
        <button
          aria-label="Go to MedRush overview"
          className="flex shrink-0 items-center gap-2 text-left focus-ring sm:gap-3"
          onClick={() => onScrollToSection("top")}
          type="button"
        >
          <MedRushLogo className="h-10 w-[68px] shrink-0 sm:h-14 sm:w-[96px] lg:h-16 lg:w-[112px]" />
          <span className="hidden text-xl font-black uppercase leading-none tracking-wide text-[#b7f5ff] sm:block lg:text-2xl xl:text-3xl">
            MedRush
          </span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 text-sm font-semibold text-[#b7f5ff] lg:flex xl:gap-6 xl:text-base 2xl:gap-8 2xl:text-lg">
          {navItems.map((item) => (
            <button
              className="shrink-0 whitespace-nowrap transition-colors duration-200 hover:text-white focus-ring rounded px-1.5 py-0.5"
              key={item.label}
              onClick={() => onNavClick(item.target)}
              type="button"
            >
              {item.label}
              <span className="ml-0.5 text-[10px] opacity-60">▾</span>
            </button>
          ))}
        </div>

        {/* Desktop search */}
        <form
          className="hidden shrink-0 min-h-12 w-[220px] items-center border border-[#b7f5ff]/60 text-[#b7f5ff] transition-colors duration-200 focus-within:border-[#b7f5ff] lg:flex xl:w-[280px] xl:min-h-14 2xl:w-[340px]"
          onSubmit={onSearchSubmit}
        >
          <input
            aria-label="Search MedRush dashboard"
            className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold outline-none placeholder:text-[#b7f5ff]/60 xl:text-base xl:px-6"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={busyAction === "refresh" ? "Syncing…" : "Search MedRush"}
            value={searchQuery}
          />
          <button
            aria-label="Run search"
            className="grid h-12 w-12 shrink-0 place-items-center transition-colors hover:bg-[#b7f5ff]/10 xl:h-14 xl:w-14"
            type="submit"
          >
            <span className="relative h-4 w-4 rounded-full border-2 border-[#b7f5ff] after:absolute after:-bottom-1 after:-right-1 after:h-2 after:w-0.5 after:rotate-45 after:bg-[#b7f5ff] xl:h-5 xl:w-5" />
          </button>
        </form>

        {/* Mobile menu toggle */}
        <button
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          className="grid min-h-11 place-items-center border border-[#b7f5ff]/60 px-4 text-xs font-black uppercase tracking-[0.18em] text-[#b7f5ff] transition-colors hover:bg-[#b7f5ff]/10 lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          type="button"
        >
          {mobileMenuOpen ? "Close" : "Menu"}
        </button>
      </nav>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="animate-slideDown border-t border-[#b7f5ff]/30 px-4 pb-6 sm:px-8 lg:hidden">
          <div className="grid gap-0.5 py-4">
            {navItems.map((item) => (
              <button
                className="flex min-h-12 items-center justify-between border-b border-[#b7f5ff]/20 text-left text-base font-semibold text-[#b7f5ff] transition-colors hover:text-white"
                key={item.label}
                onClick={() => onNavClick(item.target)}
                type="button"
              >
                {item.label}
                <span className="text-lg opacity-60">→</span>
              </button>
            ))}
          </div>
          <form className="flex min-h-12 border border-[#b7f5ff]/60" onSubmit={onSearchSubmit}>
            <input
              aria-label="Search MedRush dashboard"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold text-[#b7f5ff] outline-none placeholder:text-[#b7f5ff]/50"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search MedRush"
              value={searchQuery}
            />
            <button
              className="border-l border-[#b7f5ff]/60 px-4 text-sm font-black text-[#b7f5ff] transition-colors hover:bg-[#b7f5ff]/10"
              type="submit"
            >
              Go
            </button>
          </form>
        </div>
      )}

      {/* Hero section */}
      <section className="mx-auto grid min-h-[420px] max-w-[1780px] place-items-center px-4 pb-12 pt-6 text-center sm:px-8 sm:min-h-[500px] lg:min-h-[600px] lg:px-20 lg:pb-16 lg:pt-8">
        <div className="animate-fadeInUp">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-[#b7f5ff]/70 sm:text-sm sm:mb-8">
            District Command Center
          </p>
          <h1 className="xdc-display mx-auto max-w-[1320px] text-[clamp(2.8rem,8vw,10rem)] leading-[1.05] tracking-[0.01em] text-[#aaf4ff]">
            Care Depends on
            <br />
            Your Network
          </h1>
          <p className="mx-auto mt-8 max-w-[800px] text-base font-medium leading-7 text-[#b7f5ff]/90 sm:text-lg sm:leading-8 md:mt-12 lg:max-w-[1000px] lg:text-xl">
            WhatsApp-first maternal health adherence and supply-chain coordination for
            Indonesian district health teams.
          </p>
        </div>
      </section>
    </header>
  );
}
