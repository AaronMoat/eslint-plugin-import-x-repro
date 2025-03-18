import { isMainThread } from "worker_threads";

import { execWorkerThread, postWorkerOutput } from "./worker.mjs";
import { runESLint } from "./runESLint.mjs";

const runESLintInCurrentThread = ({ eslintConfigFile }) =>
  runESLint("lint", eslintConfigFile);

const runESLintInWorkerThread = (input) =>
  execWorkerThread("./lint.mjs", input);

if (isMainThread) {
  runESLintInWorkerThread({
    debug: true,
    eslintConfigFile: "eslint.config.mjs",
  });
} else {
  postWorkerOutput(runESLintInCurrentThread);
}
