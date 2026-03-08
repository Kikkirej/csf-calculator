import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { csfFramework } from './data/sources'
import {
  buildDefaultAnswers,
  buildDefaultRequiredSeals,
  computeSovereigntyScore,
} from './domain/scoring'
import {
  buildShareLink,
  createShareQuestionParams,
  createShareRequiredSealParams,
  parseSharePrefilledAnswers,
  parseSharePrefilledRequiredSeals,
} from './domain/share'
import type { CalculatorFormValues, ObjectiveId } from './domain/types'
import {
  Questionnaire,
  type ProviderExampleId,
  type ProviderExampleOption,
} from './ui/Questionnaire'
import { ResultsPanel } from './ui/ResultsPanel'
import { SharePanel } from './ui/SharePanel'
import { TraceabilityPanel } from './ui/TraceabilityPanel'
import './App.css'

const shareQuestionParams = createShareQuestionParams(csfFramework)
const shareRequiredSealParams = createShareRequiredSealParams(csfFramework)

const buildInitialFormValues = (): CalculatorFormValues => {
  const defaultAnswers = buildDefaultAnswers(csfFramework)
  const defaultRequiredSeals = buildDefaultRequiredSeals(csfFramework)

  if (typeof window === 'undefined') {
    return {
      answers: defaultAnswers,
      requiredSeals: defaultRequiredSeals,
    }
  }

  const prefilledAnswers = parseSharePrefilledAnswers(
    shareQuestionParams,
    window.location.search,
  )
  const prefilledRequiredSeals = parseSharePrefilledRequiredSeals(
    shareRequiredSealParams,
    window.location.search,
  )

  const mergedAnswers = { ...defaultAnswers }
  const mergedRequiredSeals = { ...defaultRequiredSeals }

  Object.entries(prefilledAnswers).forEach(([questionId, score]) => {
    if (typeof score === 'number') {
      mergedAnswers[questionId] = score
    }
  })

  Object.entries(prefilledRequiredSeals).forEach(([objectiveId, seal]) => {
    if (typeof seal === 'number') {
      mergedRequiredSeals[objectiveId] = seal
    }
  })

  return {
    answers: mergedAnswers,
    requiredSeals: mergedRequiredSeals,
  }
}

type ObjectiveExampleScores = Record<ObjectiveId, [number, number, number]>

interface ProviderExampleProfile {
  objectiveScores: ObjectiveExampleScores
}

type LinkCopyStatus = 'idle' | 'copied' | 'failed'

const primaryProviderExampleOptions: ProviderExampleOption[] = [
  { id: 'azure', label: 'Azure' },
  { id: 'open-telekom-cloud', label: 'Open Telekom Cloud' },
  { id: 'aws', label: 'AWS' },
  { id: 'hetzner', label: 'Hetzner' },
  { id: 'google-cloud', label: 'Google Cloud' },
]

const additionalProviderExampleOptions: ProviderExampleOption[] = [
  { id: 'ovhcloud', label: 'OVHcloud' },
  { id: 'scaleway', label: 'Scaleway' },
  { id: 'ionos-cloud', label: 'IONOS Cloud' },
  { id: 'stackit', label: 'STACKIT' },
  { id: 'aruba-cloud', label: 'Aruba Cloud' },
  { id: 'exoscale', label: 'Exoscale' },
  { id: 'oracle-cloud-infrastructure', label: 'Oracle Cloud Infrastructure (OCI)' },
  { id: 'ibm-cloud', label: 'IBM Cloud' },
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
  ovhcloud: {
    objectiveScores: {
      'SOV-1': [4, 4, 4],
      'SOV-2': [4, 4, 4],
      'SOV-3': [3, 4, 3],
      'SOV-4': [4, 4, 3],
      'SOV-5': [3, 3, 3],
      'SOV-6': [4, 3, 3],
      'SOV-7': [3, 3, 3],
      'SOV-8': [4, 4, 3],
    },
  },
  scaleway: {
    objectiveScores: {
      'SOV-1': [4, 4, 3],
      'SOV-2': [4, 4, 4],
      'SOV-3': [3, 4, 3],
      'SOV-4': [3, 4, 3],
      'SOV-5': [3, 3, 3],
      'SOV-6': [4, 4, 3],
      'SOV-7': [3, 3, 3],
      'SOV-8': [4, 4, 4],
    },
  },
  'ionos-cloud': {
    objectiveScores: {
      'SOV-1': [4, 4, 4],
      'SOV-2': [4, 4, 4],
      'SOV-3': [4, 4, 3],
      'SOV-4': [4, 4, 4],
      'SOV-5': [3, 3, 3],
      'SOV-6': [3, 3, 3],
      'SOV-7': [4, 4, 4],
      'SOV-8': [3, 3, 3],
    },
  },
  stackit: {
    objectiveScores: {
      'SOV-1': [4, 4, 3],
      'SOV-2': [4, 4, 4],
      'SOV-3': [3, 3, 3],
      'SOV-4': [3, 3, 3],
      'SOV-5': [3, 3, 2],
      'SOV-6': [3, 3, 3],
      'SOV-7': [3, 3, 3],
      'SOV-8': [3, 3, 3],
    },
  },
  'aruba-cloud': {
    objectiveScores: {
      'SOV-1': [4, 4, 3],
      'SOV-2': [4, 4, 4],
      'SOV-3': [3, 3, 3],
      'SOV-4': [3, 3, 3],
      'SOV-5': [3, 3, 2],
      'SOV-6': [3, 3, 3],
      'SOV-7': [3, 3, 3],
      'SOV-8': [4, 4, 3],
    },
  },
  exoscale: {
    objectiveScores: {
      'SOV-1': [3, 3, 3],
      'SOV-2': [4, 4, 3],
      'SOV-3': [3, 3, 3],
      'SOV-4': [3, 3, 3],
      'SOV-5': [2, 2, 2],
      'SOV-6': [3, 3, 3],
      'SOV-7': [3, 3, 3],
      'SOV-8': [3, 3, 3],
    },
  },
  'oracle-cloud-infrastructure': {
    objectiveScores: {
      'SOV-1': [1, 1, 2],
      'SOV-2': [1, 1, 1],
      'SOV-3': [2, 2, 2],
      'SOV-4': [2, 2, 2],
      'SOV-5': [1, 1, 2],
      'SOV-6': [2, 2, 2],
      'SOV-7': [3, 3, 2],
      'SOV-8': [3, 3, 3],
    },
  },
  'ibm-cloud': {
    objectiveScores: {
      'SOV-1': [1, 1, 2],
      'SOV-2': [1, 1, 1],
      'SOV-3': [2, 2, 2],
      'SOV-4': [2, 2, 2],
      'SOV-5': [1, 1, 2],
      'SOV-6': [2, 2, 2],
      'SOV-7': [3, 3, 3],
      'SOV-8': [3, 3, 3],
    },
  },
}

function App() {
  const [linkCopyStatus, setLinkCopyStatus] = useState<LinkCopyStatus>('idle')

  const initialValues = useMemo(() => buildInitialFormValues(), [])

  const { register, setValue, control } = useForm<CalculatorFormValues>({
    mode: 'onChange',
    defaultValues: initialValues,
  })

  const answers = useWatch({ control, name: 'answers' })
  const requiredSeals = useWatch({ control, name: 'requiredSeals' })

  const result = useMemo(
    () => computeSovereigntyScore(csfFramework, answers ?? {}, requiredSeals ?? {}),
    [answers, requiredSeals],
  )

  const shareLink = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    const baseUrl = `${window.location.origin}${window.location.pathname}`
    return buildShareLink(
      shareQuestionParams,
      shareRequiredSealParams,
      answers ?? {},
      requiredSeals ?? {},
      baseUrl,
    )
  }, [answers, requiredSeals])

  useEffect(() => {
    if (linkCopyStatus === 'idle') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setLinkCopyStatus('idle')
    }, 2000)

    return () => window.clearTimeout(timeoutId)
  }, [linkCopyStatus])

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

  const handleSetAllRequiredSeals = (sealLevel: number) => {
    csfFramework.objectives.forEach((objective) => {
      const fieldName = `requiredSeals.${objective.id}` as `requiredSeals.${string}`

      setValue(fieldName, sealLevel, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    })
  }

  const handleCopyShareLink = async () => {
    if (!shareLink || !navigator.clipboard) {
      setLinkCopyStatus('failed')
      return
    }

    try {
      await navigator.clipboard.writeText(shareLink)
      setLinkCopyStatus('copied')
    } catch {
      setLinkCopyStatus('failed')
    }
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
          primaryProviderExamples={primaryProviderExampleOptions}
          additionalProviderExamples={additionalProviderExampleOptions}
          onApplyProviderExample={handleApplyProviderExample}
          onSetAllRequiredSeals={handleSetAllRequiredSeals}
        />

        <div className="sidebar-stack">
          <ResultsPanel framework={csfFramework} result={result} />
          <TraceabilityPanel framework={csfFramework} />
          <SharePanel
            shareLink={shareLink}
            copyStatus={linkCopyStatus}
            onCopyShareLink={handleCopyShareLink}
          />
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
