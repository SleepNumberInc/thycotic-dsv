let wait = async function () {

  const core = require('@actions/core');
  const got = require("got");
  const { createWriteStream } = require("fs");
  const stream = require("stream");
  const { promisify } = require("util");
  const pipeline = promisify(stream.pipeline);

  const url = "https://dsv.thycotic.com/downloads/cli/1.28.0/dsv-linux-x64";
  const fileName = "bin/dsv";

  const downloadStream = got.stream(url);
  const fileWriterStream = createWriteStream(fileName);

  downloadStream.on("downloadProgress", ({ transferred, total, percent }) => {
    const percentage = Math.round(percent * 100);
    core.debug(`progress: ${transferred}/${total} (${percentage}%)`);
  });

  (async () => {
    try {
      await pipeline(downloadStream, fileWriterStream);
      core.debug(`File downloaded to ${fileName}`);
      const { exec } = require("child_process");
      exec("dsv", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
      });
    } catch (error) {
      console.error(`Something went wrong. ${error.message}`);
    }
  })();
};

module.exports = wait;
