"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  activateRoute,
  completeTask,
  fallbackDashboard,
  fetchDashboard,
  restockInventory,
  submitIntake,
  updateAlertStatus,
} from "@/lib/api";
import {
  createOfflineIntake,
  mergeIntake,
} from "@/lib/intake";
import {
  pipelineStages,
  quickMessages,
} from "@/lib/constants";
import type {
  PipelineStage,
  QueueFilter,
  InventoryFilter,
} from "@/lib/constants";
import {
  Header,
  NetworkIntro,
  SummaryMetrics,
  PipelineStages,
  RiskQueue,
  InventoryWatch,
  SignalSimulator,
  TaskQueue,
  DeliveryRoutes,
  AuditTrail,
  Footer,
} from "@/components/dashboard";
import { ActionButton } from "@/components/ui";
import type {
  AlertStatus,
  DashboardData,
  IntakePayload,
  IntakeResult,
  RiskAlert,
} from "@/types/medrush";

export default function Home() {
  const [data, setData] = useState<DashboardData>(fallbackDashboard);
  const [apiStatus, setApiStatus] = useState<"checking" | "connected" | "offline">(
    "checking",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<PipelineStage>("reason");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>("all");
  const [focusedMetric, setFocusedMetric] = useState<string>("All signals");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [motherName, setMotherName] = useState("Ayu S.");
  const [clinic, setClinic] = useState("Puskesmas Cibiru");
  const [message, setMessage] = useState(quickMessages[0]);
  const [missedDose, setMissedDose] = useState(true);
  const [needsStock, setNeedsStock] = useState(false);
  const [intakeResult, setIntakeResult] = useState<IntakeResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  /* ── Data fetch ── */

  useEffect(() => {
    setIsLoading(true);
    fetchDashboard()
      .then((dashboard) => {
        setData(dashboard);
        setApiStatus(dashboard === fallbackDashboard ? "offline" : "connected");
      })
      .catch(() => {
        setApiStatus("offline");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  /* ── Scroll-to-top visibility ── */

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 600);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Derived state ── */

  const openTasks = useMemo(
    () => data.tasks.filter((task) => task.status === "open"),
    [data.tasks],
  );
  const visibleRiskQueue = useMemo(
    () =>
      data.riskQueue.filter(
        (alert) =>
          alert.status !== "resolved" &&
          (queueFilter === "all" || alert.riskLevel === queueFilter),
      ),
    [data.riskQueue, queueFilter],
  );
  const visibleInventory = useMemo(
    () =>
      data.inventory.filter(
        (item) =>
          inventoryFilter === "all" ||
          item.status === "critical" ||
          item.status === "warning",
      ),
    [data.inventory, inventoryFilter],
  );
  const criticalStock = useMemo(
    () => data.inventory.filter((item) => item.status === "critical").length,
    [data.inventory],
  );
  const activeStageCopy = pipelineStages.find((stage) => stage.id === activeStage);

  /* ── Handlers ── */

  function scrollToSection(target: string) {
    setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    setMobileMenuOpen(false);
  }

  function handleNavClick(target: string) {
    if (target === "network") {
      setFocusedMetric("All signals");
      setQueueFilter("all");
      setInventoryFilter("all");
      setActiveStage("reach");
    }
    if (target === "signals") {
      setFocusedMetric("Urgent follow-ups");
      setQueueFilter("urgent");
      setActiveStage("reason");
    }
    if (target === "simulator") {
      setActiveStage("reach");
    }
    if (target === "resources") {
      setActiveStage("route");
    }
    scrollToSection(target);
  }

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      await handleRefresh();
      return;
    }

    if (["stock", "inventory", "supply", "refill", "stok"].some((k) => query.includes(k))) {
      setInventoryFilter("attention");
      setQueueFilter("all");
      setFocusedMetric("Stock warnings");
      setActiveStage("route");
      scrollToSection("inventory");
      return;
    }

    if (["route", "delivery", "rute"].some((k) => query.includes(k))) {
      setFocusedMetric("Delivery routes");
      setActiveStage("route");
      scrollToSection("routes");
      return;
    }

    if (["urgent", "risk", "mother", "alert", "ibu"].some((k) => query.includes(k))) {
      setQueueFilter("urgent");
      setInventoryFilter("all");
      setFocusedMetric("Urgent follow-ups");
      setActiveStage("reason");
      scrollToSection("signals");
      return;
    }

    if (["whatsapp", "message", "simulator", "intake"].some((k) => query.includes(k))) {
      setActiveStage("reach");
      scrollToSection("simulator");
      return;
    }

    setQueueFilter("all");
    setInventoryFilter("all");
    setFocusedMetric("All signals");
    setActiveStage("reason");
    scrollToSection("signals");
  }

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = newsletterEmail.trim();
    if (!email.includes("@") || !email.includes(".")) {
      setNewsletterMessage("Enter a valid email address.");
      return;
    }
    setNewsletterMessage("Signed up for MedRush pilot updates.");
    setNewsletterEmail("");
  }

  async function handleRefresh() {
    setBusyAction("refresh");
    try {
      const dashboard = await fetchDashboard();
      setData(dashboard);
      setApiStatus(dashboard === fallbackDashboard ? "offline" : "connected");
    } finally {
      setBusyAction(null);
    }
  }

  function handleSummaryFocus(label: string) {
    setFocusedMetric(label);
    if (label === "Urgent follow-ups") {
      setQueueFilter("urgent");
      setInventoryFilter("all");
      setActiveStage("reason");
      return;
    }
    if (label === "Stock warnings") {
      setQueueFilter("all");
      setInventoryFilter("attention");
      setActiveStage("route");
      return;
    }
    if (label === "Delivery routes") {
      setQueueFilter("all");
      setInventoryFilter("all");
      setActiveStage("route");
      return;
    }
    setQueueFilter("all");
    setInventoryFilter("all");
    setActiveStage("reach");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const decoratedMessage = [
      message.trim(),
      missedDose ? "Missed dose reported." : "",
      needsStock ? "Stock refill needed." : "",
    ]
      .filter(Boolean)
      .join(" ");
    const payload: IntakePayload = { clinic, message: decoratedMessage, motherName };

    try {
      const result = await submitIntake(payload);
      setData((current) => mergeIntake(current, result));
      setIntakeResult(result);
      setApiStatus("connected");
    } catch {
      const result = createOfflineIntake(payload);
      setData((current) => mergeIntake(current, result));
      setIntakeResult(result);
      setApiStatus("offline");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompleteTask(taskId: string) {
    setBusyAction(taskId);
    try {
      const dashboard = await completeTask(taskId);
      setData(dashboard);
      setApiStatus("connected");
    } catch {
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === taskId ? { ...task, status: "done" } : task,
        ),
      }));
      setApiStatus("offline");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleAlertStatus(alert: RiskAlert, status: AlertStatus) {
    setBusyAction(`${alert.id}-${status}`);
    try {
      const dashboard = await updateAlertStatus(alert.id, status);
      setData(dashboard);
      setApiStatus("connected");
    } catch {
      setData((current) => ({
        ...current,
        auditTrail: [
          {
            actor: "District operator",
            event: `Set alert for ${alert.motherName} to ${status.replace("_", " ")}.`,
            id: `local-${alert.id}-${status}-${Date.now()}`,
            time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          },
          ...current.auditTrail,
        ],
        riskQueue: current.riskQueue.map((item) =>
          item.id === alert.id ? { ...item, status } : item,
        ),
      }));
      setApiStatus("offline");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRestock(itemId: string) {
    setBusyAction(`restock-${itemId}`);
    try {
      const dashboard = await restockInventory(itemId, 120);
      setData(dashboard);
      setApiStatus("connected");
    } catch {
      setData((current) => ({
        ...current,
        auditTrail: [
          {
            actor: "Supply team",
            event: "Logged local restock of 120 units while API was unavailable.",
            id: `local-restock-${itemId}-${Date.now()}`,
            time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          },
          ...current.auditTrail,
        ],
        inventory: current.inventory.map((item) => {
          if (item.id !== itemId) return item;
          const stock = item.stock + 120;
          return {
            ...item,
            daysRemaining: Math.max(item.daysRemaining, 14),
            lastUpdated: `Today ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
            status: stock >= item.reorderPoint ? "stable" : "warning",
            stock,
          };
        }),
      }));
      setApiStatus("offline");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleActivateRoute(routeId: string) {
    setBusyAction(`route-${routeId}`);
    setActiveStage("route");
    try {
      const dashboard = await activateRoute(routeId);
      setData(dashboard);
      setApiStatus("connected");
    } catch {
      setData((current) => ({
        ...current,
        auditTrail: [
          {
            actor: "Supply dispatcher",
            event: "Activated delivery route locally while API was unavailable.",
            id: `local-route-${routeId}-${Date.now()}`,
            time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          },
          ...current.auditTrail,
        ],
        routes: current.routes.map((route) => ({
          ...route,
          status:
            route.id === routeId ? "active" : route.status === "active" ? "queued" : route.status,
        })),
      }));
      setApiStatus("offline");
    } finally {
      setBusyAction(null);
    }
  }

  /* ═══════════════  Render  ═══════════════ */

  return (
    <main className="min-h-screen bg-[#f4f8f9] text-xdc-ink" id="top">
      {/* ── Header ── */}
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        busyAction={busyAction}
        onSearchSubmit={handleSearchSubmit}
        onNavClick={handleNavClick}
        onScrollToSection={scrollToSection}
      />

      {/* ── Network intro ── */}
      <NetworkIntro
        apiStatus={apiStatus}
        busyAction={busyAction}
        onRefresh={handleRefresh}
      />

      {/* ── Dashboard content ── */}
      <section className="bg-[#f4f8f9]" aria-live="polite">
        <div className="mx-auto grid max-w-[1780px] gap-10 px-4 py-14 sm:px-8 lg:gap-14 lg:px-20 lg:py-20">

          {/* CTA row */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <ActionButton
              className="!min-h-20 !text-xl sm:!min-h-24 sm:!text-2xl lg:!text-3xl lg:!min-h-28"
              onClick={() => handleSummaryFocus("Urgent follow-ups")}
            >
              → Explore the Care Network
            </ActionButton>
            <ActionButton
              className="!min-h-20 !text-xl sm:!min-h-24 sm:!text-2xl lg:!text-3xl lg:!min-h-28"
              onClick={() => setActiveStage("reason")}
            >
              ! What needs action?
            </ActionButton>
          </div>

          {/* Summary metrics */}
          <SummaryMetrics
            focusedMetric={focusedMetric}
            isLoading={isLoading}
            onSummaryFocus={handleSummaryFocus}
            summary={data.summary}
          />

          {/* Pipeline stages */}
          <PipelineStages
            activeStage={activeStage}
            setActiveStage={setActiveStage}
          />

          {/* Current focus bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#111518] pt-5 sm:pt-6">
            <p className="text-base sm:text-xl">
              <span className="font-semibold">Current focus:</span> {focusedMetric}
            </p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 sm:text-sm sm:tracking-[0.25em]">
              {activeStageCopy?.label}: {activeStageCopy?.description}
            </p>
          </div>

          {/* Two-column dashboard layout */}
          <section className="grid gap-10 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] xl:gap-12">

            {/* Left column */}
            <div className="grid content-start gap-10 lg:gap-12">
              {activeStage === "reason" && (
                <RiskQueue
                  busyAction={busyAction}
                  onAlertStatus={handleAlertStatus}
                  queueFilter={queueFilter}
                  setActiveStage={setActiveStage}
                  setFocusedMetric={setFocusedMetric}
                  setQueueFilter={setQueueFilter}
                  visibleRiskQueue={visibleRiskQueue}
                />
              )}

              {activeStage === "route" && (
                <InventoryWatch
                  busyAction={busyAction}
                  criticalStock={criticalStock}
                  inventoryFilter={inventoryFilter}
                  onRestock={handleRestock}
                  setActiveStage={setActiveStage}
                  setFocusedMetric={setFocusedMetric}
                  setInventoryFilter={setInventoryFilter}
                  visibleInventory={visibleInventory}
                />
              )}

              {activeStage === "reach" && (
                <SignalSimulator
                  clinic={clinic}
                  intakeResult={intakeResult}
                  isSubmitting={isSubmitting}
                  message={message}
                  missedDose={missedDose}
                  motherName={motherName}
                  needsStock={needsStock}
                  onSubmit={handleSubmit}
                  setClinic={setClinic}
                  setMessage={setMessage}
                  setMissedDose={setMissedDose}
                  setMotherName={setMotherName}
                  setNeedsStock={setNeedsStock}
                />
              )}
            </div>

            {/* Right column (sidebar) */}
            <aside className="grid content-start gap-10 lg:gap-12">
              {activeStage === "reason" && (
                <TaskQueue
                  busyAction={busyAction}
                  onCompleteTask={handleCompleteTask}
                  openTasks={openTasks}
                />
              )}

              {activeStage === "route" && (
                <DeliveryRoutes
                  busyAction={busyAction}
                  onActivateRoute={handleActivateRoute}
                  routes={data.routes}
                />
              )}

              <AuditTrail auditTrail={data.auditTrail} />
            </aside>

          </section>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer
        newsletterEmail={newsletterEmail}
        newsletterMessage={newsletterMessage}
        onNavClick={handleNavClick}
        onNewsletterSubmit={handleNewsletterSubmit}
        onRefresh={handleRefresh}
        setNewsletterEmail={setNewsletterEmail}
      />

      {/* ── Scroll to top button ── */}
      {showScrollTop && (
        <ActionButton
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 !h-10 !w-10 !min-h-0 !p-0 text-lg font-bold sm:bottom-8 sm:right-8 sm:!h-12 sm:!w-12"
          onClick={() => scrollToSection("top")}
        >
          ↑
        </ActionButton>
      )}
    </main>
  );
}
