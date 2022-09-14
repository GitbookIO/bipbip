/* @flow */

import cluster from 'cluster';
import path from 'path';
import globby from 'globby';
import program from 'commander';

import { ConsoleReporter, BackgroundReporter } from './reporters/index.js';
import { runBenchmark } from './benchmark.js';
import { getBenchmark, suite, scenario } from './globals.js';
import { saveResult, loadResult } from './file-report.js';
import packageJSON from '../package.json';

const DEFAULT_FILES = ['**/__benchmarks__/*.js'];
const IGNORED_FILES = ['**/node_modules'];

if (cluster.isMaster) {
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

    main().then(
        () => {
            //process.exit(0);
        },
        error => {
            throw error
        }
    );
} else {
    const reporter = new ConsoleReporter();

    process.on('message', message => {
        switch (message.type) {
            case 'onStart':
                reporter.onStart();
                break;
            case 'onDone':
                reporter.onDone();
                process.exit(0);
                break;
            case 'onSuiteStart':
                reporter.onSuiteStart(message.suite);
                break;
            case 'onSuiteEnd':
                reporter.onSuiteEnd(message.suite);
                break;
            case 'onScenarioStart':
                reporter.onScenarioStart(message.scenario);
                break;
            case 'onScenarioEnd':
                reporter.onScenarioEnd(message.scenario);
                break;
            default:
                break;
        }
    });
}

/*
 * Execute the main thread to start benchmarks.
 */
async function main() {
    const inputFiles = program.args.length == 0 ? DEFAULT_FILES : program.args;
    const paths = await globby(inputFiles, {
        ignore: IGNORED_FILES
    });

    paths.forEach(filePath => {
        await import(path.resolve(process.cwd(), filePath));
    });

    // Get all suites to run
    const input = getBenchmark();
    const previous = program.compare
        ? await loadResult(path.resolve(process.cwd(), program.compare))
        : null;

    const reporter = new BackgroundReporter();

    // Setup options for scenarios
    const options = {
        reporter,
        duration: program.duration || 5000,
        executions: program.executions || 1000000
    };

    const result = await runBenchmark(input, previous, options);

    if (program.save) {
        await saveResult(path.resolve(process.cwd(), program.save), result);
    }
}
