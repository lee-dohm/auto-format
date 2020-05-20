export default class ExitError extends Error {
  constructor(command: string, exitCode: number) {
    super(`Command '${command}' exited with code ${exitCode}`)
  }
}
