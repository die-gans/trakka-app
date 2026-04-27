import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-bg-base text-text-primary">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-critical">System Fault</div>
          <div className="text-[14px] font-bold">Something went wrong.</div>
          <pre className="max-w-lg text-[11px] text-text-secondary">{this.state.error?.message}</pre>
          <button
            onClick={() => window.location.reload()}
            className="border border-info bg-info-soft px-4 py-2 text-[11px] font-black uppercase tracking-wider text-info"
          >
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
