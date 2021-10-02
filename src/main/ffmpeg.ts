import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import stringArgv from 'string-argv'
import os from 'os'

let proc: ChildProcessWithoutNullStreams | null = null

const pathEnv = () => {
  if (os.platform() === 'darwin') {
    if (process.env.PATH) {
      return `${process.env.PATH}:/usr/local/bin`
    } else {
      return '/usr/local/bin'
    }
  }
  return process.env.PATH
}

export const spawnFfmpeg = (
  cmd: string,
  onOutput: (o: string) => void,
  onClose: (code: number | null) => void
): void => {
  if (proc) {
    proc.kill('SIGINT')
    proc = null
  }
  const [file, ...args] = stringArgv(cmd)
  proc = spawn(file, args, {
    env: {
      PATH: pathEnv(),
    },
  })
  proc.stderr.on('data', (data) => {
    onOutput(data.toString())
  })
  proc.on('close', (code) => {
    onClose(code)
  })
}

export const killFfmpeg = (): void => {
  if (!proc) return
  proc.kill('SIGINT')
}
