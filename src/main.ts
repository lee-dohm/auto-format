import * as core from '@actions/core'
import * as exec from '@actions/exec'

import ExitError from './exit-error'

interface ExecCommandOpts {
  throw?: boolean
}

/**
 * Executes a command.
 *
 * @param command Command to execute
 * @param opts Options to use when executing the command
 * @returns Exit code of the command
 */
async function execCommand(command: string, opts: ExecCommandOpts = {}) {
  const options: ExecCommandOpts = Object.assign({ throw: true }, opts)
  const exitCode = await exec.exec(command, undefined, { ignoreReturnCode: true })

  if (options.throw && exitCode != 0) {
    throw new ExitError(command, exitCode)
  }

  return exitCode
}

async function run(): Promise<void> {
  try {
    const setup = core.getInput('setup')
    const check = core.getInput('check', { required: true })
    const format = core.getInput('format', { required: true })
    const token = core.getInput('token', { required: true })
    const message = core.getInput('message') ?? 'Automated formatting'

    let exitCode: number

    if (setup) {
      execCommand(setup)
    }

    exitCode = await execCommand(check, { throw: false })

    if (exitCode != 0) {
      await execCommand(format)

      await execCommand(`git commit -am '${message}' --author="github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>"`)
      await execCommand('git push')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
