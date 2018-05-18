/* @flow */
/* eslint-disable global-require, import/no-dynamic-require */
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import program from 'commander';

import { runBenchmark, printResult, type BenchmarkResult } from './benchmark';
import { getBenchmark, suite, scenario } from './globals';
import packageJSON from '../package.json';

const DEFAULT_FILES = '**/__benchmarks__/*.js';

// Define global variables used by scenarios
global.suite = suite;
global.scenario = scenario;

// Define command line spec
program
    .version(packageJSON.version, '-v, --version')
    .usage('[options] <file...>')
    .option('-s, --save [file]', 'save result to a JSON file')
    .option('-c, --compare [file]', 'compare result with previous results')
    .parse(process.argv);

main().catch(error => {
    process.stderr.write(`${error.message || error}\n`);
    process.exit(1);
});

async function main() {
    const inputFiles = program.args.length == 0 ? DEFAULT_FILES : program.args;

    const paths = await globby(inputFiles);

    paths.forEach(filePath => {
        require(path.resolve(process.cwd(), filePath));
    });

    const input = getBenchmark();

    const previous = program.compare
        ? loadResult(path.resolve(process.cwd(), program.compare))
        : null;
    const result = await runBenchmark(input);

    printResult(result, previous);

    if (program.save) {
        saveResult(path.resolve(process.cwd(), program.save), result);
    }
}

function saveResult(filePath: string, result: BenchmarkResult) {
    const content = JSON.stringify(result, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
}

function loadResult(filePath: string): ?BenchmarkResult {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }

        throw error;
    }

}
