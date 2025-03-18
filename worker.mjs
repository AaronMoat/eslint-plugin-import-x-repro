import { inspect } from "node:util";
import { Worker, parentPort, workerData } from "node:worker_threads";

/**
 * Executes a script at `filepath` in a Node.js worker thread.
 */
export const execWorkerThread = async (filepath, input) => {
  let output;
  let messageReceived = false;

  return new Promise((resolve, reject) =>
    new Worker(filepath, {
      workerData: input,
    })
      .on("error", reject)
      .on("exit", (code) =>
        messageReceived
          ? resolve(output)
          : reject(
              new Error(
                code
                  ? `Worker thread failed with exit code ${code}`
                  : "Worker thread exited without posting a message"
              )
            )
      )
      .on("message", (message) => {
        // Defer promise resolution to `exit` so stdio can settle.
        output = message;
        messageReceived = true;
      })
      .on("messageerror", (err) => reject(err))
  );
};

export const postWorkerOutput = (fn) => {
  const port = parentPort;

  if (!port) {
    console.error(
      "`postWorkerOutput` called outside of a worker thread context"
    );

    process.exit(1);
  }

  fn(workerData)
    .then((output) => port.postMessage(output))
    .catch((err) => {
      console.error(inspect(err));

      process.exit(1);
    });
};
