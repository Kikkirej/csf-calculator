/* SPDX-License-Identifier: GPL-3.0-or-later */

import { z } from 'zod'

import type { CsfFramework } from '../domain/types'
import frameworkRaw from './csf-v1.2.1.json'

const objectiveIdSchema = z.enum([
  'SOV-1',
  'SOV-2',
  'SOV-3',
  'SOV-4',
  'SOV-5',
  'SOV-6',
  'SOV-7',
  'SOV-8',
])

const sealLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
])

const questionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  factor: z.string().min(1),
  sourceSection: z.string().min(1),
  maxPoints: z.number().int().positive(),
})

const objectiveSchema = z.object({
  id: objectiveIdSchema,
  name: z.string().min(1),
  weight: z.number().int().positive(),
  description: z.string().min(1),
  sourceSection: z.string().min(1),
  contributingFactors: z.array(z.string().min(1)).min(1),
  questions: z.array(questionSchema).min(1),
})

const frameworkSchema = z
  .object({
    version: z.string().min(1),
    title: z.string().min(1),
    publicationDate: z.string().min(1),
    sourceUrl: z.string().url(),
    scoring: z.object({
      sourceSection: z.string().min(1),
      formula: z.string().min(1),
      weightsMustSumTo: z.number().int().positive(),
    }),
    sealLevels: z
      .array(
        z.object({
          level: sealLevelSchema,
          label: z.string().min(1),
          description: z.string().min(1),
          sourceSection: z.string().min(1),
        }),
      )
      .length(5),
    objectives: z.array(objectiveSchema).length(8),
  })
  .superRefine((framework, ctx) => {
    const weightTotal = framework.objectives.reduce(
      (sum, objective) => sum + objective.weight,
      0,
    )

    if (weightTotal !== framework.scoring.weightsMustSumTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Weight total ${weightTotal} does not match expected ${framework.scoring.weightsMustSumTo}.`,
      })
    }

    const objectiveIds = framework.objectives.map((objective) => objective.id)
    const duplicateIds = objectiveIds.filter(
      (objectiveId, index) => objectiveIds.indexOf(objectiveId) !== index,
    )

    if (duplicateIds.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate objective ids found: ${duplicateIds.join(', ')}`,
      })
    }
  })

export const csfFramework: CsfFramework = frameworkSchema.parse(frameworkRaw)
