const net = require('net');
if (process.argv.length === 2) {
  process.stdout
    .write(`This file sends out http requests to a given destination and returns the response body. 
  You must provide the destination in the form of: 'node client.js [options] [destination]
  where destination is the url and options can be one of the following:
  Change the request method: -X [request method],
  Header only: -I,
  Set port to use: -P [port]  
  `);
} else {
  const myArgs = process.argv.slice(2);
  const url = myArgs.pop();
  const indexOfURI = url.indexOf('/');

  let uri = url.slice(indexOfURI);
  let host = url.slice(0, indexOfURI);
  let port = 80;
  let requestMethod = 'GET';
  let headerOnly = false;

  if (indexOfURI === -1) {
    uri = '/';
    host = url.slice(0);
  }

  if (host === 'localhost:8080' || host === 'localhost') {
    host = 'localhost';
    port = 8080;
  }

  for (let i = 0; i < myArgs.length; i++) {
    if (myArgs[i] === '-X') {
      requestMethod = myArgs[i + 1];
    } else if (myArgs[i] === '-I') {
      headerOnly = true;
    } else if (myArgs[i] === '-P') {
      port = myArgs[i + 1];
    }
  }

  const request = `${requestMethod} ${uri} HTTP/1.1
Host: ${host} 
Date: ${new Date().toUTCString()} 
User-Agent: Gene's Client 

`;

  const responseHeaderObject = {};

  const client = new net.Socket();

  client.connect(
    port,
    host,
    () => {
      client.setEncoding('utf8');
      client.write(request);
    }
  );

  client.on('error', err => {
    throw err;
  });

  client.on('data', data => {
    let indexOfEmptyLine = null;

    if (host === 'localhost') {
      indexOfEmptyLine = data.indexOf('\n\n');
    } else {
      indexOfEmptyLine = data.indexOf('\n\r\n');
    }

    const indexAfterRequestLine = data.indexOf('\n');
    const headerPairsString = data.slice(
      indexAfterRequestLine + 1,
      indexOfEmptyLine
    );

    let joinedHeaderPairsArray = null;

    if (host === 'localhost') {
      joinedHeaderPairsArray = headerPairsString.split('\n');
    } else {
      joinedHeaderPairsArray = headerPairsString.split('\r\n');
    }

    let splitHeaderPairsArray = [];

    for (let i = 0; i < joinedHeaderPairsArray.length; i++) {
      let temp = joinedHeaderPairsArray[i].split(': ');
      temp.forEach(element => splitHeaderPairsArray.push(element));
    }

    for (let i = 0; i < splitHeaderPairsArray.length; i += 2) {
      responseHeaderObject[splitHeaderPairsArray[i]] =
        splitHeaderPairsArray[i + 1];
    }

    const header = data.slice(0, indexOfEmptyLine);
    const body = data.slice(indexOfEmptyLine + 1);

    if (headerOnly) {
      process.stdout.write(header);
    } else {
      process.stdout.write(body);
    }
    client.end();
  });

  client.on('end', () => {
    process.stdout.write('connection ended');
  });
}
