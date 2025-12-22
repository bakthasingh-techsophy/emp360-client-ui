// src/components/ui/time-picker.tsx
import React, { useEffect, useRef, useState } from "react";
import { format, parse, isValid } from "date-fns";

type TimePickerProps = {
  /**
   * value should be a 24-hour "HH:mm" string (e.g. "06:00") or null/undefined.
   * If caller provides an ISO string, component will try to extract time part.
   */
  value?: string | null;
  /**
   * onChange receives a 24-hour "HH:mm" string (e.g. "18:30") or null.
   */
  onChange: (value: string | null) => void;
  /**
   * step in minutes (default 15)
   */
  stepMinutes?: number;
  /**
   * placeholder text
   */
  placeholder?: string;
  /**
   * optional id for input
   */
  id?: string;
  /**
   * disable control
   */
  disabled?: boolean;
  /**
   * additional className for the input container
   */
  className?: string;
};

/**
 * Helper - normalize various incoming forms to "HH:mm" 24-hour string or null.
 * Accepts:
 *  - "HH:mm" (24-hour)
 *  - "hh:mm a" (12-hour)
 *  - full ISO string "2025-11-19T06:00:00.000Z" => local time extracted and formatted as "HH:mm"
 */
function normalizeToHHmm(input?: string | null): string | null {
  if (!input) return null;
  input = input.trim();
  // If ISO-like (contains 'T' and digits), try parsing as Date
  if (input.includes("T") || input.endsWith("Z")) {
    const parsed = new Date(input);
    if (isValid(parsed)) {
      const hhmm = format(parsed, "HH:mm");
      return hhmm;
    }
  }

  // Try parse 24-hour "HH:mm"
  const p24 = parse(input, "HH:mm", new Date());
  if (isValid(p24) && /^\s*\d{1,2}:\d{2}\s*$/.test(input)) {
    return format(p24, "HH:mm");
  }

  // Try parse 12-hour "hh:mm a" (e.g. "06:00 AM")
  const p12 = parse(input.toUpperCase(), "hh:mm a", new Date());
  if (isValid(p12)) {
    return format(p12, "HH:mm");
  }

  return null;
}

/** Format a "HH:mm" string into a display like "06:00 AM" */
function hhmmToDisplay(hhmm?: string | null): string {
  if (!hhmm) return "";
  const parsed = parse(hhmm, "HH:mm", new Date());
  if (!isValid(parsed)) return hhmm;
  return format(parsed, "hh:mm a");
}

/** generate time options from 00:00 to 23:59 stepping by minutes */
function generateTimeOptions(stepMinutes = 15): string[] {
  const out: string[] = [];
  for (let m = 0; m < 24 * 60; m += stepMinutes) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    const hhmm = `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    out.push(hhmm);
  }
  return out;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  stepMinutes = 15,
  placeholder = "Select time",
  id,
  disabled = false,
  className = "",
}) => {
  const normalized = normalizeToHHmm(value ?? null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(() => hhmmToDisplay(normalized));
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const options = generateTimeOptions(stepMinutes);

  // keep input display in-sync when external value changes
  useEffect(() => {
    const n = normalizeToHHmm(value ?? null);
    setInputValue(hhmmToDisplay(n));
  }, [value]);

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // keyboard navigation inside dropdown
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      e.preventDefault();
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((idx) => Math.min(idx + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((idx) => Math.max(idx - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < options.length) {
        const opt = options[highlightIndex];
        setInputValue(hhmmToDisplay(opt));
        onChange(opt);
        setOpen(false);
        setHighlightIndex(-1);
      } else {
        // try to parse typed value
        const parsed = normalizeToHHmm(inputValue);
        if (parsed) {
          setInputValue(hhmmToDisplay(parsed));
          onChange(parsed);
        }
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };

  // when user types, update inputValue; don't immediately call onChange until blur or Enter
  const onInputChange = (v: string) => {
    setInputValue(v);
  };

  const onInputBlur = () => {
    // attempt to parse typed input
    const parsed = normalizeToHHmm(inputValue);
    if (parsed) {
      setInputValue(hhmmToDisplay(parsed));
      onChange(parsed);
    } else {
      // revert to last known value if parse fails
      const n = normalizeToHHmm(value ?? null);
      setInputValue(hhmmToDisplay(n));
    }
    setOpen(false);
    setHighlightIndex(-1);
  };

  const handleOptionClick = (opt: string) => {
    setInputValue(hhmmToDisplay(opt));
    onChange(opt);
    setOpen(false);
    setHighlightIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onFocus={() => !disabled && setOpen(true)}
        onClick={() => !disabled && setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={onInputBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground
          ${disabled ? "bg-muted/40 cursor-not-allowed" : "bg-background"}
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id ?? "timepicker"}-listbox`}
        autoComplete="off"
      />

      {/* Dropdown */}
      {open && !disabled && (
        <div
          role="listbox"
          id={`${id ?? "timepicker"}-listbox`}
          className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-md border bg-popover py-1 shadow-lg"
        >
          {options.map((opt, idx) => {
            const display = hhmmToDisplay(opt);
            const isHighlighted = idx === highlightIndex;
            const isSelected = normalizeToHHmm(value ?? null) === opt;
            return (
              <div
                key={opt}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  // use onMouseDown so input blur doesn't fire before click
                  e.preventDefault();
                  handleOptionClick(opt);
                }}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`cursor-pointer px-3 py-2 text-sm ${isHighlighted ? "bg-accent/30" : ""} ${isSelected ? "font-semibold" : ""}`}
              >
                {display}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimePicker;
