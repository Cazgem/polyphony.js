//polyphony.js/lib/twitter.js
var _Twitter_ = require('twitter');
const request = require(`request`);
module.exports = Twitter;
function Twitter(config) {
    this.api_key = config.twitter.api_key,
        this.api_key_secret = config.twitter.api_key_secret,
        this.access_token = config.twitter.access_token,
        this.access_token_secret = config.twitter.access_token_secret,
        this.bearer_token = config.twitter.bearer_token,
        this.twitter = new _Twitter_({
            consumer_key: this.api_key,
            consumer_secret: this.api_key_secret,
            access_token_key: this.access_token,
            access_token_secret: this.access_token_secret
        });
}
// callback
Twitter.prototype.listen = function (hashtags, callback) {
    this.twitter.stream('statuses/filter', { track: hashtags }, function (stream) {
        stream.on('data', function (event) {
            return callback(null, event);
        });

        stream.on('error', function (error) {
            return callback(error, null);
        });
    });
}
Twitter.prototype.send = function (_status) {
    this.twitter.post('statuses/update', { status: _status }, function (error, tweet, response) {
        if (error) throw error;
    });
}
Twitter.prototype.user = function (user_id) {
    this.twitter.get('users/search', { q: user_id }, function (error, tweet, response) {
        if (error) throw error;
        console.log(tweet);  // Tweet body.
        console.log(response);  // Raw response object.
    });
}
Twitter.prototype.listen2 = function () {
    const opts = {
        method: `GET`,
        url: 'https://api.twitter.com/2/tweets/1275828087666679809?tweet.fields=attachments,author_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld',
        headers: {
            'Authorization': `Bearer ${this.bearer_token}`
        }
    };
    request(opts, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const info = JSON.parse(body);
            return callback(null, info);
        } else (
            console.log(`ERROR WITH ENGAGE! ${JSON.stringify(response)}`)
        )
    });
}
Twitter.prototype.cross = function () {
    console.log(`Twitter Crossover!`)
}