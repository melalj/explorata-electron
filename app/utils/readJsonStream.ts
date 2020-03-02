import fs from 'fs';
import JSONStream from 'jsonstream';

export default function readJsonStream(filepath, jsonpath, encoding = 'utf-8') {
  const transformStream = JSONStream.parse(jsonpath);
  const inputStream = fs.createReadStream(filepath, encoding);

  return new Promise((resolve, reject) => {
    const output = [];
    inputStream
      .pipe(transformStream)
      .on('data', data => {
        output.push(data);
      })
      .on('error', error => {
        reject(error);
      })
      .on('end', function handleEnd() {
        resolve(output);
      });
  });
}
