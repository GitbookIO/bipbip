import cluster from 'cluster';
import path from 'path';
import { globby } from 'globby';
import { program as commanderProgram } from 'commander';
import { ConsoleReporter, BackgroundReporter } from './reporters/index.js';
import { runBenchmark } from './benchmark.js';
import { getBenchmark, suite, scenario } from './globals.js';
import { saveResult, loadResult } from './file-report.js';
//import packageJSON from '../package.json';

const DEFAULT_FILES = ['**/__benchmarks__/*.js'];
const IGNORED_FILES = ['**/node_modules'];

const debug = false;

debug && console.log("bipbip");

if (cluster.isMaster) {

    debug && console.log("bipbip: cluster.isMaster == true");

    // Define global variables used by scenarios
    global.suite = suite;
    global.scenario = scenario;

    if (debug) {
      global.suite = function suiteDebugWrapper(name, body) {
        console.log(`bipbip: suite: ${name}`);
        return suite.apply(null, [name, body]);
      }

      global.scenario = function scenarioDebugWrapper(name, body) {
        console.log(`bipbip: scenario: ${name}`);
        return scenario.apply(null, [name, body]);
      }
    }

    debug && console.log(`bipbip: parse argv: ${JSON.stringify(process.argv)}`);

    // Define command line spec
    commanderProgram
        //.version(packageJSON.version, '-v, --version')
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

    debug && console.log(`bipbip: calling main`);

    main().then(
        () => {
            debug && console.log(`bipbip: main done -> exit`);
            process.exit(0);
        },
        error => {
            debug && console.log(`bipbip: main failed -> throw`);
            throw error;
        }
    );

    debug && console.log(`bipbip: calling main done`);

} else {

    debug && console.log("bipbip: cluster.isMaster == false");

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

    // start the background process as soon as possible
    // this will call cluster.fork()
    // when creating the reporter too late
    // the "cluster.isMaster == false" branch can hang forever
    const reporter = new BackgroundReporter();
    debug && console.dir({ reporter });

    const program = commanderProgram.opts();
    program.args = commanderProgram.args;
    Object.freeze(program);
    debug && console.dir(program);

    const inputFiles = (program.args && program.args.length > 0) ? program.args : DEFAULT_FILES;
    debug && console.dir({ DEFAULT_FILES });
    debug && console.dir({ inputFiles });
    const paths = await globby(inputFiles, {
        ignore: IGNORED_FILES
    });
    debug && console.dir({ paths });
    if (paths.length == 0) {
        throw new Error(`no benchmark files with pattern ${JSON.stringify(inputFiles)}`);
    }

    for (const filePath of paths) {
        debug && console.dir({ filePath, filePath_resolved: path.resolve(process.cwd(), filePath) });
        await import(path.resolve(process.cwd(), filePath));
    }

    // Get all suites to run
    const input = getBenchmark();
    const previous = program.compare
        ? await loadResult(path.resolve(process.cwd(), program.compare))
        : null;

    // Setup options for scenarios
    const options = {
        reporter,
        duration: program.duration || 5000,
        executions: program.executions || 1000000
    };
    const result = await runBenchmark(input, previous, options);

    debug && console.log('\n' + `bipbip: result done`)

    if (program.save) {
        debug && console.log('\n' + `bipbip: save ${program.save} ...`)
        await saveResult(path.resolve(process.cwd(), program.save), result);
        debug && console.log('\n' + `bipbip: save done`)
    }

    debug && console.log('\n' + `bipbip: main done`)
}
