export default function PanelLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-40 rounded-md bg-line" />
      <div className="h-4 w-64 rounded-md bg-line" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg border border-line bg-card" />
        ))}
      </div>
    </div>
  );
}
