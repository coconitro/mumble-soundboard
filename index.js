var server = require('./lib/server');

var bot = require('./lib/bot');
bot.init(command);

function command(cmd, opts) {
  console.log('Processing command: '+cmd+' with options: '+opts);
  switch (cmd) {
    case '/sb':
      bot.playFile(opts[0]);
      break;
    case '/list':
      listAudioFiles();
      break;
    default:
      console.log('Bad command');
  }
}

function listAudioFiles() {
  bot.audioFiles(function(err, files) {
    if (err) {
      throw err;
    }
    bot.message('Avaliable sounds: '+files.join(', '));    
  });
}
