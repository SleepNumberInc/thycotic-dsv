const core = require('@actions/core');
const wait = require('./wait');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const dsv_user = core.getInput('dsv_user');

    const dsv_password = core.getInput('dsv_password');
    core.setSecret(dsv_password);

    const dsv_path = core.getInput('dsv_path');

    core.info(`Fetching secrets from ${dsv_path} ...`);

    await wait(dsv_user, dsv_password, dsv_path);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
