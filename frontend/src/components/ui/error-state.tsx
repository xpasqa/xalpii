import { Button } from "./button";

type ErrorStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

export function ErrorState({ title, description, actionLabel }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-6">
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-red-700">{description}</p>
      {actionLabel ? (
        <Button className="mt-5" variant="danger">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
