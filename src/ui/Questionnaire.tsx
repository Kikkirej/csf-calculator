import type { UseFormRegister } from 'react-hook-form'

import type { CalculatorFormValues, CsfFramework } from '../domain/types'

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
  onFillAll: (score: number) => void
}

export function Questionnaire({ framework, register, onFillAll }: QuestionnaireProps) {
  return (
    <section className="panel questionnaire-panel">
      <div className="panel-header">
        <h2>Assessment Inputs</h2>
        <p>
          Score each criterion from 0 to 4, then set the minimum required SEAL for
          every objective.
        </p>
      </div>

      <div className="quick-fill" role="group" aria-label="Quick fill scenarios">
        <button type="button" onClick={() => onFillAll(1)}>
          Fill Low Baseline
        </button>
        <button type="button" onClick={() => onFillAll(2)}>
          Fill Balanced Baseline
        </button>
        <button type="button" onClick={() => onFillAll(4)}>
          Fill Optimistic Baseline
        </button>
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
