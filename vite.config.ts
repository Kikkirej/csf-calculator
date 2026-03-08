/* SPDX-License-Identifier: GPL-3.0-or-later */

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/'

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/domain/**/*.ts'],
    },
  },
})
