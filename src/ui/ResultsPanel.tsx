/* SPDX-License-Identifier: GPL-3.0-or-later */

import type { CsfFramework, SovereigntyScoreResult } from '../domain/types'

interface ResultsPanelProps {
  framework: CsfFramework
  result: SovereigntyScoreResult
}

const formatPercent = (value: number): string => `${(value * 100).toFixed(1)}%`

export function ResultsPanel({ framework, result }: ResultsPanelProps) {
  const sealByLevel = new Map(
    framework.sealLevels.map((sealLevel) => [sealLevel.level, sealLevel.label]),
  )

  return (
    <section className="panel results-panel">
      <div className="panel-header">
        <h2>Computed Outcome</h2>
        <p>
          Global score follows the weighted formula from {framework.scoring.sourceSection}.
        </p>
      </div>

      <div className="headline-card">
        <p className="headline-kicker">Sovereignty Score</p>
        <p className="headline-value">
          {result.score.toFixed(2)} / {result.weightTotal.toFixed(0)}
        </p>
        <p className={result.passesAllRequiredSeals ? 'status-pass' : 'status-fail'}>
          {result.passesAllRequiredSeals
            ? 'All minimum SEAL requirements are satisfied.'
            : `SEAL requirements failed for: ${result.failingObjectives.join(', ')}`}
        </p>
      </div>

      <div className="objective-results">
        {result.objectiveResults.map((objectiveResult) => (
          <article key={objectiveResult.objectiveId} className="result-row">
            <header>
              <h3>
                {objectiveResult.objectiveId}: {objectiveResult.objectiveName}
              </h3>
              <p>
                {objectiveResult.weightedContribution.toFixed(2)} / {objectiveResult.weight}
              </p>
            </header>

            <div className="progress-wrap" aria-hidden="true">
              <div
                className="progress-value"
                style={{ width: `${objectiveResult.normalizedScore * 100}%` }}
              />
            </div>

            <p className="row-meta">
              Raw objective score: {objectiveResult.earnedPoints} / {objectiveResult.maxPoints}{' '}
              ({formatPercent(objectiveResult.normalizedScore)})
            </p>
            <p className="row-meta">
              Derived SEAL: SEAL-{objectiveResult.derivedSeal} ({sealByLevel.get(objectiveResult.derivedSeal)})
            </p>
            <p className={objectiveResult.passesRequiredSeal ? 'status-pass' : 'status-fail'}>
              Required: SEAL-{objectiveResult.requiredSeal}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
