const SERVER_URL =
  typeof window !== "undefined"
    ? ""
    : (process.env.AUTH_UPSTREAM_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");

export interface ApiErrorBody {
  error?: string;
  issues?: unknown[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: ApiErrorBody,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Small fetch wrapper for the Express API. Cookies are always included. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const url = path.startsWith("http")
    ? path
    : `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: isFormData
      ? init?.headers
      : { "Content-Type": "application/json", ...init?.headers },
  });

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!response.ok) {
    throw new ApiError(body.error ?? `Request failed (${response.status})`, response.status, body);
  }

  return body;
}

export { SERVER_URL };
