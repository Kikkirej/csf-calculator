import { useState } from 'react'
import type { UseFormRegister } from 'react-hook-form'

import type { CalculatorFormValues, CsfFramework } from '../domain/types'

export type ProviderExampleId =
  | 'azure'
  | 'open-telekom-cloud'
  | 'aws'
  | 'hetzner'
  | 'google-cloud'
  | 'ovhcloud'
  | 'scaleway'
  | 'ionos-cloud'
  | 'stackit'
  | 'aruba-cloud'
  | 'exoscale'
  | 'oracle-cloud-infrastructure'
  | 'ibm-cloud'

export interface ProviderExampleOption {
  id: ProviderExampleId
  label: string
}

const scoreOptions = [
  { value: 0, label: '0 - None' },
  { value: 1, label: '1 - Limited' },
  { value: 2, label: '2 - Partial' },
  { value: 3, label: '3 - Strong' },
  { value: 4, label: '4 - Full' },
]

const sealOptions = [0, 1, 2, 3, 4]

interface QuestionnaireProps {
  framework: CsfFramework
  register: UseFormRegister<CalculatorFormValues>
  primaryProviderExamples: ProviderExampleOption[]
  additionalProviderExamples: ProviderExampleOption[]
  onApplyProviderExample: (providerId: ProviderExampleId) => void
  onSetAllRequiredSeals: (sealLevel: number) => void
}

export function Questionnaire({
  framework,
  register,
  primaryProviderExamples,
  additionalProviderExamples,
  onApplyProviderExample,
  onSetAllRequiredSeals,
}: QuestionnaireProps) {
  const [bulkSealLevel, setBulkSealLevel] = useState(2)

  return (
    <section className="panel questionnaire-panel">
      <div className="panel-header">
        <h2>Assessment Inputs</h2>
        <p>
          Score each criterion from 0 to 4, then set the minimum required SEAL for
          every objective.
        </p>
      </div>

      <details className="seal-levels-info">
        <summary>SEAL levels reference</summary>
        <ul>
          {framework.sealLevels.map((sealLevel) => (
            <li key={`seal-level-${sealLevel.level}`}>
              <strong>
                SEAL-{sealLevel.level}: {sealLevel.label}
              </strong>
              <span>{sealLevel.description}</span>
            </li>
          ))}
        </ul>

        <div className="seal-bulk-controls">
          <label htmlFor="bulk-required-seal">Set all required SEAL values</label>
          <div className="seal-bulk-row">
            <select
              id="bulk-required-seal"
              value={bulkSealLevel}
              onChange={(event) => {
                const nextLevel = Number.parseInt(event.target.value, 10)
                setBulkSealLevel(Number.isNaN(nextLevel) ? 0 : nextLevel)
              }}
            >
              {sealOptions.map((level) => (
                <option key={`bulk-seal-${level}`} value={level}>
                  SEAL-{level}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => onSetAllRequiredSeals(bulkSealLevel)}>
              Set All Seals
            </button>
          </div>
        </div>
      </details>

      <div className="quick-fill" role="group" aria-label="Provider example scenarios">
        {primaryProviderExamples.map((providerExample) => (
          <button
            key={providerExample.id}
            type="button"
            onClick={() => onApplyProviderExample(providerExample.id)}
          >
            {providerExample.label}
          </button>
        ))}

        <details className="provider-dropdown">
          <summary aria-label="More provider examples">...</summary>
          <div className="provider-dropdown-menu" role="menu">
            {additionalProviderExamples.map((providerExample) => (
              <button
                key={providerExample.id}
                type="button"
                role="menuitem"
                onClick={(event) => {
                  onApplyProviderExample(providerExample.id)
                  event.currentTarget.closest('details')?.removeAttribute('open')
                }}
              >
                {providerExample.label}
              </button>
            ))}
          </div>
        </details>
      </div>

      {framework.objectives.map((objective) => (
        <article key={objective.id} className="objective-card">
          <header className="objective-header">
            <div>
              <h3>
                {objective.id}: {objective.name}
              </h3>
              <p>{objective.description}</p>
            </div>

            <label className="seal-select" htmlFor={`required-seal-${objective.id}`}>
              <span>Required SEAL</span>
              <select
                id={`required-seal-${objective.id}`}
                {...register(`requiredSeals.${objective.id}` as const, {
                  valueAsNumber: true,
                })}
              >
                {sealOptions.map((level) => (
                  <option key={`${objective.id}-seal-${level}`} value={level}>
                    SEAL-{level}
                  </option>
                ))}
              </select>
            </label>
          </header>

          <div className="question-grid">
            {objective.questions.map((question) => (
              <label key={question.id} className="question-item">
                <span className="question-prompt">{question.prompt}</span>
                <select
                  className="score-select"
                  {...register(`answers.${question.id}` as const, {
                    valueAsNumber: true,
                  })}
                >
                  {scoreOptions.map((option) => (
                    <option key={`${question.id}-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="question-meta">
                  {question.factor} ({question.sourceSection})
                </span>
              </label>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}
