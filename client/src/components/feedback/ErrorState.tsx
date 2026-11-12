type ErrorStateProps = {
  what?: string;
  onRetry?: () => void;
};

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
