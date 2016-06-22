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
  fs.readdir(process.env.AUDIO_DIR || '/audio/', function(err, files) {
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
  var mp3 = '';
  var mstream;

  decoder.on('format', function(format) {
    mstream = client.inputStream({
      channels: format.channels,
      sampleRate: format.sampleRate,
      gain: 0.5
    });

    mstream.on('finish', function() {
      playing = false;
    });
  });
  decoder.on('data', function(data) {
    if (!mp3) {
      return (mp3 = data);
    }
    mp3 = Buffer.concat([mp3, data]);      
  });
  decoder.on('finish', function(err) {
    if (!mstream) {
      console.log('Unable to play file ' + path+'/'+file+'.mp3');      
      return;
    }
    playing = true;
    mstream.end(mp3);
  });

  fs.readFile(path+'/'+file+'.mp3', function(err, data) {
    if (err) {
      console.log('Unable to load file ' + path+'/'+file+'.mp3');
      return;
    }
    decoder.end(data);
  });

  return true;
};
