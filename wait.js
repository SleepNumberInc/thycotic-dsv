let wait = async function () {
  
  // const https = require('https'); // or 'https' for https:// URLs

  
  // const file = fs.createWriteStream("dsv");
  // const request =  https.get("https://dsv.thycotic.com/downloads/cli/1.28.0/dsv-linux-x64", function(response) {
  //   response.pipe(file);
  // });


  // const stream = require('stream');
  // const { promisify } = require('util');
  const fs = require('fs');
  // const got = require('got');
  
  // const pipeline = promisify(stream.pipeline);
  
  // async function downloadImage(url, name) {
  //   await pipeline(
  //     got.stream(url),
  //     fs.createWriteStream(name)
  //   );
  // }

  //downloadImage('https://dsv.thycotic.com/downloads/cli/1.28.0/dsv-linux-x64', 'dsv');


  // Downloads file but isn't blocking so we can't wait for the file download
  const https = require('https');
  const url = 'https://dsv.thycotic.com/downloads/cli/1.28.0/dsv-linux-x64'; // link to file you want to download
  const path = 'dsv' // where to save a file
  const request2 = https.get(url, function(response) {
    if (response.statusCode < 400) {
      var file = fs.createWriteStream(path);
      response.pipe(file);

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
    }
    request2.setTimeout(60000, function() { // if after 60s file not downloaded, we abort a request
      request2.abort();
    });
  });


  

};

module.exports = wait;
