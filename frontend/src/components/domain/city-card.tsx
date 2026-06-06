type CityCardProps = {
  name: string;
  country: string;
  imageUrl: string;
  activityCount: number;
};

export function CityCard({ name, country, imageUrl, activityCount }: CityCardProps) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          src={imageUrl}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-ink">{name}</h3>
        <p className="mt-1 text-sm text-muted">{country}</p>
        <p className="mt-4 text-sm font-semibold text-primary">{activityCount} activities</p>
      </div>
    </article>
  );
}
