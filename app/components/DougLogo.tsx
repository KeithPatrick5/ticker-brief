export default function DougLogo() {
  return (
    <a className="doug-logo" href="/" aria-label="Doug's Search home">
      <span className="radar-mark" aria-hidden="true">
        <span className="radar-sweep" />
        <span className="radar-dot d1" />
        <span className="radar-dot d2" />
        <span className="radar-dot d3" />
      </span>
      <span className="doug-wordmark">
        <span className="doug-title">Doug&apos;s Search</span>
        <span className="doug-tagline">Find the signal. Ignore the noise.</span>
      </span>
      <span className="mini-chart" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    </a>
  );
}
