import cluster from 'cluster';
import Reporter from './Reporter.js';
/*
 * Reporter to send the infos to a background spawn process.
 */

class BackgroundReporter extends Reporter {
    // TODO add type
    constructor() {
        super();
        this.worker = cluster.fork();
    }

    send(message) {
        this.worker.send(message);
    }

    onStart() {
        this.send({
            type: 'onStart'
        });
    }

    onDone() {
        this.send({
            type: 'onDone'
        });
    }

    onSuiteStart(suite) {
        this.send({
            type: 'onSuiteStart',
            suite
        });
    }

    onSuiteEnd(suite) {
        this.send({
            type: 'onSuiteEnd',
            suite
        });
    }

    onScenarioStart(scenario) {
        this.send({
            type: 'onScenarioStart',
            scenario
        });
    }

    onScenarioEnd(scenario) {
        this.send({
            type: 'onScenarioEnd',
            scenario
        });
    }
}

export default BackgroundReporter;
