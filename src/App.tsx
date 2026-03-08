import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { csfFramework } from './data/sources'
import {
  buildDefaultAnswers,
  buildDefaultRequiredSeals,
  computeSovereigntyScore,
} from './domain/scoring'
import type { CalculatorFormValues } from './domain/types'
import { Questionnaire } from './ui/Questionnaire'
import { ResultsPanel } from './ui/ResultsPanel'
import { TraceabilityPanel } from './ui/TraceabilityPanel'
import './App.css'

const defaultValues: CalculatorFormValues = {
  answers: buildDefaultAnswers(csfFramework),
  requiredSeals: buildDefaultRequiredSeals(csfFramework),
}

const allQuestionIds = csfFramework.objectives.flatMap((objective) =>
  objective.questions.map((question) => question.id),
)

function App() {
  const { register, setValue, control } = useForm<CalculatorFormValues>({
    mode: 'onChange',
    defaultValues,
  })

  const answers = useWatch({ control, name: 'answers' })
  const requiredSeals = useWatch({ control, name: 'requiredSeals' })

  const result = useMemo(
    () => computeSovereigntyScore(csfFramework, answers ?? {}, requiredSeals ?? {}),
    [answers, requiredSeals],
  )

  const handleFillAll = (score: number) => {
    allQuestionIds.forEach((questionId) => {
      const fieldName = `answers.${questionId}` as `answers.${string}`

      setValue(fieldName, score, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    })
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="badge-row">
          <span className="badge">Single-page calculator</span>
          <span className="badge">GitHub Pages ready</span>
          <span className="badge">CSF v{csfFramework.version}</span>
        </div>
        <h1>Cloud Sovereignty Calculator</h1>
        <p>
          Evaluate sovereignty posture across SOV-1 to SOV-8, compute the weighted
          score from Section 5, and verify SEAL minimum requirements from Section 3.
        </p>
        <a
          className="source-link"
          href={csfFramework.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open official Cloud Sovereignty Framework PDF
        </a>
      </header>

      <main className="layout-grid">
        <Questionnaire
          framework={csfFramework}
          register={register}
          onFillAll={handleFillAll}
        />

        <div className="sidebar-stack">
          <ResultsPanel framework={csfFramework} result={result} />
          <TraceabilityPanel framework={csfFramework} />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Formula: <code>{csfFramework.scoring.formula}</code>
        </p>
        <p>
          Weight total: <strong>{result.weightTotal}%</strong>
        </p>
      </footer>
    </div>
  )
}

export default App
