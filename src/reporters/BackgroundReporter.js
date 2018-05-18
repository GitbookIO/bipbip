/* @flow */
import cluster from 'cluster';
import Reporter from './Reporter';

/*
 * Reporter to send the infos to a background spawn process.
 */
class BackgroundReporter extends Reporter {
    constructor() {
        super();

        this.worker = cluster.fork();
    }

    send(message: *) {
        this.worker.send(message);
    }

    onStart() {
        this.send({ type: 'onStart' });
    }

    onDone() {
        this.send({ type: 'onDone' });
    }

    onSuiteStart(suite: { index: number, total: number, suite: SuiteSpec }) {
        this.send({ type: 'onSuiteStart', suite });
    }

    onSuiteEnd(suite: {
        index: number,
        total: number,
        suite: SuiteSpec,
        result: SuiteResult,
        previous: ?SuiteResult
    }) {
        this.send({ type: 'onSuiteEnd', suite });
    }

    onScenarioStart(scenario: {
        index: number,
        total: number,
        suite: SuiteSpec,
        scenario: ScenarioSpec
    }) {
        this.send({ type: 'onScenarioStart', scenario });
    }

    onScenarioEnd(scenario: {
        index: number,
        total: number,
        suite: SuiteSpec,
        scenario: ScenarioSpec,
        result: ScenarioResult,
        previous: ?ScenarioResult
    }) {
        this.send({ type: 'onScenarioEnd', scenario });
    }
}

export default BackgroundReporter;
