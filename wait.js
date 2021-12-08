let wait = async function (dsv_user, dsv_password, dsv_path) {

  const core = require('@actions/core');
  const got = require("got");
  const { createWriteStream } = require("fs");
  const stream = require("stream");
  const { promisify } = require("util");
  const pipeline = promisify(stream.pipeline);

  const url = "https://dsv.thycotic.com/downloads/cli/1.28.0/dsv-linux-x64";
  const fileName = "dsv";

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
      exec(`dsv secret read "${dsv_path}" -u "${dsv_user}" -p "${dsv_password}" -f .data`, (error, stdout, stderr) => {
        if (error) {
            core.error(error.message);
            return;
        }
        if (stderr) {
            core.error(stderr);
            return;
        }
        core.info(stdout);
      });
    } catch (error) {
      console.error(error.message);
    }
  })();
};

module.exports = wait;
