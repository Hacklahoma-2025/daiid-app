const fs = require('fs');
const mime = require('mime-types');
require('dotenv').config({ path: '../.env' });

async function downloadFileByCid(cid) {
  const fetch = (await import('node-fetch')).default;
  const gateway = process.env.IPFS_GATEWAY;
  const url = `${gateway}/ipfs/${cid}`;

  return fetch(url)
    .then(response => {
      // Get the Content-Type header to determine the file extension
      const contentType = response.headers.get('content-type');
      const ext = mime.extension(contentType) ? `.${mime.extension(contentType)}` : '.bin';
      
      // Create a file name based on the mime type
      const fileName = `retrieved_file${ext}`;
      const dest = fs.createWriteStream(fileName);
      
      // Use response.body directly if it supports pipe, otherwise convert the WHATWG stream
      const streamToPipe = typeof response.body.pipe === 'function'
        ? response.body
        : require('stream').Readable.fromWeb(response.body);
      
      streamToPipe.pipe(dest);
      
      return new Promise((resolve, reject) => {
        streamToPipe.on('end', () => {
          console.log('File downloaded as', fileName);
          resolve(fileName);
        });
        streamToPipe.on('error', (err) => {
          console.error('Error downloading file:', err);
          reject(err);
        });
      });
    });
}