var express = require('express');
var app = express();
var bot = require('./bot');
var path = require('path');
var multer  = require('multer');
var upload = multer({ dest: '/tmp' });
var fs = require('fs');
var path = require('path');

app.use('/', express.static(path.normalize(__dirname + '/../static')));

app.get('/api/sounds', function (req, res) {
  bot.audioFiles(function(err, files) {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(files);
  });
});

app.get('/api/sounds/:id', function (req, res) {
  bot.playFile(req.params.id);
  res.json('success');
});

app.post('/api/sounds', upload.single('soundfile'), function (req, res) {
  var basepath = process.env.AUDIO_DIR || './';
  var file = req.body.soundname + path.extname(req.file.originalname);

  var read = fs.createReadStream(req.file.path);
  var write = fs.createWriteStream(basepath + '/' + file);
  
  read.pipe(write)
  .on('end', function() {
    res.json(file);
  })
  .on('error', function(err) {
    res.status(500).json(err);
    throw err;
  });
});

app.listen(3000);