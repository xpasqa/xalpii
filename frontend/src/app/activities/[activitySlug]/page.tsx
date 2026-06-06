import {
  AboutActivitySection,
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

type ActivityPageProps = {
  params: Promise<{
    activitySlug: string;
  }>;
};

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { activitySlug } = await params;
  const activity = getActivityBySlug(activitySlug);

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
      <main className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="space-y-8">
          <ActivityIntro activity={activity} />
          <ActivityDetailGallery activity={activity} />
          <p className="font-interface text-lg font-medium leading-8 text-travel-dark">
            {activity.summary}
          </p>
          <div className="lg:hidden">
            <ActivityBookingBox activity={activity} />
          </div>
          <AboutActivitySection activity={activity} />
          <ActivityItinerarySection activity={activity} />
          <ActivityContentSections activity={activity} />
        </div>
        <aside className="hidden lg:block">
          <div className="fixed right-8 top-[132px] z-30 w-[380px] max-h-[calc(100vh-148px)] overflow-y-auto 2xl:right-[calc((100vw-80rem)/2+2rem)]">
            <ActivityBookingBox activity={activity} />
          </div>
        </aside>
      </main>
      <SiteFooter />
    </PublicShell>
  );
}
