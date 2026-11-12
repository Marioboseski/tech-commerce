type ErrorStateProps = {
  // What could not be loaded, e.g. "your orders".
  what?: string;
  // Usually the query's refetch(): asks the server again.
  onRetry?: () => void;
};

// Shown instead of a page part when its data could not be loaded,
// so the user does not wait for an endless "Loading…".
export default function ErrorState({
  what = 'this page',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="favorites-empty-state" role="alert">
      <h2>Something went wrong</h2>
      <p>We could not load {what}. Please check your connection.</p>
      {onRetry && (
        <button className="primary-button" type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
