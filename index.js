var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var req = request('https://weekly.75team.com/rss.php')
var feedparser = new FeedParser(/*[options]*/);
const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'robot';

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
    stream.pipe(feedparser);
  }
});

feedparser.on('error', function (error) {
  // always handle errors
});

feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
  var item;

  while (item = stream.read()) {
    //console.log(item);
  }
});


// Use connect method to connect to the Server
client.connect(function (err) {

  const db = client.db(dbName);
  console.log("Connected successfully to server");
  db.collection("news").insertMany([{
    theme: "my mongodb000",
    author: "jack",
  },
    {
      theme: "my mongodb001",
      author: "jack",
    },
  ], function (err, res) {
    if (err) throw err;
    console.log("文档插入成功");
    client.close();
  });

});


/*var CronJob = require('cron').CronJob;
new CronJob('* * * * * *', function () {
    console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');*/
