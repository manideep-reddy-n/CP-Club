import { twMerge } from "tailwind-merge";

function toClassValue(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return `${value}`;
  if (Array.isArray(value)) {
    return value.map(toClassValue).filter(Boolean).join(" ");
  }
  if (typeof value === "object") {
    return Object.keys(value)
      .filter((key) => value[key])
      .join(" ");
  }
  return "";
}

function clsx(...inputs) {
  return inputs.map(toClassValue).filter(Boolean).join(" ");
}

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
