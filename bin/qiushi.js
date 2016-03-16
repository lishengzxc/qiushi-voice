#!/usr/bin/env node

var rp = require('request-promise');
var promise = require('bluebird');
var co = require('co');
var cheerio = require('cheerio');
var spawn = require('child_process').spawn;

var qiushi = [];

var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
    'Host': 'www.qiushibaike.com'
}

function grab(page) {
    return new Promise(function(ok, err) {
        co(function*() {
            var content = yield rp({
                method: 'GET',
                uri: 'http://www.qiushibaike.com/hot/page/' + page + '/?s=4860038',
                headers: headers
            });
            $ = cheerio.load(content);
            var length = $('div .content').length;
            $('div .content').each(function(n, v) {
                var text = $(v).text().trim();
                var lines = text.split('\n');
                var item = [];
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (line.length > 0) {
                        item.push(line);
                    }
                }
                qiushi.push(item);

                if (n == length - 1) {

                    ok();
                }
            });
        });
    });

}

function say(text) {
    console.log(text);
    return new Promise(function(resloved, rejected) {
        var free = spawn('say', [text]);
        free.on('exit', function(code, signal) {
            resloved();
        });
    });
}

var main = function() {

    co(function*() {
        while (true) {
            qiushi = [];
            for (var page = 1; page <= 35; page++) {
                yield grab(page);
            }
            for (var i = 0; i < qiushi.length; i++) {
                var item = qiushi[i];
                for (var j = 0; j < item.length; j++) {
                    yield say(item[j]);
                }
                console.log('\n================================\n');
            }
        }
    });
};

main();