export default function PortalLoading() {
  return (
    <div className="flex justify-center py-24">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
