/* SPDX-License-Identifier: GPL-3.0-or-later */

interface SharePanelProps {
  shareLink: string
  copyStatus: 'idle' | 'copied' | 'failed'
  onCopyShareLink: () => void
}

export function SharePanel({
  shareLink,
  copyStatus,
  onCopyShareLink,
}: SharePanelProps) {
  return (
    <section className="panel share-panel">
      <div className="panel-header">
        <h2>Share Options</h2>
        <p>Generate a share link for the current answers and required seals.</p>
      </div>

      <div className="share-actions">
        <button type="button" onClick={onCopyShareLink}>
          Copy Link
        </button>
      </div>

      <label className="share-link-label" htmlFor="prefilled-link-input">
        Link
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
