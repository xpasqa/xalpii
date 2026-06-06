export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm font-medium text-muted">{label}</span>
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-3 w-3/4 rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}
