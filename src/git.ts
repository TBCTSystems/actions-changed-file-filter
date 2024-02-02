import {exec} from '@actions/exec'

async function execWithOutput(
  command: string,
  args: string[],
  cwd?: string
): Promise<string> {
  let output = ''
  const options = {
    cwd,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      }
    }
  }

  await exec(command, args, options)
  return output
}

function isError(error: unknown): error is Error {
  return error instanceof Error
}

async function handleCommandExecution(
  command: string,
  args: string[],
  cwd?: string
): Promise<string> {
  try {
    return await execWithOutput(command, args, cwd)
  } catch (error) {
    if (isError(error)) {
      throw new Error(`Command execution failed: ${error.message}`)
    } else {
      throw error
    }
  }
}

export async function getChangedFiles(
  baseSha: string,
  headSha: string,
  cwd?: string
): Promise<string[]> {
  const output = await handleCommandExecution(
    'git',
    ['diff', '--name-only', `${baseSha}..${headSha}`, '--'],
    cwd
  )
  return output
    .split('\n')
    .map(x => x.trim())
    .filter(x => x.length > 0)
}

export async function revParse(rev: string, cwd?: string): Promise<string> {
  const output = await handleCommandExecution('git', ['rev-parse', rev], cwd)
  return output.trim()
}

export async function unshallow(): Promise<number> {
  try {
    return await exec('git', ['fetch', '--prune', '--unshallow'])
  } catch (error) {
    if (isError(error)) {
      throw new Error(`Failed to unshallow: ${error.message}`)
    } else {
      throw error
    }
  }
}

export async function getMergeBase(
  baseSha: string,
  headSha: string,
  cwd?: string
): Promise<string> {
  const output = await handleCommandExecution(
    'git',
    ['merge-base', baseSha, headSha],
    cwd
  )
  return output.trim()
}
