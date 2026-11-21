"use client";

import Swal from "sweetalert2";

function getThemeColors() {
  if (typeof window === "undefined") return {};

  const styles = window.getComputedStyle(document.documentElement);
  return {
    background: styles.getPropertyValue("--popover").trim() || "#ffffff",
    color: styles.getPropertyValue("--popover-foreground").trim() || "#302827",
    confirmButtonColor: styles.getPropertyValue("--primary").trim() || "#863649",
    cancelButtonColor: styles.getPropertyValue("--muted").trim() || "#f0eae2",
  };
}

export function showSuccessAlert(title: string, text?: string) {
  return Swal.fire({
    ...getThemeColors(),
    icon: "success",
    title,
    text,
    toast: true,
    position: "top-end",
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

export function showWarningAlert(title: string, text: string) {
  return Swal.fire({
    ...getThemeColors(),
    icon: "warning",
    title,
    text,
    toast: true,
    position: "top-end",
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

export function showErrorAlert(text: string, title = "Action failed") {
  return Swal.fire({
    ...getThemeColors(),
    icon: "error",
    title,
    text,
    confirmButtonText: "Got it",
  });
}

export interface ConfirmActionOptions {
  title: string;
  text: string;
  confirmText: string;
  destructive?: boolean;
}

export async function confirmAction({
  title,
  text,
  confirmText,
  destructive = true,
}: ConfirmActionOptions): Promise<boolean> {
  const colors = getThemeColors();
  const result = await Swal.fire({
    ...colors,
    icon: destructive ? "warning" : "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: destructive
      ? window.getComputedStyle(document.documentElement).getPropertyValue("--destructive").trim() ||
        "#863649"
      : colors.confirmButtonColor,
  });

  return result.isConfirmed;
}
