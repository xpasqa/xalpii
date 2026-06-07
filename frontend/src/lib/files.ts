import { apiFetch } from "./api";
import { getAccessToken } from "./auth";

export type FileVisibility = "PUBLIC" | "PRIVATE";
export type FileUploadPurpose =
  | "CITY_IMAGE"
  | "CATEGORY_IMAGE"
  | "ACTIVITY_IMAGE"
  | "PARTNER_DOCUMENT"
  | "PROFILE_IMAGE";

export type FileAsset = {
  id: string;
  bucket: string;
  objectKey: string;
  url?: string | null;
  visibility: FileVisibility;
  mimeType?: string | null;
  sizeBytes?: number | null;
  originalName?: string | null;
  uploadedById?: string | null;
  createdAt: string;
};

export type PresignedUploadInput = {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  visibility: FileVisibility;
  purpose?: FileUploadPurpose;
};

export type PresignedUploadResponse = {
  fileAsset: FileAsset;
  uploadUrl: string;
  publicUrl?: string | null;
};

export async function requestPresignedUpload(input: PresignedUploadInput) {
  return requireData(
    await authenticatedFetch<PresignedUploadResponse>({
      body: JSON.stringify(input),
      method: "POST",
      path: "/files/presign"
    })
  );
}

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    body: file,
    headers: {
      "Content-Type": file.type
    },
    method: "PUT"
  });

  if (!response.ok) {
    throw new Error("Unable to upload file to storage");
  }
}

async function authenticatedFetch<TData>(input: {
  path: string;
  method?: string;
  body?: BodyInit;
}) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Missing access token");
  }

  return apiFetch<TData>({
    ...input,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

function requireData<TData>(response: { data?: TData } | undefined) {
  if (!response?.data) {
    throw new Error("API response did not include data");
  }

  return response.data;
}
