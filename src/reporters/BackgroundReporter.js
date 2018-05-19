/* @flow */
import cluster from 'cluster';
import Reporter from './Reporter';

/*
 * Reporter to send the infos to a background spawn process.
 */
class BackgroundReporter extends Reporter {
    worker: cluster$Worker;

    constructor() {
        super();

        this.worker = cluster.fork();
    }

    send(message: Object) {
        this.worker.send(message);
    }

    onStart() {
        this.send({ type: 'onStart' });
    }

    onDone() {
        this.send({ type: 'onDone' });
    }

    onSuiteStart(suite: *) {
        this.send({ type: 'onSuiteStart', suite });
    }

    onSuiteEnd(suite: *) {
        this.send({ type: 'onSuiteEnd', suite });
    }

    onScenarioStart(scenario: *) {
        this.send({ type: 'onScenarioStart', scenario });
    }

    onScenarioEnd(scenario: *) {
        this.send({ type: 'onScenarioEnd', scenario });
    }
}

export default BackgroundReporter;
