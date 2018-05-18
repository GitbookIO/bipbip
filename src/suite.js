/* @flow */
import Table from 'cli-table';
import prettyMs from 'pretty-ms';
import cliColor from 'cli-color';
import {
    runScenario,
    compareScenarioResults,
    type ScenarioInput,
    type ScenarioResult,
    type ScenarioOptions
} from './scenario';

export type SuiteInput = {
    name: string,
    scenarios: ScenarioInput[]
};

export type SuiteResult = {
    name: string,
    scenarios: ScenarioResult[]
};

/*
 * Execute a suite of scenario.
 */
async function runSuite(
    suite: SuiteInput,
    options: ScenarioOptions
): Promise<SuiteResult> {
    const scenarios = await suite.scenarios.reduce(async (prev, scenario) => {
        const result = await prev;
        return result.concat([await runScenario(scenario, options)]);
    }, []);

    return {
        name: suite.name,
        scenarios
    };
}

export { runSuite };
