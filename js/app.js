$(function () {
  var
  fileNamePrefix = 'eval-on-fxos/';

  reloadFiles();

  $('#new-file').click(function () {
    openFile('');
  });

  $('#editor-back').click(function () {
    reloadFiles();
    $('#editor').removeClass('active');
    $('#main').addClass('active');
  });

  $('#file-name').change(function () {
    $('#bind-file-name').text($('#file-name').val());
  });

  $('#result-back').click(function () {
    $('#result').removeClass('active');
  });

  $('#save-file').click(function () {
    var
    sd = navigator.getDeviceStorage('sdcard'), req,
    fileName = $('#file-name').val(),
    content = $('#content').val();

    if (!sd) {
      alert('error: cannot a get sdcard storage');
      return;
    }

    if (!fileName) {
      alert('error: file name is empty');
      return;
    }

    req = sd.delete(fileNamePrefix + fileName);
    req.onsuccess = req.onerror = next();
    
    function next() {
      console.log(this);

      var
      req = sd.addNamed(new Blob([content]), fileNamePrefix + fileName);
      req.onerror = function () {
        alert('error: cannot write a file');
        console.log(this);
      };
    }
  });

  $('#eval-file').click(function () {
    var
    fileName = $('#file-name').val().split('.'),
    l = fileName[fileName.length - 1],
    s = $('#content').val();

    if (fileName.length <= 1) {
      l = '';
    }

    console.log(l, s);

    $.ajax({
      url: 'http://api.dan.co.jp/lleval.cgi',
      type: 'GET',
      crossDomain: true,
      data: {
        s: s,
        l: l,
      },
      dataType: 'json',
    })
      .done(function (data) {
        console.log(data);

        $('#stdout').text(data.stdout);
        $('#stderr').text(data.stderr);
        $('#result').addClass('active');
      })
      .fail(function (err) {
        console.log(err);
      });
  });

  function reloadFiles() {
    var
    elFiles = $('#files').empty(),
    sd = navigator.getDeviceStorage('sdcard'), cur;
    if (!sd) {
      alert('error: cannot a get sdcard storage');
      return;
    }

    cur = sd.enumerateEditable(fileNamePrefix.slice(0, -1));
    cur.onsuccess = function () {
      if (this.result) {
        $('<li>')
          .text(this.result.name.slice(fileNamePrefix.length))
          .click(openFile.bind(null, this.result.name))
          .appendTo(elFiles);
        console.log(this.result);
        this.continue();
      }
    };
  }

  function openFile(fileName) {
    var
    content = '', sd, req;

    if (fileName) {
      sd = navigator.getDeviceStorage('sdcard');
      if (!sd) {
        alert('error: cannot a get sdcard storage');
        return;
      }

      req = sd.get(fileName);
      req.onsuccess = function () {
        var
        file = this.result,
        fr = new FileReader();

        fr.onload = function (e) {
          next(e.target.result);
        };

        fr.readAsText(file);

        console.log(file);
      };
      req.onerror = function () {
        console.log(this);
        alert('error: cannot open a file');
      };
    } else {
      next('');
    }

    function next(content) {
      $('#main').removeClass('active');
      $('#editor').addClass('active');
      $('#bind-file-name').text(fileName.slice(fileNamePrefix.length));
      $('#file-name').val(fileName.slice(fileNamePrefix.length));
      $('#content').val(content);
    }
  }
});
