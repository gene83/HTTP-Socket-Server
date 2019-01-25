const net = require('net');
const error404 = require('./error404');
const helium = require('./helium');
const hydrogen = require('./hydrogen');
const indexHTML = require('./indexHTML');
const stylesCSS = require('./stylesCSS');

const responseHTML = `HTTP/1.1 200 OK
Date: ${new Date().toUTCString()}
Server: Gene's server
Content-Type: text/html; charset=utf-8

`;

const response404 = `HTTP/1.1 404 Not Found
Date: ${new Date().toUTCString()}
Server: Gene's server
Content-Type: text/html; charset=utf-8

`;

const responseCSS = `HTTP/1.1 200 OK
Date: ${new Date().toUTCString()}
Server: Gene's server
Content-Type: text/css; charset=utf-8

`;

// this creates a server
const server = net
  .createServer(socket => {
    socket.setEncoding('utf8');
    socket.on('data', data => {
      // this is the request

      const indexOfSlash = data.indexOf('/');
      const indexOfHTTP = data.indexOf('HTTP');

      if (data.slice(indexOfSlash, indexOfHTTP) === '/index.html ') {
        socket.end(responseHTML + indexHTML.indexHTML);
      } else if (data.slice(indexOfSlash, indexOfHTTP) === '/hydrogen.html ') {
        socket.end(responseHTML + hydrogen.hydrogen);
      } else if (data.slice(indexOfSlash, indexOfHTTP) === '/helium.html ') {
        socket.end(responseHTML + helium.helium);
      } else if (data.slice(indexOfSlash, indexOfHTTP) === '/css/styles.css ') {
        socket.end(responseCSS + stylesCSS.stylesCSS);
      } else {
        socket.end(response404.response404 + error404.error404);
      }
    });
  })

  // handle errors on the server
  .on('error', err => {
    throw err;
  });

// this starts the server
server.listen(8080, () => {
  console.log('Server is UP');
});
