/* @flow */
import type { SuiteSpec, SuiteResult } from '../suite';
import type { ScenarioSpec, ScenarioResult } from '../scenario';

class Reporter {
    onStart() {}

    onDone() {}

    onSuiteStart(suite: { index: number, total: number, suite: SuiteSpec }) {}

    onSuiteEnd(suite: {
        index: number,
        total: number,
        suite: SuiteSpec,
        result: SuiteResult,
        previous: ?SuiteResult
    }) {}

    onScenarioStart(scenario: {
        index: number,
        total: number,
        suite: SuiteSpec,
        scenario: ScenarioSpec
    }) {}

    onScenarioEnd(scenario: {
        index: number,
        total: number,
        suite: SuiteSpec,
        scenario: ScenarioSpec,
        result: ScenarioResult,
        previous: ?ScenarioResult
    }) {}
}

export default Reporter;
