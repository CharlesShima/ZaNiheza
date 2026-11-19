import { Component } from 'react';

// Safety net: if a page ever crashes, visitors see a friendly message instead of a white screen.
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) {
    // A new deploy replaced old files: reload once to get the fresh ones
    const stale = /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(String(error?.message));
    if (stale && !sessionStorage.getItem('zn-reloaded')) {
      sessionStorage.setItem('zn-reloaded', '1');
      window.location.reload();
    }
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="error-screen">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Something went wrong loading this page</h1>
          <p className="muted">Please reload. If it keeps happening, email us at muraho@zaniheza.com.</p>
          <button className="btn btn--navy" onClick={() => window.location.reload()}>Reload the page</button>
        </div>
      </div>
    );
  }
}
