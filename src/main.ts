import * as fs from 'fs'
import * as util from 'util'

import * as core from '@actions/core'
import * as exec from '@actions/exec'

import ExitError from './exit-error'

const readFile = util.promisify(fs.readFile)

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
    const message = core.getInput('message') ?? 'Automated formatting'

    const path = process.env['GITHUB_EVENT_PATH'] ?? '/github/workflow/event.json'
    const payload = JSON.parse((await readFile(path)).toString())

    if (setup) {
      execCommand(setup)
    }

    const exitCode = await execCommand(check, { throw: false })

    if (exitCode != 0) {
      await execCommand(format)

      await execCommand(`git config user.name "github-actions[bot]"`)
      await execCommand(
        `git config user.email "41898282+github-actions[bot]@users.noreply.github.com"`
      )
      await execCommand(`git commit -am "${message}"`)
      await execCommand(`git push origin HEAD:${payload.pull_request.head.ref}`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
