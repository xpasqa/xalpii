import { apiFetch } from "./api";
import { getAccessToken } from "./auth";

type CountRelation = {
  activities: number;
};

export type AdminCity = {
  id: string;
  name: string;
  slug: string;
  country: string;
  description?: string | null;
  imageFileId?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: CountRelation;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: CountRelation;
};

export type AdminCityInput = {
  name: string;
  slug?: string;
  country: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type AdminCategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type AdminListQuery = {
  search?: string;
  isActive?: "true" | "false" | "";
};

export async function getAdminCities(query: AdminListQuery = {}) {
  return requireData(
    await authenticatedFetch<AdminCity[]>({
      path: `/admin/cities${buildQuery(query)}`,
      method: "GET"
    })
  );
}

export async function getAdminCity(id: string) {
  return requireData(
    await authenticatedFetch<AdminCity>({
      path: `/admin/cities/${id}`,
      method: "GET"
    })
  );
}

export async function createAdminCity(input: AdminCityInput) {
  return requireData(
    await authenticatedFetch<AdminCity>({
      path: "/admin/cities",
      method: "POST",
      body: JSON.stringify(input)
    })
  );
}

export async function updateAdminCity(id: string, input: AdminCityInput) {
  return requireData(
    await authenticatedFetch<AdminCity>({
      path: `/admin/cities/${id}`,
      method: "PATCH",
      body: JSON.stringify(input)
    })
  );
}

export async function deactivateAdminCity(id: string) {
  return requireData(
    await authenticatedFetch<AdminCity>({
      path: `/admin/cities/${id}`,
      method: "DELETE"
    })
  );
}

export async function getAdminCategories(query: AdminListQuery = {}) {
  return requireData(
    await authenticatedFetch<AdminCategory[]>({
      path: `/admin/categories${buildQuery(query)}`,
      method: "GET"
    })
  );
}

export async function getAdminCategory(id: string) {
  return requireData(
    await authenticatedFetch<AdminCategory>({
      path: `/admin/categories/${id}`,
      method: "GET"
    })
  );
}

export async function createAdminCategory(input: AdminCategoryInput) {
  return requireData(
    await authenticatedFetch<AdminCategory>({
      path: "/admin/categories",
      method: "POST",
      body: JSON.stringify(input)
    })
  );
}

export async function updateAdminCategory(id: string, input: AdminCategoryInput) {
  return requireData(
    await authenticatedFetch<AdminCategory>({
      path: `/admin/categories/${id}`,
      method: "PATCH",
      body: JSON.stringify(input)
    })
  );
}

export async function deactivateAdminCategory(id: string) {
  return requireData(
    await authenticatedFetch<AdminCategory>({
      path: `/admin/categories/${id}`,
      method: "DELETE"
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

function buildQuery(query: AdminListQuery) {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.isActive) params.set("isActive", query.isActive);
  const value = params.toString();
  return value ? `?${value}` : "";
}

function requireData<TData>(response: { data?: TData } | undefined) {
  if (!response?.data) {
    throw new Error("API response did not include data");
  }

  return response.data;
}
