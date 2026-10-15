import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface State { failed: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error('NexSolarix interface error', error.message);
  }

  render() {
    if (this.state.failed) {
      return <main className="page-shell error-fallback"><span className="section-kicker"><span>DISPLAY INTERRUPTED</span></span><h1>Let's find a<br /><em>clearer path.</em></h1><p>This view could not be displayed. Your locally curated astronomy catalog is unchanged.</p><Link to="/explore" className="button button-primary" onClick={() => this.setState({ failed: false })}>Return to the atlas</Link></main>;
    }
    return this.props.children;
  }
}
