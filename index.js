'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');

var port = (process.env.PORT || 10084);
var securePort = (process.env.SECURE_PORT || 10048);
var app = express();


// Bypassing 405 status put by swagger when no request handler is defined
app.options("/*", (req, res, next) => {
  return res.sendStatus(200);
});

app.enable('trust proxy');
app.use(bodyParser.json({
  limit: '50mb'
}));

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Start the server
  https.createServer({
    key: fs.readFileSync('certs/privkey.pem'),
    cert: fs.readFileSync('certs/cert.pem')
  }, app).listen(securePort, function () {
    console.log('Your module is listening on port %d (https://localhost:%d)', securePort, securePort);
    console.log('Swagger-ui is available on https://localhost:%d/docs', securePort);
  });

  http.createServer(app).listen(port, function () {
    console.log('Your module is listening on port %d (http://localhost:%d)', port, port);
  });
});