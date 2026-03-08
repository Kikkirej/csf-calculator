interface SharePanelProps {
  shareLink: string
  copyStatus: 'idle' | 'copied' | 'failed'
  onCopyShareLink: () => void
  onExportPdf: () => void
}

export function SharePanel({
  shareLink,
  copyStatus,
  onCopyShareLink,
  onExportPdf,
}: SharePanelProps) {
  return (
    <section className="panel share-panel">
      <div className="panel-header">
        <h2>Share Options</h2>
        <p>
          Generate a link that restores all scores with parameters like{' '}
          <code>Sov1.1=&lt;value&gt;</code>, or export the current view as PDF.
        </p>
      </div>

      <div className="share-actions">
        <button type="button" onClick={onCopyShareLink}>
          Copy Prefilled Link
        </button>
        <button type="button" onClick={onExportPdf}>
          PDF Export
        </button>
      </div>

      <label className="share-link-label" htmlFor="prefilled-link-input">
        Prefilled Link
      </label>
      <input
        id="prefilled-link-input"
        className="share-link-input"
        type="text"
        value={shareLink}
        readOnly
        onFocus={(event) => event.currentTarget.select()}
      />

      {copyStatus === 'copied' ? (
        <p className="share-status share-status-pass">Link copied to clipboard.</p>
      ) : null}
      {copyStatus === 'failed' ? (
        <p className="share-status share-status-fail">
          Could not copy automatically. Copy the link manually.
        </p>
      ) : null}
    </section>
  )
}
