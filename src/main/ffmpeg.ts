import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import stringArgv from 'string-argv'

let process: ChildProcessWithoutNullStreams | null = null

export const spawnFfmpeg = (
  cmd: string,
  onOutput: (o: string) => void,
  onClose: (code: number | null) => void
): void => {
  if (process) {
    process.kill('SIGINT')
    process = null
  }
  const [file, ...args] = stringArgv(cmd)
  process = spawn(file, args)
  process.stderr.on('data', (data) => {
    onOutput(data.toString())
  })
  process.on('close', (code) => {
    onClose(code)
  })
}

export const killFfmpeg = (): void => {
  if (!process) return
  process.kill('SIGINT')
}
