import { spawn } from 'child_process'
import stringArgv from 'string-argv'

export const spawnFfmpeg = (
  cmd: string,
  onOutput: (o: string) => void,
  onClose: (code: number | null) => void
): void => {
  const [file, ...args] = stringArgv(cmd)
  const p = spawn(file, args)
  p.stderr.on('data', (data) => {
    onOutput(data.toString())
  })
  p.on('close', (code) => {
    onClose(code)
  })
}
