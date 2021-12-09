let dsv = async function (dsv_tenant, dsv_user, dsv_password, dsv_path) {

  const core = require('@actions/core');
  const got = require('got');
  const { createWriteStream } = require('fs');
  const stream = require('stream');
  const { promisify } = require('util');
  const pipeline = promisify(stream.pipeline);

  // Need to update every month with each release
  const url = 'https://dsv.thycotic.com/downloads/cli/1.29.0/dsv-linux-x64';
  const fileName = 'dsv';

  // Open streams to read and write the file
  const downloadStream = got.stream(url);
  const fileWriterStream = createWriteStream(fileName);

  // Display download progress
  downloadStream.on('downloadProgress', ({ transferred, total, percent }) => {
    const percentage = Math.round(percent * 100);

    if (percentage % 10 === 0) {
      core.debug(`progress: ${transferred}/${total} (${percentage}%)`);
    }
  });

  // Create function to download DSV cli binary and write the file
  async function createFile() {
    await pipeline(downloadStream, fileWriterStream);
    core.debug(`File downloaded to ${fileName}`);
  };

  // Call function and wait for it to complete
  await createFile();

  const { exec } = require("child_process");
  // Change file permissions
  exec("chmod 777 dsv", (error, stdout, stderr) => {
    if (error) {
      core.error(error.message);
      return;
    }
    if (stderr) {
      core.error(stderr);
      return;
    }
  });

  exec("ls -l", (error, stdout, stderr) => {
    if (error) {
      core.error(error.message);
      return;
    }
    if (stderr) {
      core.error(stderr);
      return;
    }
    if (stdout) {
      core.debug(stdout);
      return;
    }
  });

  // Call dsv to read the secret with the parameters specified
  exec(`./${fileName} secret read "${dsv_path}" -t "${dsv_tenant}" -u "${dsv_user}" -p "${dsv_password}" -f .data`, (error, stdout, stderr) => {
    if (error) {
      core.error(error.message);
      return;
    }
    if (stderr) {
      core.error(stderr);
      return;
    }

    // Parse JSON payload from the dsv cli output
    const secrets = JSON.parse(stdout);

    // Mark string values as secret and obfuscate in console if displayed
    // Set action outputs
    for (var attributeName in secrets) {
      core.setSecret(secrets[attributeName])
      //core.setOutput(attributeName, secrets[attributeName])
    }

    core.setOutput('payload', JSON.stringify(secrets))
  });
};

module.exports = dsv;
