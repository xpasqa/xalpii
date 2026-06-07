import { apiFetch } from "./api";
import { getAccessToken, type PartnerStatus } from "./auth";

export type PartnerProfile = {
  id: string;
  userId: string;
  businessName: string;
  legalName?: string | null;
  status: PartnerStatus;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
};

export type PartnerProfileInput = {
  businessName?: string;
  legalName?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  description?: string;
};

export async function getPartnerProfile() {
  return requireData(
    await authenticatedFetch<PartnerProfile>({
      method: "GET",
      path: "/partner/profile"
    })
  );
}

export async function updatePartnerProfile(input: PartnerProfileInput) {
  return requireData(
    await authenticatedFetch<PartnerProfile>({
      body: JSON.stringify(input),
      method: "PATCH",
      path: "/partner/profile"
    })
  );
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
