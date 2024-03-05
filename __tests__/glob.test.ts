import {newGlobber} from '../src/glob'

describe('globber returned by newGlobber', () => {
  interface GlobberTestCase {
    globRules: string[]
    expectedMatches: [string, boolean][]
  }
  const testCases: GlobberTestCase[] = [
    {
      globRules: ['**/*.go', '__tests__/**/*.test.ts'],
      expectedMatches: [
        ['main.go', true],
        ['deep/main.go', true],
        ['shallow.ts', false],
        ['__tests__/main.ts', false],
        ['__tests__/main.test.ts', true]
      ]
    },
    {
      globRules: ['BUILD', '**/BUILD.bazel'],
      expectedMatches: [
        ['BUILD', true],
        ['src/BUILD.bazel', true],
        ['src/pkg/BUILD.bazel', true],
        ['src/BUILD', false],
        ['BUILD.bazel', true]
      ]
    },
    {
      globRules: ['src/**/*'],
      expectedMatches: [
        ['file', false],
        ['src/file', true],
        ['src/nested/file', true]
      ]
    },
    {
      globRules: ['src/**/(?<!ProjectVersion)'],
      expectedMatches: [
        ['file', false],
        ['src/file', true],
        ['src/nested/file', true],
        ['src/ProjectVersion', false],
        ['src/nested/ProjectVersion', false]
      ]
    },
    {
      globRules: ['.github/**/*'],
      expectedMatches: [
        ['.github/workflows/push.yaml', true],
        ['.github/push.yaml', true],
        ['github/push.yaml', false],
        ['.gathub/push.yaml', false]
      ]
    },
    {
      globRules: ['*'],
      expectedMatches: [
        ['.github/workflows/push.yaml', false],
        ['dockerBuild.sh', true],
        ['a/b/c/d', false]
      ]
    },
    {
      globRules: ['Common(?:(?!Automation).)+'],
      expectedMatches: [
        ['.github/workflows/push.yaml', false],
        ['Common/Automation', false],
        ['Common/Automation/pytest.py', false],
        ['Common/Other', true],
        ['Common/Other/main.cpp', true],
        ['Eric/Automation', false],
        ['a/b/c/d', false]
      ]
    },
    {
      globRules: ['.github/actions/**/*'],
      expectedMatches: [
        ['.github/actions/push.yaml', true],
        ['github/actions/push.yaml', false],
        ['.github/actions/automation_inputs/action.yaml', true],
        ['.github/actions/build_and_test/action.yaml', true]
      ]
    },
    {
      globRules: ['.github/workflows/push.yaml'],
      expectedMatches: [
        ['github/workflows/push.yaml', false],
        ['.github/workflows/automation_nightly.yaml', false],
        ['.github/workflows/push.yaml', true]
      ]
    },
    {
      globRules: ['Eric(?:(?!Automation|ProjectVersion).)+'],
      expectedMatches: [
        ['Eric/Automation', false],
        ['Eric/Automation/pytest.py', false],
        ['Eric/ProjectVersion', false],
        ['Eric/Other/ProjectVersion', false],
        ['Eric/Other', true],
        ['Eric/Other/main.cpp', true],
        ['Eric/Automation/step_defs/test_alarmsanity.py', false],
        ['Eric/Automation/features/alarmsanity.feature', false],
        ['Eric/Automation/conftest.py', false]
      ]
    },
    {
      globRules: ['Eric/OSVersion'],
      expectedMatches: [
        ['Eric/OSVersion', true],
        ['Orion/OSVersion', false]
      ]
    }
  ]
  it('matches paths correctly', () => {
    for (const testCase of testCases) {
      const globber = newGlobber(testCase.globRules)
      for (const [input, match] of testCase.expectedMatches) {
        const testMessage = `${input} ${match ? 'should' : "shouldn't"} match ${
          testCase.globRules
        }`
        expect(globber(input), testMessage).toEqual(match)
      }
    }
  })
})
