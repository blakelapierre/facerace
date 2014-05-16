var fs = require('fs'),
    crypto = require('crypto'),
    path = require('path'),
    multiparty = require('multiparty');

module.exports = function(router, config) {
  var tempCount = 0;

  var images = path.join(config.distRoot, 'images');

  try {fs.mkdirSync(images);} catch(e) {}

  router.post('/images', function(req, res) {
    // We should probably roll our own version of this
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
      var file = files.file[0];

      var hash = crypto.createHash('sha1');

      var tempFile = path.join(images, tempCount.toString());

      var read = fs.createReadStream(file.path),
          write = fs.createWriteStream(tempFile);

      read.on('data', function(data) {
        hash.update(data);
        write.write(data);
      });

      read.on('end', function() {
        var digest = hash.digest('hex');

        write.end();

        fs.rename(tempFile, path.join(images, digest));

        res.json({id: digest});
      });

      tempCount++;
      // stream.pipe(hash);
    });
  });  
};