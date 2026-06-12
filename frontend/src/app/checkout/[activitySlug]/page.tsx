import { CheckoutManager } from "../../../components/domain/bookings/BookingManagers";
import { SiteFooter } from "../../../components/domain/public";
import { PublicShell } from "../../../components/layout";

type CheckoutPageProps = {
  params: Promise<{
    activitySlug: string;
  }>;
  searchParams: Promise<{
    availabilityId?: string;
    adults?: string;
    children?: string;
    meetingTime?: string;
    optionId?: string;
    selectedDate?: string;
  }>;
};

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { activitySlug } = await params;
  const selection = await searchParams;

  return (
    <PublicShell>
      <CheckoutManager
        activitySlug={activitySlug}
        initialAdults={selection.adults}
        initialAvailabilityId={selection.availabilityId}
        initialChildren={selection.children}
        initialMeetingTime={selection.meetingTime}
        initialOptionId={selection.optionId}
        initialSelectedDate={selection.selectedDate}
      />
      <SiteFooter />
    </PublicShell>
  );
}
