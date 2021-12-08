let wait = async function (dsv_tenant, dsv_user, dsv_password, dsv_path) {

  const core = require('@actions/core');
  const got = require('got');
  const { createWriteStream } = require('fs');
  const stream = require('stream');
  const { promisify } = require('util');
  const pipeline = promisify(stream.pipeline);

  const url = 'https://dsv.thycotic.com/downloads/cli/1.28.0/dsv-linux-x64';
  const fileName = 'dsv';

  const downloadStream = got.stream(url);
  const fileWriterStream = createWriteStream(fileName);

  downloadStream.on('downloadProgress', ({ transferred, total, percent }) => {
    const percentage = Math.round(percent * 100);
    core.debug(`progress: ${transferred}/${total} (${percentage}%)`);
  });

  (async () => {
    try {
      await pipeline(downloadStream, fileWriterStream);
      core.debug(`File downloaded to ${fileName}`);
      const { exec } = require("child_process");
      exec(`${fileName} secret read -t "${dsv_tenant}" "${dsv_path}" -u "${dsv_user}" -p "${dsv_password}" -f .data`, (error, stdout, stderr) => {
        if (error) {
          core.error(error.message);
          return;
        }
        if (stderr) {
          core.error(stderr);
          return;
        }
        core.info(stdout);

        // Parse JSON payload from the dsv cli output
        const secrets = JSON.parse(stdout);

        // Mark string values as secret and obfuscate in console if displayed
        // Set action outputs
        for (var attributeName in secrets) {
          core.setSecret(secrets[attributeName])

          core.setOutput(attributeName, secrets[attributeName])
        }
      });
    } catch (error) {
      core.error(error.message);
    }
  })();
};

module.exports = wait;
