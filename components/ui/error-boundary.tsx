"use client";

import * as React from "react";

interface Props {
  fallback: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  children: React.ReactNode;
  /** Changing this value resets the boundary. */
  resetKey?: unknown;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return typeof this.props.fallback === "function" ? this.props.fallback(this.state.error, this.reset) : this.props.fallback;
    }
    return this.props.children;
  }
}
