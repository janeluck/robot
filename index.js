var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var req = request(require('./rss')[(new Date).getDay() - 1])
var feedparser = new FeedParser(/*[options]*/);
const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'robot';
const collection = 'news'
const key = ''
// Create a new MongoClient
const client = new MongoClient(url);
req.on('error', function (error) {
  // handle any request errors
});

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream

  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  } else {
    debugger
    stream.pipe(feedparser);
  }
});
const curl = require('curl');



const getItems = function () {
  return new Promise(function (resolve, reject) {
    const items = [];
    let firstRead = true;
    feedparser.on('readable', function () {
      if(!firstRead) return;
      firstRead = false;
      // This is where the action is!
      var stream = this; // `this` is `feedparser`, which is a stream
      var meta = stream.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
      var item, last;
      item = stream.read();
      //console.log(item);
      items.push({
        title: item['title'],
        link: item['link'],
        description: item['description'],
        pubdate: item['pubdate'],
      });


    }).on('finish', function () {
      resolve({result: true, data: items})
    }).on('error', function (err) {
      resolve({result: false, err: err})
    });
  })
}

// Use connect method to connect to the Server
client.connect(function (err) {
  getItems().then(function (data){
    if(data.result){
      const db = client.db(dbName);
      db.collection(collection).insertMany(data.data, function (err, res) {
        if (err) throw err;
        console.log(`${data.data.length}条文档插入成功`);
       const ul = data.data[0].description.match(/<a\s.*?href="(.*?)">(.*?)\<\/a\>/g).map(function (item) {
          return item.replace(/<a\s.*?href="([^"]*)"[^>]*>(.*?)\<\/a\>/, '[$2]($1)')
        });

       console.log(`${data.data[0].title}\n${ul.join('\n')}`)
        curl.postJSON(`http://in.qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}`, {
          "msgtype": "markdown",
          "markdown": {
            content: `${data.data[0].title}\n${ul.join('\n')}`
          }
        }, {}, function(err, response, data){});
        client.close();
      });
    }else{
      console.log(data.err)
    }
  })



});

/*var CronJob = require('cron').CronJob;
new CronJob('* * * * * *', function () {
    console.log('You will see this message every second');
}, null, true, 'China/Beijing');*/
