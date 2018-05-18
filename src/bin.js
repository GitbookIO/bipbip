#! /usr/bin/env node
/* @flow */
/* eslint-disable global-require, import/no-dynamic-require */
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import program from 'commander';

import { runBenchmark, printResult, type BenchmarkResult } from './benchmark';
import { getBenchmark, suite, scenario } from './globals';
import packageJSON from '../package.json';

const DEFAULT_FILES = ['**/__benchmarks__/*.js'];
const IGNORED_FILES = ['!node_modules'];

// Define global variables used by scenarios
global.suite = suite;
global.scenario = scenario;

// Define command line spec
program
    .version(packageJSON.version, '-v, --version')
    .usage('[options] <file...>')
    .option(
        '-d, --duration [ms]',
        'maximum duration per scenario (default is 5sec)'
    )
    .option(
        '-e, --executions [count]',
        'maximum executions per scenario (default is 1M)'
    )
    .option('-s, --save [file]', 'save result to a JSON file')
    .option('-c, --compare [file]', 'compare result with previous results')
    .parse(process.argv);

main().catch(error => {
    process.stderr.write(`${error.message || error}\n`);
    process.exit(1);
});

async function main() {
    const inputFiles = program.args.length == 0 ? DEFAULT_FILES : program.args;
    const paths = await globby([...inputFiles, ...IGNORED_FILES]);

    paths.forEach(filePath => {
        // $FlowFixMe: flow doesn't accept dynamic require
        require(path.resolve(process.cwd(), filePath));
    });

    // Get all suites to run
    const input = getBenchmark();

    process.stdout.write(`${input.suites.length} suites found in ${paths.length} files:\n\n`);

    // Setup options for scenarios
    const options = {
        duration: program.duration || 5000,
        executions: program.executions || 1000000
    };

    const previous = program.compare
        ? loadResult(path.resolve(process.cwd(), program.compare))
        : null;
    const result = await runBenchmark(input, options);

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
