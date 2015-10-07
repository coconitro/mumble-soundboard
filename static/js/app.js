var soundPollTime = 3000;

$(function ready() {
  $('ul.nav li a').click(switchUi);
  $('#main').load('sounds.html', function() {
    updateSoundList();
  });
});

function switchUi() {
  var parts = this.href.split('/');
  var page = parts[parts.length - 1].substr(1);
  $('#main').load(page+'.html', function() {
    $($(this).parent().parent().children()).removeClass('active');
    $(this).parent().addClass('active');
    $('form#upload').submit(handleUpload);    
  }.bind(this));
}

function updateSoundList() {
  $.getJSON('/api/sounds', function(sounds) {
    $('#sounds').empty();
    for (var i = 0; i < sounds.length; i++) {
      $('#sounds')
      .append($('<div>', {
        'class': 'col-md-4'
      }).append($('<button>', {
        type: 'button',
        'class': 'btn btn-primary btn-lg btn-block playSound'
      }).text(sounds[i])));
    }
    $('.playSound').click(playSound);
    setTimeout(updateSoundList, soundPollTime);
  });
}

function playSound() {
  $.getJSON('/api/sounds/'+$(this).text());
}

function handleUpload(e) {
  e.preventDefault();
  var form = new FormData($(this)[0]);
  $.ajax({
    url: $(this).attr('action'),
    type: $(this).attr('method'),
    enctype: 'multipart/form-data',
    success: function (res) {
      console.log(res);
    },
     xhr: function() {
      var xhr = $.ajaxSettings.xhr();
      if(xhr.upload) {
        xhr.upload.addEventListener('progress',progressHandler, false);
      }
      return xhr;
    },    
    data: form,
    cache: false,
    contentType: false,
    processData: false
  });
}

function progressHandler(e) {
  if(e.lengthComputable){
    console.log({value:e.loaded,max:e.total});
  }
}