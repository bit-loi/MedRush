import { FormEvent } from "react";
import {
  ActionButton,
  SelectField,
  TextArea,
  TextInput,
  ToggleCard,
} from "@/components/ui";
import { clinicOptions, quickMessages } from "@/lib/constants";
import { badgeClass, cn, severityLabel } from "@/lib/helpers";
import type { IntakeResult } from "@/types/medrush";
import SectionHeader from "./SectionHeader";

interface SignalSimulatorProps {
  motherName: string;
  setMotherName: (name: string) => void;
  clinic: string;
  setClinic: (clinic: string) => void;
  message: string;
  setMessage: (message: string) => void;
  missedDose: boolean;
  setMissedDose: (checked: boolean) => void;
  needsStock: boolean;
  setNeedsStock: (checked: boolean) => void;
  isSubmitting: boolean;
  intakeResult: IntakeResult | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function SignalSimulator({
  motherName,
  setMotherName,
  clinic,
  setClinic,
  message,
  setMessage,
  missedDose,
  setMissedDose,
  needsStock,
  setNeedsStock,
  isSubmitting,
  intakeResult,
  onSubmit,
}: SignalSimulatorProps) {
  return (
    <section id="simulator">
      <SectionHeader kicker="WhatsApp intake" title="Signal Simulator" />
      <form
        className="grid gap-3 border border-slate-300 bg-white p-4 sm:gap-4 sm:p-5"
        onSubmit={onSubmit}
      >
        <TextInput
          label="Mother name"
          onChange={(event) => setMotherName(event.target.value)}
          placeholder="Name from WhatsApp profile"
          required
          value={motherName}
        />

        <SelectField
          label="Clinic"
          onValueChange={(val) => setClinic(val)}
          options={clinicOptions}
          placeholder="Select clinic"
          value={clinic}
        />

        <TextArea
          label="Incoming message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Paste incoming WhatsApp text or voice transcript"
          required
          value={message}
        />

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {quickMessages.map((sample, index) => (
            <ActionButton
              key={sample}
              onClick={() => setMessage(sample)}
              type="button"
              className="!min-h-9 !text-[10px] !px-1 sm:!min-h-10 sm:!text-xs sm:!px-2"
            >
              Sample {index + 1}
            </ActionButton>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <ToggleCard
            checked={missedDose}
            label="Missed dose"
            description="Mother reports missed doses"
            onCheckedChange={(checked) => setMissedDose(checked)}
          />
          <ToggleCard
            checked={needsStock}
            label="Stock needed"
            description="Clinic needs resupply"
            onCheckedChange={(checked) => setNeedsStock(checked)}
          />
        </div>

        <ActionButton disabled={isSubmitting} fullWidth type="submit">
          {isSubmitting ? "Processing…" : "Extract risk signal"}
        </ActionButton>
      </form>

      {intakeResult && (
        <div className="animate-fadeInUp mt-3 border border-[#111518] bg-cyan-50 p-4 sm:mt-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <strong className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.16em]">
              {intakeResult.recommendedAction}
            </strong>
            <span
              className={cn(
                "border px-2 py-0.5 text-[10px] font-black sm:px-3 sm:py-1 sm:text-xs",
                badgeClass(intakeResult.alert.riskLevel),
              )}
            >
              {severityLabel(intakeResult.alert.riskLevel)}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600 sm:mt-3 sm:text-sm sm:leading-6">
            {intakeResult.alert.explanation}
          </p>
          <p className="mt-2 text-[10px] font-semibold text-slate-500 sm:mt-3 sm:text-xs">
            {intakeResult.safetyNote}
          </p>
        </div>
      )}
    </section>
  );
}
