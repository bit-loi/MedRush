"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  ButtonHTMLAttributes,
  ChangeEvent,
  InputHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import styles from "./NeoControls.module.css";

type FieldChromeProps = {
  error?: ReactNode;
  hint?: ReactNode;
  id?: string;
  label?: ReactNode;
};

type TextInputProps = FieldChromeProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    type?: Exclude<InputHTMLAttributes<HTMLInputElement>["type"], "checkbox" | "radio">;
  };

type TextAreaProps = FieldChromeProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

type SelectFieldProps = FieldChromeProps & {
  disabled?: boolean;
  name?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
};

type ToggleCardProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> & {
  description?: ReactNode;
  label: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
};

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function FieldChrome({
  children,
  error,
  hint,
  id,
  label,
}: FieldChromeProps & { children: ReactNode }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      {children}
      {hint ? (
        <span className={styles.hint} id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className={styles.error} id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function TextInput({
  className,
  error,
  hint,
  id,
  label,
  type = "text",
  ...props
}: TextInputProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const describedBy = [
    props["aria-describedby"],
    hint ? `${inputId}-hint` : undefined,
    error ? `${inputId}-error` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldChrome error={error} hint={hint} id={inputId} label={label}>
      <input
        {...props}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cx(styles.input, className)}
        id={inputId}
        type={type}
      />
    </FieldChrome>
  );
}

export function TextArea({
  className,
  error,
  hint,
  id,
  label,
  ...props
}: TextAreaProps) {
  const fallbackId = useId();
  const textareaId = id ?? fallbackId;
  const describedBy = [
    props["aria-describedby"],
    hint ? `${textareaId}-hint` : undefined,
    error ? `${textareaId}-error` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldChrome error={error} hint={hint} id={textareaId} label={label}>
      <textarea
        {...props}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cx(styles.textarea, className)}
        id={textareaId}
      />
    </FieldChrome>
  );
}

export function SelectField({
  disabled,
  error,
  hint,
  id,
  label,
  name,
  onValueChange,
  options,
  placeholder = "Select an option",
  value,
}: SelectFieldProps) {
  const fallbackId = useId();
  const selectId = id ?? fallbackId;
  const listboxId = `${selectId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const enabledOptions = useMemo(
    () => options.filter((option) => !option.disabled),
    [options],
  );
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsidePointer(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
    }

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function selectValue(nextValue: string) {
    onValueChange(nextValue);
    setOpen(false);
  }

  function moveValue(direction: 1 | -1) {
    if (enabledOptions.length === 0) {
      return;
    }

    const currentIndex = enabledOptions.findIndex((option) => option.value === value);
    const fallbackIndex = direction === 1 ? -1 : 0;
    const nextIndex =
      (currentIndex === -1 ? fallbackIndex : currentIndex + direction + enabledOptions.length) %
      enabledOptions.length;

    onValueChange(enabledOptions[nextIndex].value);
  }

  function handleButtonKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      moveValue(1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      moveValue(-1);
    }
  }

  const describedBy = [
    hint ? `${selectId}-hint` : undefined,
    error ? `${selectId}-error` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldChrome error={error} hint={hint} id={selectId} label={label}>
      <div className={styles.selectRoot} ref={rootRef}>
        {name ? <input name={name} readOnly type="hidden" value={value ?? ""} /> : null}
        <button
          aria-controls={listboxId}
          aria-describedby={describedBy || undefined}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={styles.selectButton}
          data-expanded={open ? "true" : undefined}
          data-focused={open ? "true" : undefined}
          data-invalid={error ? "true" : undefined}
          disabled={disabled}
          id={selectId}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleButtonKeyDown}
          type="button"
        >
          <span
            className={cx(
              styles.selectValue,
              !selectedOption && styles.selectPlaceholder,
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>
          <span aria-hidden="true" className={styles.chevron} />
        </button>

        {open ? (
          <div className={styles.selectMenu} id={listboxId} role="listbox">
            {options.map((option) => (
              <button
                aria-selected={option.value === value}
                className={styles.selectOption}
                data-selected={option.value === value ? "true" : undefined}
                disabled={option.disabled}
                key={option.value}
                onClick={() => selectValue(option.value)}
                role="option"
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </FieldChrome>
  );
}

export function ToggleCard({
  checked,
  className,
  defaultChecked,
  description,
  disabled,
  id,
  label,
  onCheckedChange,
  ...props
}: ToggleCardProps) {
  const fallbackId = useId();
  const checkboxId = id ?? fallbackId;
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const isChecked = isControlled ? checked : internalChecked;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextChecked = event.target.checked;

    if (!isControlled) {
      setInternalChecked(nextChecked);
    }

    onCheckedChange?.(nextChecked);
  }

  return (
    <label
      className={cx(
        styles.toggleCard,
        isChecked && styles.toggleCardChecked,
        disabled && styles.isDisabled,
        className,
      )}
      htmlFor={checkboxId}
    >
      <input
        {...props}
        checked={checked}
        className={styles.toggleInput}
        defaultChecked={defaultChecked}
        disabled={disabled}
        id={checkboxId}
        onChange={handleChange}
        type="checkbox"
      />
      <span className={styles.toggleCopy}>
        <span className={styles.toggleTitle}>{label}</span>
        {description ? (
          <span className={styles.toggleDescription}>{description}</span>
        ) : null}
      </span>
    </label>
  );
}

export function ActionButton({
  children,
  className,
  disabled,
  fullWidth,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        styles.button,
        fullWidth && styles.buttonFull,
        disabled && styles.isDisabled,
        className,
      )}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}
