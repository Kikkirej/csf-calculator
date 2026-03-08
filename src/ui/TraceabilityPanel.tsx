import type { CsfFramework } from '../domain/types'

interface TraceabilityPanelProps {
  framework: CsfFramework
}

export function TraceabilityPanel({ framework }: TraceabilityPanelProps) {
  return (
    <section className="panel traceability-panel">
      <div className="panel-header">
        <h2>Traceability and References</h2>
        <p>
          Each objective and formula element maps back to the official Cloud
          Sovereignty Framework.
        </p>
      </div>

      <p>
        Framework version: <strong>{framework.version}</strong> ({framework.publicationDate})
      </p>
      <p>
        Formula ({framework.scoring.sourceSection}): <code>{framework.scoring.formula}</code>
      </p>
      <p>
        Source standard:{' '}
        <a href={framework.sourceUrl} target="_blank" rel="noreferrer">
          {framework.title} document
        </a>
      </p>

      <ul className="trace-list">
        {framework.objectives.map((objective) => (
          <li key={objective.id}>
            <strong>
              {objective.id}: {objective.name}
            </strong>
            <span>
              Weight {objective.weight}% | {objective.sourceSection}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
