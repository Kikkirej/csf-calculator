import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { csfFramework } from './data/sources'
import {
  buildDefaultAnswers,
  buildDefaultRequiredSeals,
  computeSovereigntyScore,
} from './domain/scoring'
import type { CalculatorFormValues, ObjectiveId } from './domain/types'
import {
  Questionnaire,
  type ProviderExampleId,
  type ProviderExampleOption,
} from './ui/Questionnaire'
import { ResultsPanel } from './ui/ResultsPanel'
import { TraceabilityPanel } from './ui/TraceabilityPanel'
import './App.css'

const defaultValues: CalculatorFormValues = {
  answers: buildDefaultAnswers(csfFramework),
  requiredSeals: buildDefaultRequiredSeals(csfFramework),
}

type ObjectiveExampleScores = Record<ObjectiveId, [number, number, number]>

interface ProviderExampleProfile {
  objectiveScores: ObjectiveExampleScores
}

const providerExampleOptions: ProviderExampleOption[] = [
  { id: 'azure', label: 'Azure' },
  { id: 'open-telekom-cloud', label: 'Open Telekom Cloud' },
  { id: 'aws', label: 'AWS' },
  { id: 'hetzner', label: 'Hetzner' },
  { id: 'google-cloud', label: 'Google Cloud' },
]

const providerExampleProfiles: Record<ProviderExampleId, ProviderExampleProfile> = {
  azure: {
    objectiveScores: {
      'SOV-1': [2, 1, 2],
      'SOV-2': [1, 1, 1],
      'SOV-3': [2, 2, 2],
      'SOV-4': [2, 2, 2],
      'SOV-5': [1, 1, 2],
      'SOV-6': [2, 1, 1],
      'SOV-7': [4, 3, 2],
      'SOV-8': [3, 3, 4],
    },
  },
  'open-telekom-cloud': {
    objectiveScores: {
      'SOV-1': [4, 4, 4],
      'SOV-2': [4, 4, 4],
      'SOV-3': [4, 4, 3],
      'SOV-4': [3, 4, 3],
      'SOV-5': [3, 3, 3],
      'SOV-6': [3, 3, 3],
      'SOV-7': [4, 4, 4],
      'SOV-8': [3, 3, 3],
    },
  },
  aws: {
    objectiveScores: {
      'SOV-1': [1, 1, 2],
      'SOV-2': [1, 1, 1],
      'SOV-3': [2, 2, 2],
      'SOV-4': [2, 1, 2],
      'SOV-5': [1, 1, 2],
      'SOV-6': [2, 1, 1],
      'SOV-7': [4, 3, 2],
      'SOV-8': [3, 3, 3],
    },
  },
  hetzner: {
    objectiveScores: {
      'SOV-1': [4, 4, 3],
      'SOV-2': [4, 4, 4],
      'SOV-3': [3, 4, 3],
      'SOV-4': [4, 4, 3],
      'SOV-5': [3, 3, 3],
      'SOV-6': [4, 3, 3],
      'SOV-7': [3, 3, 3],
      'SOV-8': [3, 3, 3],
    },
  },
  'google-cloud': {
    objectiveScores: {
      'SOV-1': [1, 1, 2],
      'SOV-2': [1, 1, 1],
      'SOV-3': [2, 2, 2],
      'SOV-4': [2, 2, 2],
      'SOV-5': [1, 1, 2],
      'SOV-6': [3, 2, 2],
      'SOV-7': [3, 3, 2],
      'SOV-8': [4, 4, 4],
    },
  },
}

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

  const handleApplyProviderExample = (providerId: ProviderExampleId) => {
    const profile = providerExampleProfiles[providerId]

    csfFramework.objectives.forEach((objective) => {
      const objectiveScores = profile.objectiveScores[objective.id]

      objective.questions.forEach((question, index) => {
        const fieldName = `answers.${question.id}` as `answers.${string}`
        const score = objectiveScores[index] ?? 0

        setValue(fieldName, score, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      })
    })
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="badge-row">
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
          Open official Cloud Sovereignty Framework document
        </a>
      </header>

      <main className="layout-grid">
        <Questionnaire
          framework={csfFramework}
          register={register}
          providerExamples={providerExampleOptions}
          onApplyProviderExample={handleApplyProviderExample}
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
