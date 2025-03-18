import path from "path";

import { loadESLint } from "eslint";

const symbolForResult = (result) => {
  if (result.errorCount) {
    return "○";
  }

  return result.warningCount ? "◍" : "○";
};

export const runESLint = async (mode, overrideConfigFile) => {
  console.log("Initialising ESLint...");

  const cwd = process.cwd();

  const ESLint = await loadESLint({ useFlatConfig: true });
  const engine = new ESLint({
    cache: true,
    fix: mode === "format",
    overrideConfigFile,
    overrideConfig: {
      linterOptions: {
        reportUnusedDisableDirectives: true,
      },
    },
  });

  console.log("Processing files...");

  const [formatter, { type, results }] = await Promise.all([
    engine.loadFormatter(),
    lintFiles(engine),
  ]);

  if (type === "no-config") {
    console.log(
      "skuba could not find an eslint config file. Do you need to run format or configure?"
    );
    return { ok: false, fixable: false, errors: [], warnings: [], output: "" };
  }

  const errors = [];
  const warnings = [];
  let fixable = false;

  for (const result of results) {
    const relativePath = path.relative(cwd, result.filePath);
    if (result.fixableErrorCount + result.fixableWarningCount) {
      fixable = true;
    }

    if (result.errorCount) {
      errors.push({
        filePath: relativePath,
        messages: result.messages,
      });
    }

    if (result.warningCount) {
      warnings.push({
        filePath: relativePath,
        messages: result.messages,
      });
    }

    console.log(symbolForResult(result), relativePath);
  }

  const ok = errors.length === 0;

  await ESLint.outputFixes(results);

  const output = await formatter.format(
    results,
    engine.getRulesMetaForResults(results)
  );

  if (output) {
    console.log(output);
  }

  return { errors, fixable, ok, output, warnings };
};

const lintFiles = async (engine) => {
  try {
    const result = await engine.lintFiles([]);
    return { type: "results", results: result };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Could not find config file."
    ) {
      return { type: "no-config", results: undefined };
    }
    throw error;
  }
};
