"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  BookOpen,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  FolderKanban,
  GitPullRequest,
  LogOut,
  MapPinned,
  ScanLine,
  Settings,
  Shapes,
  User,
  Users
} from "lucide-react";
import { DashboardShell } from "../../layout/dashboard-shell";
import { ButtonCTA } from "../../ui/ButtonCTA";
import { EmptyState } from "../../ui/empty-state";
import { ErrorState } from "../../ui/error-state";
import { LoadingState } from "../../ui/loading-state";
import {
  clearAccessToken,
  dashboardRouteForRole,
  getAccessToken,
  getMe,
  isImpersonating,
  stopImpersonation
} from "../../../lib/auth";
import type { AuthUser, UserRole } from "../../../lib/auth";
import { routes } from "../../../lib/routes";

type ProtectedDashboardPageProps = {
  allowedRoles: UserRole[];
  children?: ReactNode;
  title: string;
  description: string;
};

export function ProtectedDashboardPage({
  allowedRoles,
  children,
  title,
  description
}: ProtectedDashboardPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getAccessToken();
      if (!token) {
        router.replace(routes.login);
        return;
      }

      try {
        const response = await getMe();
        const currentUser = response.user;

        if (!allowedRoles.includes(currentUser.role)) {
          router.replace(dashboardRouteForRole(currentUser.role));
          return;
        }

        setUser(currentUser);
      } catch (caughtError) {
        clearAccessToken();
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load account");
      } finally {
        setIsChecking(false);
      }
    }

    void loadUser();
  }, [allowedRoles, router]);

  function logout() {
    clearAccessToken();
    router.replace(routes.login);
  }

  function returnToAdmin() {
    if (stopImpersonation()) {
      router.replace(routes.adminDashboard);
    }
  }

  if (isChecking) {
    return (
      <DashboardPageFrame>
        <LoadingState label="Checking dashboard access" />
      </DashboardPageFrame>
    );
  }

  if (error) {
    return (
      <DashboardPageFrame>
        <ErrorState
          title="Session unavailable"
          description={error}
          actionLabel="Log in again"
        />
      </DashboardPageFrame>
    );
  }

  if (!user) {
    return (
      <DashboardPageFrame>
        <EmptyState
          title="Unauthorized"
          description="You need to log in before opening this dashboard."
        />
      </DashboardPageFrame>
    );
  }

  return (
    <DashboardPageFrame>
      <DashboardShell
        eyebrow={roleLabel(user.role)}
        isImpersonating={isImpersonating()}
        navItems={dashboardNavForRole(user.role)}
        onLogout={logout}
        onReturnToAdmin={returnToAdmin}
        title={title}
        userInitial={user.fullName.charAt(0).toUpperCase()}
      >
        {children ?? (
          <div className="grid gap-5">
          <div className="rounded-travel-lg border border-[#2B2B2B]/20 bg-white p-6">
            <p className="font-brand text-2xl font-semibold text-travel-dark">
              Welcome, {user.fullName}
            </p>
            <p className="mt-2 max-w-2xl font-interface text-sm leading-6 text-travel-muted">
              {description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {["Bookings", "Profile", "Settings"].map((item) => (
              <div
                className="rounded-travel-lg border border-[#2B2B2B]/20 bg-white p-5"
                key={item}
              >
                <p className="font-brand text-base font-semibold text-travel-dark">{item}</p>
                <p className="mt-2 font-interface text-sm leading-6 text-travel-muted">
                  Placeholder only. Real dashboard features arrive in later sprints.
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-travel-lg border border-[#2B2B2B]/20 bg-travel-bg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-travel-muted" />
              <p className="font-interface text-sm text-travel-muted">
                Auth foundation only. No dashboard business workflow has been implemented.
              </p>
            </div>
            <ButtonCTA
              leftIcon={<LogOut className="size-4" />}
              onClick={logout}
              size="sm"
              variant="outline"
            >
              Log out
            </ButtonCTA>
          </div>
          </div>
        )}
      </DashboardShell>
    </DashboardPageFrame>
  );
}

function DashboardPageFrame({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-[#F7F8FA]">{children}</main>;
}

function roleLabel(role: UserRole) {
  if (role === "SUPER_ADMIN") {
    return "Super admin";
  }

  return role.charAt(0) + role.slice(1).toLowerCase();
}

function dashboardNavForRole(role: UserRole) {
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return [
      { href: routes.dashboardProfile, icon: User, label: "Account Profile" },
      { href: routes.adminUsers, icon: Users, label: "User Management" },
      { href: routes.adminDestinations, icon: MapPinned, label: "Destinations" },
      { href: routes.adminCategories, icon: Shapes, label: "Categories" },
      { href: routes.adminActivities, icon: ClipboardCheck, label: "Activities" },
      { href: routes.adminActivityRevisions, icon: GitPullRequest, label: "Change requests" },
      { disabled: true, icon: Users, label: "Partners" },
      { href: routes.adminBookings, icon: BookOpen, label: "Bookings" },
      { href: routes.adminPayments, icon: CircleDollarSign, label: "Payments" },
      { disabled: true, icon: Settings, label: "Settings" }
    ];
  }

  if (role === "PARTNER") {
    return [
      { href: routes.dashboardProfile, icon: User, label: "Account Profile" },
      { href: routes.partnerProfile, icon: Building2, label: "Partner Profile" },
      { href: routes.partnerActivities, icon: FolderKanban, label: "Activities" },
      { href: routes.partnerBookings, icon: BookOpen, label: "Bookings" },
      { href: routes.partnerVouchers, icon: ScanLine, label: "Validate voucher" },
      { disabled: true, icon: Banknote, label: "Payouts" }
    ];
  }

  return [
    { href: routes.dashboardProfile, icon: User, label: "Profile" },
    { href: routes.bookings, icon: BookOpen, label: "Bookings" },
    { disabled: true, icon: Settings, label: "Settings" }
  ];
}
