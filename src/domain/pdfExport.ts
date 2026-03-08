import type { CsfFramework, ObjectiveScoreResult, SovereigntyScoreResult } from './types'

interface PdfOverviewDocumentInput {
  framework: CsfFramework
  result: SovereigntyScoreResult
  generatedAt: Date
}

const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const escapeHtml = (rawValue: string): string =>
  rawValue.replace(/[&<>"']/g, (character) => htmlEscapeMap[character] ?? character)

const formatPercent = (value: number): string => `${(value * 100).toFixed(1)}%`

const formatGeneratedAt = (generatedAt: Date): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(generatedAt)

const renderObjectiveRow = (objectiveResult: ObjectiveScoreResult): string => {
  const statusLabel = objectiveResult.passesRequiredSeal ? 'Pass' : 'Fail'
  const statusClass = objectiveResult.passesRequiredSeal ? 'status-pass' : 'status-fail'

  return `
    <tr>
      <td>${escapeHtml(objectiveResult.objectiveId)}</td>
      <td>${escapeHtml(objectiveResult.objectiveName)}</td>
      <td>${objectiveResult.weightedContribution.toFixed(2)} / ${objectiveResult.weight}</td>
      <td>${formatPercent(objectiveResult.normalizedScore)}</td>
      <td>SEAL-${objectiveResult.derivedSeal}</td>
      <td>SEAL-${objectiveResult.requiredSeal}</td>
      <td class="${statusClass}">${statusLabel}</td>
    </tr>
  `
}

export const buildPdfOverviewDocument = ({
  framework,
  result,
  generatedAt,
}: PdfOverviewDocumentInput): string => {
  const strongestObjective = [...result.objectiveResults].sort(
    (left, right) => right.weightedContribution - left.weightedContribution,
  )[0]

  const weakestObjective = [...result.objectiveResults].sort(
    (left, right) => left.normalizedScore - right.normalizedScore,
  )[0]

  const failingObjectivesSummary =
    result.failingObjectives.length > 0 ? result.failingObjectives.join(', ') : 'None'

  const sealSummary = result.passesAllRequiredSeals
    ? 'All required SEAL checks passed'
    : `Failed objectives: ${failingObjectivesSummary}`

  const objectiveRows = result.objectiveResults.map(renderObjectiveRow).join('')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cloud Sovereignty Overview</title>
    <style>
      @page {
        size: A4;
        margin: 14mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: #14263b;
        font-family: "Segoe UI", "Noto Sans", Arial, sans-serif;
        font-size: 12px;
        line-height: 1.45;
      }

      h1,
      h2 {
        margin: 0;
      }

      h1 {
        font-size: 20px;
      }

      h2 {
        font-size: 15px;
        margin-top: 14px;
      }

      .subtle {
        color: #4a5f75;
      }

      .header {
        border-bottom: 1px solid #c8d5e3;
        padding-bottom: 10px;
        margin-bottom: 12px;
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 12px;
      }

      .metric {
        border: 1px solid #d7e2ed;
        border-radius: 8px;
        padding: 8px;
        background: #f8fbff;
      }

      .metric-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #5a7087;
      }

      .metric-value {
        margin-top: 4px;
        font-size: 17px;
        font-weight: 700;
      }

      .insights {
        margin: 8px 0 0;
        padding-left: 16px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
      }

      th,
      td {
        border: 1px solid #d3deea;
        padding: 6px 7px;
        text-align: left;
        vertical-align: top;
      }

      th {
        background: #eef4fb;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .status-pass {
        color: #176e4f;
        font-weight: 700;
      }

      .status-fail {
        color: #8b2f2f;
        font-weight: 700;
      }

      .footer {
        margin-top: 10px;
        border-top: 1px solid #d4dfeb;
        padding-top: 8px;
        font-size: 10px;
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    </style>
  </head>
  <body>
    <header class="header">
      <h1>Cloud Sovereignty Assessment Overview</h1>
      <p class="subtle">
        Framework: ${escapeHtml(framework.title)} v${escapeHtml(framework.version)} (${escapeHtml(
          framework.publicationDate,
        )})
        <br />Generated: ${escapeHtml(formatGeneratedAt(generatedAt))}
      </p>
    </header>

    <section class="metrics">
      <article class="metric">
        <p class="metric-label">Sovereignty Score</p>
        <p class="metric-value">${result.score.toFixed(2)} / ${result.weightTotal.toFixed(0)}</p>
      </article>
      <article class="metric">
        <p class="metric-label">SEAL Compliance</p>
        <p class="metric-value">${result.passesAllRequiredSeals ? 'Pass' : 'Review Needed'}</p>
      </article>
      <article class="metric">
        <p class="metric-label">Failed Objectives</p>
        <p class="metric-value">${result.failingObjectives.length}</p>
      </article>
    </section>

    <section>
      <h2>Short Overview</h2>
      <ul class="insights">
        <li>${escapeHtml(sealSummary)}</li>
        <li>Strongest objective contribution: ${escapeHtml(
          strongestObjective?.objectiveId ?? 'N/A',
        )} (${strongestObjective?.weightedContribution.toFixed(2) ?? '0.00'} / ${
    strongestObjective?.weight ?? 0
  })</li>
        <li>Lowest normalized objective score: ${escapeHtml(
          weakestObjective?.objectiveId ?? 'N/A',
        )} (${formatPercent(weakestObjective?.normalizedScore ?? 0)})</li>
      </ul>
    </section>

    <section>
      <h2>Objective Snapshot</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Objective</th>
            <th>Contribution</th>
            <th>Normalized</th>
            <th>Derived</th>
            <th>Required</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${objectiveRows}</tbody>
      </table>
    </section>

    <footer class="footer subtle">
      Formula reference (${escapeHtml(framework.scoring.sourceSection)}): ${escapeHtml(
    framework.scoring.formula,
  )}
    </footer>
  </body>
</html>`
}
