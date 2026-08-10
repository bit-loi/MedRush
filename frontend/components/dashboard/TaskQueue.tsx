import { ActionButton } from "@/components/ui";
import { badgeClass, cn, rowClass, severityLabel } from "@/lib/helpers";
import type { FieldTask } from "@/types/medrush";
import SectionHeader from "./SectionHeader";

interface TaskQueueProps {
  openTasks: FieldTask[];
  busyAction: string | null;
  onCompleteTask: (taskId: string) => void;
}

export default function TaskQueue({
  openTasks,
  busyAction,
  onCompleteTask,
}: TaskQueueProps) {
  return (
    <section id="tasks">
      <SectionHeader
        action={
          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 sm:text-sm sm:tracking-[0.2em]">
            {openTasks.length} active
          </span>
        }
        kicker="Field work"
        title="Task Queue"
      />
      <div className="grid gap-2 sm:gap-3">
        {openTasks.map((task, index) => (
          <article
            className={cn(
              "animate-fadeInUp grid gap-3 border-[3px] border-[var(--neo-teal)] rounded-[var(--neo-radius)] bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px sm:gap-4 sm:p-5",
              rowClass(task.priority),
            )}
            key={task.id}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <span
                className={cn(
                  "border-[3px] rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] sm:px-2.5 sm:py-1 sm:text-[11px] sm:tracking-[0.12em]",
                  badgeClass(task.priority),
                )}
              >
                {severityLabel(task.priority)}
              </span>
              <span className="text-[10px] font-bold text-slate-400 sm:text-xs">
                Due {task.dueInHours}h
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-5 sm:text-base sm:leading-6">
                {task.action}
              </h3>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-500 sm:mt-1 sm:text-xs">
                {task.assignee} | {task.location}
              </p>
            </div>
            <ActionButton
              className="!min-h-8 !py-1 !px-3 !text-[10px] !rounded-lg sm:!min-h-10 sm:!text-xs"
              disabled={busyAction === task.id}
              onClick={() => onCompleteTask(task.id)}
            >
              {busyAction === task.id ? "Saving…" : "Mark done"}
            </ActionButton>
          </article>
        ))}
      </div>
    </section>
  );
}
