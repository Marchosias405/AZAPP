export function CatalogStatus({ unavailable }: { unavailable: boolean }) {
  if (!unavailable) return null;

  return (
    <p role="status" className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      Published questions are temporarily unavailable. You can still study with
      the built-in questions. Reload to try again.
    </p>
  );
}
