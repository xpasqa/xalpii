import { formatBaseUsd } from "../../lib/money";
import { Button } from "../ui";
import { ActivityStatusBadge, type ActivityStatus } from "./status-badges";

type ActivityCardProps = {
  title: string;
  city: string;
  imageUrl: string;
  duration: string;
  rating: number;
  priceMinor: number;
  currency: string;
  status?: ActivityStatus;
};

export function ActivityCard({
  title,
  city,
  imageUrl,
  duration,
  rating,
  priceMinor,
  status = "PUBLISHED"
}: ActivityCardProps) {
  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img alt="" className="h-full w-full object-cover" src={imageUrl} />
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-muted">{city}</span>
          <ActivityStatusBadge status={status} />
        </div>
        <h3 className="break-words text-lg font-semibold leading-6 text-ink">{title}</h3>
        <div className="mt-3 flex items-center justify-between text-sm text-muted">
          <span>{duration}</span>
          <span>{rating.toFixed(1)} rating</span>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            From{" "}
            <span className="text-base font-bold text-ink">
              {formatBaseUsd(priceMinor)}
            </span>
          </p>
          <Button>View</Button>
        </div>
      </div>
    </article>
  );
}
