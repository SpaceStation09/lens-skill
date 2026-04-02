export function LoadingState({ label }: { label: string }) {
  return <p className="state-block">Loading {label}...</p>;
}

export function EmptyState({ label }: { label: string }) {
  return <p className="state-block">{label}</p>;
}

export function ErrorState({ message }: { message: string }) {
  return <p className="state-block state-block--error">{message}</p>;
}
