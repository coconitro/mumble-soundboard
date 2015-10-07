var lame = require('lame');
var mumble = require('mumble');
var fs = require('fs');
var path = require('path');

var audiotypes = ['.mp3', '.wav'];
var playing = false;
var ready = false;
var client;

exports.init = function (bot) {
  mumble.connect(process.env.MUMBLE_URL, function(err, c) {
    if (err) { 
      throw new Error(err); 
    }
    var sessions = {};
    client = c;
    client.authenticate(process.env.MUMBLE_NAME, process.env.MUMBLE_PASS);
    client.on('initialized', function() {
      ready = true;
    });

    client.on('userState', function (state) {
      sessions[state.session] = state;
    });

    client.on('textMessage', function (data) {
      if(data.message.substr(0, 1) !== '/') {
        return;
      }
      var cmds = data.message.split(' ');
      var cmd = cmds.splice(0, 1)[0];
      bot(cmd, cmds);
    });

    client.on('disconnect', function() {
      console.log('Error: Disconnected from mumble');
      process.exit(1);
    });
  });
};

exports.message = function(msg) {
  client.user.channel.sendMessage(msg);
};

exports.audioFiles = function(cb) {
  fs.readdir(process.env.AUDIO_DIR || './', function(err, files) {
    if (err) {
      return cb(err);
    }
    files = files.filter(function(file) {
      if (audiotypes.indexOf(path.extname(file)) > -1) {
        return true;
      }
    });
    files = files.map(function(file) {
      return file.split('.')[0];
    });
    cb(null, files);
  });
};

exports.playFile = function (file) {
  if (playing) {
    console.log('Warning: Already playing.');
    return false;
  }
  if (!ready) {
    console.log('Warning: Trying to play too soon. Mumble connection is not ready yet.');
    return false;
  }
  var path = process.env.AUDIO_DIR || './';
  var decoder = new lame.Decoder();
  decoder.on('format', function(format) {
    playing = true;
    stream.pipe(client.inputStream({
      channels: format.channels,
      sampleRate: format.sampleRate,
      gain: 0.2
    }));
  });

  var filestream = fs.createReadStream(path+'/'+file+'.mp3');
  filestream.on('error', function(err) {
    console.error('Error: Unable to open file '+path+'/'+file+'.mp3');
  });

  var stream = filestream.pipe(decoder);
  stream.on('end', function() {
    playing = false;
  });

  return true;
};
