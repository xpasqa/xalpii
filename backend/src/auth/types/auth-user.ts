import type { Partner, UserRole, UserStatus } from "@prisma/client";

export type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type SafePartner = Pick<
  Partner,
  | "id"
  | "userId"
  | "businessName"
  | "legalName"
  | "status"
  | "phone"
  | "country"
  | "city"
  | "address"
  | "description"
  | "createdAt"
  | "updatedAt"
>;

export type JwtUser = {
  sub: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequestUser = SafeUser & {
  partner?: SafePartner | null;
};
