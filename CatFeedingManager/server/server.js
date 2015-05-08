// Configuration
var config = require('./config.json');

// Modules
var express = require('express');
var url = require('url');
var path = require('path');
var fs = require('fs');
var request = require('request');
var util = require('util');
var temp = require('temp').track();
var spawn = require('child_process').spawn;

  
// ----------------------
// Error Pages
// ----------------------
send404 = function(urlPath, res) {
	sendError(404, 'Page not found at ' + urlPath, res);
}
send500 = function(error, urlPath, res) {
	sendError(500, 'Internal Server Error (' + error + ') at ' + urlPath, res);
}
sendError = function(error, text, res) {
	res.status(error);
	res.write(error + ' ' + text);
	res.end();
}

// ----------------------------------------------------------------------
// Routing - Send requests to resources
// ----------------------------------------------------------------------
var app = express();

// GET /client
// GET /client/
// GET /client/default.htm
// GET /client/default.html
// GET /client/index.htm
//   Forced redirect to the root HTML file for the app, index.html
redirectClientBase = function(req, res, next) {
	res.redirect('/client/index.html');
}
app.get("/client", redirectClientBase);
app.get("/client/", redirectClientBase);
app.get("/client/default.htm", redirectClientBase);
app.get("/client/default.html", redirectClientBase);
app.get("/client/index.htm", redirectClientBase);

// GET /client/*
//   Used to load any static client files from the /client folder
app.get("/client/*", function(req, res, next) {
	// Break down the file requested
	var urlPath = url.parse(req.url).pathname;
	var filename = path.basename(req.url);
	var ext = path.extname(filename);
	
	// Get the file and serve it
	var fullpath = path.join(__dirname, urlPath);
	if (fs.existsSync(fullpath)) {
		fs.readFile(fullpath, res, function(err, data) {
			if (err) return send500('err', urlPath, res);
			res.status(200);
			res.type(ext);
			res.send(data);
			res.end();
		});
	} else {
		send404(fullpath, res);
	}
});

// GET /heartbeat
// GET /heartbeat/
//   Simple 'I am alive' response; useful for debugging and connection status
//   verification
heartbeatRouteHandler = function(req, res, next) {
	res.status(200);
	res.type('text/plain');
	res.send('HouseholdDashboard is alive!');
	res.end();
}
app.get("/heartbeat", heartbeatRouteHandler);
app.get("/heartbeat/", heartbeatRouteHandler);
  
  
  
/*
// GET /folders
//   Get the list of output folders
app.get('/folders', 
  function(req, res) {
	res.status(200);
	res.type('text/json');
	var outObj = {};
	getSubdirectories(config.outgoingDir, function(err, results) {
	  if (err) throw err;
	  outObj.folders = results;
	  res.send(outObj);
	  res.end();
	});
  });
  
// POST /folders
//   Get the list of output folders
app.post('/folders', 
  function(req, res) {
	// TODO: Add a new folder
  }
);

// POST /pdfbuild
// Request that one or more jpgs are placed in a specific order, merged into one PDF, then OCRed
app.post('/pdfbuild',
  function(req, res) {
	res.status(200);
	res.type('text/json');
	
	// TODO: Add to database
	
	res.send(outObj);
	res.end();
  });
  
// GET /pdfbuild
// Get a list of all PDF build requests
app.post('/pdfbuild',
  function(req, res) {
	res.status(200);
	res.type('text/json');
	
	// TODO: Get Builds from DB, place in response
	var outObj = {};
	outObj.builds = [];
	
	res.send(outObj);
	res.end();
  });
  
// GET /pdfbuild/:id
// Get a status and console log for the PDF build request
app.get('/pdfbuild/:id([0-9]+)', 
  function(req, res) {
	res.status(200);
	res.type('text/json');
	
	// TODO: Get Build status from DB, place in response
	var outObj = {};
	outObj.status = [];
	
	res.send(outObj);
	res.end();
  });
  
// GET /images
//   Get the list of images ready to process
app.get('/images', 
  function(req, res) {
	toastDatabase.getPoolImages(function (err, images) {
		if (err) return send500(err, urlPath, res);
		res.status(200);
		res.type('text/json');
		
		var outObj = {};
		outObj.Images = images;
		
		res.send(outObj);
		res.end();
	});
  });
  
// GET /images/{id}
//   Get the full image based on the GUID
app.get('/images/:id(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)', 
  function(req, res) {
	var id = req.params.id;
	
	toastDatabase.getFilenameForPoolImage(function (err, filename) {
		if (err) return send500(err, urlPath, res);
		if (filename === null) return send404(id, res);
		
		var fullpath = path.join(config.poolDir, filename);
		var ext = path.extname(path.basename(imageSubPath));
		if (fs.existsSync(fullpath)) {
			fs.readFile(fullpath, res, function(err, data) {
				if (err) return send500(err, urlPath, res);
				res.status(200);
				res.type(ext);
				res.send(data);
				res.end();
			});
		} else {
			send404(fullpath, res);
		}
	});
  });

// POST /images
//   Post a new image
app.post('/images', 
  function(req, res) {
    // TODO: Save new image
  }
);
  
// DELTE /images/{id}
//   Delete new image
app.post('/images', 
  function(req, res) {
	// TODO: Delete image
  }
);

var getSubdirectories = function(inDir, done) {
  var results = [];
  fs.readdir(inDir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var testPath = list[i++];
      if (!testPath) return done(null, results);
      testPath = path.join(inDir, testPath);
      fs.stat(testPath, function(err, stat) {
        if (stat && stat.isDirectory()) {
          results.push(testPath);
          getSubdirectories(testPath, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          next();
        }
      });
    })();
  });
};


// Given a PDF Build Request in the following format, do all of the work
// {
//   "title": "Hello World",
//   "images": [
//     2,
//     1,
//     3
//   ],
//   "outputSubFolder": "Generated/Cassidy/School/10th Grade/"
// }
var processBuildRequest = function(buildReq) {
  // Make a temp folder
  tempDir = temp.mkdirSync();
  var mergePdfPath = path.join(tempDir, "merged.pdf");
  var finalPdfPath = path.join(config.outputLocation, buildReq.outputSubFolder, buildReq.title + ".pdf");
  
  // Process Each Page
  for (i = 0; i < buildReq.images.length; i++) {

    // Copy original jpg to pagenum.jpg
    var origPoolPath = path.join(config.poolLocation, getPathForPoolImage(buildReq.images[i]));
    var tempJpgPath = path.join(tempDir, i + ".jpg");
    toastCommandLine.copyFile(origPoolPath, tempJpgPath);

    // Convert to pagenum.ppm at 300 dpi
    var tempPpmPath = path.join(tempDir, i + ".ppm");
    toastCommandLine.convertToPpm(tempJpgPath, tempPpmPath, 300);

    // Call cuneiform to get HOCR text
    var tempHocrPath = path.join(tempDir, i + ".hocr");
    toastCommandLine.getOcrText(tempPpmPath, tempHocrPath);
    
    // Call HOCR2PDF to merge .ppm and .hocr into searchable PDF page
    var tempPdfPath = path.join(tempDir, i + ".pdf");
    toastCommandLine.buildOcrPdf(tempPpmPath, tempHocrPath, tempPdfPath, 300);

    // Merge each page into combined PDF
    toastCommandLine.mergePdf(tempPdfPath, mergePdfPath);
  }

  // Copy completed PDF to final destination
  copyFile(mergePdfPath, finalPdfPath);
  
// Delete Temp Folder
  temp.cleanup(function(err, stats) {
    console.log("Build cleanup error:" + err);
    console.log("Build cleanup stats:" + stats);
  });
};
*/

  
// ----------------------------------------------------------------------
// HTTP Listener
// ----------------------------------------------------------------------
var server = app.listen(config.listenPort, function() {
    console.log('Listening on port %d', server.address().port);
});

// TODO: Spin up a process or webworker-style thread to monitor the incoming area

// TODO: Spin up a worker thread to handle PDF Builds