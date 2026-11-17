import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Catches errors thrown while rendering; without it the page goes white.
// Error boundaries must be class components: function components have no
// way (yet) to catch render errors.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

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
