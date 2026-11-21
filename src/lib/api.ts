const SERVER_URL =
  typeof window !== "undefined"
    ? ""
    : (process.env.AUTH_UPSTREAM_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");

export interface ApiErrorBody {
  error?: string;
  issues?: unknown[];
}

function getApiErrorMessage(message: string, status: number): string {
  const normalized = message.trim().toLowerCase();

  if (status === 0) {
    return "We could not connect to MatriMap. Check your connection and try again.";
  }
  if (status === 401) {
    return "Your session may have expired. Please sign in and try again.";
  }
  if (status === 403) {
    if (normalized.includes("plan allows up to")) return message;
    if (normalized.includes("blocked")) {
      return "This account is currently restricted. Please contact support for assistance.";
    }
    return "You do not have permission to complete this action.";
  }
  if (status === 404) {
    if (normalized.includes("profile")) return "We could not find that profile.";
    if (normalized.includes("service")) return "This service is no longer available.";
    if (normalized.includes("payment session")) {
      return "We could not find payment details for this checkout.";
    }
    return "We could not find the requested information.";
  }
  if (status === 409) {
    return "This item has changed. Refresh the page and try again.";
  }
  if (status === 413) {
    return "The selected file is too large. Please choose a smaller file.";
  }
  if (status === 429) {
    return "There have been too many attempts. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return "We could not complete your request right now. Please try again later.";
  }

  if (
    /internal server|cannot\s+(get|post|put|patch|delete)\s|mongodb|mongoose|exception|stack trace|syntaxerror|typeerror|referenceerror|econn|enotfound|etimedout|stripe/i.test(
      message,
    )
  ) {
    return "Please review your information and try again.";
  }
  if (normalized === "invalid booking") {
    return "Please review your booking details and try again.";
  }
  if (normalized === "invalid service data") {
    return "Please review your service details and try again.";
  }
  if (normalized === "invalid profile") {
    return "Please review your profile details and try again.";
  }

  return message || "We could not complete your request. Please try again.";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: ApiErrorBody,
  ) {
    super(getApiErrorMessage(message, status));
    this.name = "ApiError";
  }
}

export function getUserFacingError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.name === "TypeError" && /fetch/i.test(error.message)) {
    return "We could not connect to MatriMap. Check your connection and try again.";
  }

  console.error("[matrimap:client]", error);
  return fallback;
}

export function getAuthErrorMessage(message: unknown, fallback: string): string {
  if (typeof message !== "string") return fallback;
  const normalized = message.toLowerCase();

  if (/invalid credentials|invalid email or password|incorrect (email|password)/i.test(message)) {
    return "The email or password is incorrect. Please check your details and try again.";
  }
  if (/already exists|already registered|email.*taken/i.test(normalized)) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (/too many|rate limit/i.test(normalized)) {
    return "There have been too many attempts. Please wait a moment and try again.";
  }
  if (/invalid email|email.*valid/i.test(normalized)) {
    return "Enter a valid email address.";
  }
  if (/password must be/i.test(normalized)) {
    return "Password must be at least 6 characters and include an uppercase and a lowercase letter.";
  }

  return fallback;
}

/** Small fetch wrapper for the Express API. Cookies are always included. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const url = path.startsWith("http")
    ? path
    : `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      credentials: "include",
      headers: isFormData
        ? init?.headers
        : { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (error) {
    console.error("[matrimap:api] Request failed", error);
    throw new ApiError("Network connection failed.", 0);
  }

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!response.ok) {
    throw new ApiError(body.error ?? `Request failed (${response.status})`, response.status, body);
  }

  return body;
}

export { SERVER_URL };
