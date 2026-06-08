import {
  AboutActivitySection,
  ActivityAvailabilityProvider,
  ActivityAvailabilityResults,
  ActivityBookingBox,
  ActivityContentSections,
  ActivityDetailGallery,
  ActivityIntro,
  ActivityItinerarySection,
  SiteFooter
} from "../../../components/domain/public";
import { PublicShell } from "../../../components/layout";
import { EmptyState } from "../../../components/ui";
import { getActivityBySlug } from "../../../data/mock-travel";
import { getPublicActivity, mapPublicActivity } from "../../../lib/public-marketplace";

type ActivityPageProps = {
  params: Promise<{
    activitySlug: string;
  }>;
};

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { activitySlug } = await params;
  const activity = await loadActivityData(activitySlug);

  if (!activity) {
    return (
      <PublicShell>
        <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <EmptyState
            description="This activity is not in the Sprint 1 mock dataset yet."
            title="Activity not found"
          />
        </main>
        <SiteFooter />
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <ActivityAvailabilityProvider>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8 lg:pr-[420px]">
            <ActivityIntro activity={activity} />
            <ActivityDetailGallery activity={activity} />
            <p className="font-interface text-[14px] font-normal leading-6 text-travel-dark/85">
              {activity.summary}
            </p>
            <div className="lg:hidden">
              <ActivityBookingBox activity={activity} />
            </div>
            <ActivityAvailabilityResults activity={activity} />
            <AboutActivitySection activity={activity} />
            <ActivityItinerarySection activity={activity} />
            <ActivityContentSections activity={activity} />
          </div>
          <aside className="pointer-events-none fixed bottom-8 right-[max(2rem,calc((100vw-80rem)/2+2rem))] top-[88px] z-30 hidden w-[380px] lg:block">
            <div className="pointer-events-auto h-full overflow-y-auto overscroll-contain pb-4">
              <ActivityBookingBox activity={activity} />
            </div>
          </aside>
        </main>
      </ActivityAvailabilityProvider>
      <SiteFooter />
    </PublicShell>
  );
}

async function loadActivityData(activitySlug: string) {
  try {
    return mapPublicActivity(await getPublicActivity(activitySlug));
  } catch {
    return getActivityBySlug(activitySlug);
  }
}
