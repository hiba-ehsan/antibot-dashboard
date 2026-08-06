"use client";
import React, { Component, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in WebGL:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <div>WebGL failed to initialize.</div>;
    }

    return this.props.children;
  }
}

export function WebGLFallback({ className }: { className?: string }) {
  return (
    <div className={className} style={{ background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
      <p>WebGL Error</p>
    </div>
  );
}
