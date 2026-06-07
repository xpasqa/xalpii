"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { getAdminUsers, impersonateAdminUser } from "../../../lib/admin-users";
import type { AdminUser } from "../../../lib/admin-users";
import {
  dashboardRouteForRole,
  getAccessToken,
  startImpersonation
} from "../../../lib/auth";
import type { UserRole, UserStatus } from "../../../lib/auth";
import {
  Badge,
  ButtonCTA,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select
} from "../../ui";

const roleOptions: Array<UserRole | ""> = ["", "USER", "PARTNER", "ADMIN", "SUPER_ADMIN"];
const statusOptions: Array<UserStatus | ""> = ["", "ACTIVE", "INACTIVE", "SUSPENDED"];

export function AdminUsersManager() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(null);

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status]);

  async function loadUsers(nextSearch = search) {
    setError(null);
    setIsLoading(true);

    try {
      setUsers(await getAdminUsers({ role, search: nextSearch, status }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load users");
    } finally {
      setIsLoading(false);
    }
  }

  async function loginAs(user: AdminUser) {
    const adminToken = getAccessToken();
    if (!adminToken) {
      setError("Missing admin token");
      return;
    }

    setError(null);
    setImpersonatingUserId(user.id);

    try {
      const response = await impersonateAdminUser(user.id);
      startImpersonation(adminToken, response.accessToken);
      router.replace(dashboardRouteForRole(response.user.role));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to impersonate user");
    } finally {
      setImpersonatingUserId(null);
    }
  }

  const columns = [
    {
      key: "user",
      header: "User",
      cell: (user: AdminUser) => (
        <div>
          <p className="font-semibold text-travel-dark">{user.fullName}</p>
          <p className="mt-1 text-xs text-travel-muted">{user.email}</p>
        </div>
      )
    },
    {
      key: "role",
      header: "Role",
      cell: (user: AdminUser) => <Badge variant="neutral">{user.role}</Badge>
    },
    {
      key: "status",
      header: "Status",
      cell: (user: AdminUser) => (
        <Badge variant={user.status === "ACTIVE" ? "success" : "danger"}>{user.status}</Badge>
      )
    },
    {
      key: "partner",
      header: "Partner",
      cell: (user: AdminUser) => user.partner?.businessName ?? "-"
    },
    {
      key: "created",
      header: "Created",
      cell: (user: AdminUser) => new Date(user.createdAt).toLocaleDateString()
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      cell: (user: AdminUser) => (
        <ButtonCTA
          disabled={user.status !== "ACTIVE" || impersonatingUserId === user.id}
          leftIcon={<LogIn className="size-4" />}
          onClick={() => void loginAs(user)}
          size="sm"
          type="button"
          variant="outline"
        >
          {impersonatingUserId === user.id ? "Opening..." : "Login as"}
        </ButtonCTA>
      )
    }
  ];

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Inspect users and impersonate accounts for support/debugging. Use Return to admin in the sidebar to switch back.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
            <Input
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void loadUsers(search);
              }}
              placeholder="Search name, email, or partner"
              value={search}
            />
            <Select onChange={(event) => setRole(event.target.value as UserRole | "")} value={role}>
              {roleOptions.map((option) => (
                <option key={option || "all"} value={option}>
                  {option || "All roles"}
                </option>
              ))}
            </Select>
            <Select onChange={(event) => setStatus(event.target.value as UserStatus | "")} value={status}>
              {statusOptions.map((option) => (
                <option key={option || "all"} value={option}>
                  {option || "All statuses"}
                </option>
              ))}
            </Select>
            <ButtonCTA onClick={() => void loadUsers(search)} type="button" variant="outline">
              Search
            </ButtonCTA>
          </div>

          {error ? <ErrorState description={error} title="User management error" /> : null}
          {isLoading ? <LoadingState label="Loading users" /> : null}
          {!isLoading && users.length === 0 ? (
            <EmptyState description="No users match the current filters." title="No users found" />
          ) : null}
          {!isLoading && users.length > 0 ? (
            <DataTable columns={columns} getRowKey={(user) => user.id} rows={users} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
