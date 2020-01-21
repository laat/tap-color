import chalk from 'chalk';
import duplexer from 'duplexer2';
import through from 'through2';
import { LineStream } from 'byline';

const notOk = /^\s*not ok \d*/;
const bailOut = /^Bail out!/;

function color(theLine) {
  return theLine
    .replace(/^\s*ok \d*/, (l) => chalk.green.bold(l))
    .replace(notOk, (l) => chalk.red.bold(l))
    .replace(bailOut, (l) => chalk.red.bold(l))
    .replace(/^\s*(TAP version 13|1..\d+)/, (l) => chalk.gray(l))
    .replace(/^\s+---/, (l) => chalk.gray(l))
    .replace(/^\s+\.\.\./, (l) => chalk.gray(l))
    .replace(/(#\s*)(TODO|XXX|skipped|skip|pass|fail)?(.*)/i, (line, hash, mod, rest) => {
      const out = [];
      if (hash) {
        out.push(chalk.gray(hash));
      }
      if (mod) {
        if (mod.match(/skip|skipped/)) {
          out.push(chalk.yellow(mod));
        } else if (mod.match(/pass/)) {
          out.push(chalk.green(mod));
        } else if (mod.match(/fail/)) {
          out.push(chalk.red(mod));
        } else {
          out.push(chalk.magenta(mod));
        }
      }
      if (rest) {
        out.push(chalk.gray(rest));
      }
      return out.join('');
    });
}

export default function colorStream() {
  const lines = new LineStream();
  const output = through();
  const dup = duplexer(lines, output);

  lines.on('data', (line) => {
    const lineString = line.toString();
    if (lineString.match(notOk) || lineString.match(bailOut)) {
      dup.failed = true;
    }
    output.push(color(`${lineString}\n`));
  });
  return dup;
}
