import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Catches errors THROWN WHILE DRAWING components (a bug such as reading
// a property of undefined). Without it React removes the whole page and the
// user sees a white screen.
// Error boundaries must be class components: function components have no
// way (yet) to catch render errors.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  // React calls this when a child throws: switch to the fallback screen.
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  // For us developers: the error and which component threw it.
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container section">
          <div className="favorites-empty-state" role="alert">
            <h2>Something went wrong</h2>
            <p>An unexpected error happened. Please reload the page.</p>
            <button
              className="primary-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
