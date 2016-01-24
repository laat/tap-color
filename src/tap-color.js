import chalk from 'chalk'
import duplexer from 'duplexer2'
import through from 'through2'
import { LineStream } from 'byline'

function color (line) {
  return line
    .replace(/^ok \d*/, l => chalk.green.bold(l))
    .replace(/^not ok \d*/, l => chalk.red.bold(l))
    .replace(/^Bail out!/, l => chalk.red.bold(l))
    .replace(/^(TAP version 13|1..\d+)/, l => chalk.gray(l))
    .replace(/^\s+---/, l => chalk.gray(l))
    .replace(/^\s+\.\.\./, l => chalk.gray(l))
    .replace(/(#\s*)(TODO|XXX|skipped|skip|pass|fail)?(.*)/i, (line, hash, mod, rest) => {
      let out = []
      if (hash) {
        out.push(chalk.gray(hash))
      }
      if (mod) {
        if (mod.match(/skip|skipped/)) {
          out.push(chalk.yellow(mod))
        } else if (mod.match(/pass/)) {
          out.push(chalk.green(mod))
        } else if (mod.match(/fail/)) {
          out.push(chalk.red(mod))
        } else {
          out.push(chalk.magenta(mod))
        }
      }
      if (rest) {
        out.push(chalk.gray(rest))
      }
      return out.join('')
    })
}

export default function colorStream () {
  const lines = new LineStream()
  const output = through()

  lines.on('data', (line) => {
    output.push(color(line.toString() + '\n'))
  })
  return duplexer(lines, output)
}
