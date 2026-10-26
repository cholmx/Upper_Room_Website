import React from 'react';
import { captureError } from '../lib/monitoring';

export default class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    captureError(error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] px-6 text-center">
        <div className="max-w-md">
          <h1 className="text-4xl mb-4">Something went wrong</h1>
          <p className="opacity-70 mb-8">The page hit an unexpected problem. Reloading usually fixes it.</p>
          <button className="btn btn-solid" onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }
}
