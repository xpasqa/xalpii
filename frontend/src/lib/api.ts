import type { ApiError, ApiResponse } from "../types/common";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiFetchError extends Error {
  readonly status: number;
  readonly error?: ApiError;

  constructor(message: string, status: number, error?: ApiError) {
    super(message);
    this.name = "ApiFetchError";
    this.status = status;
    this.error = error;
  }
}

type ApiFetchOptions = RequestInit & {
  path: string;
};

export async function apiFetch<TData>({ path, headers, ...init }: ApiFetchOptions) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });

  const payload = await parseJson<ApiResponse<TData>>(response);

  if (!response.ok) {
    throw new ApiFetchError(
      payload?.error?.message ?? "API request failed",
      response.status,
      payload?.error
    );
  }

  return payload;
}

async function parseJson<TPayload>(response: Response): Promise<TPayload | undefined> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  return JSON.parse(text) as TPayload;
}
