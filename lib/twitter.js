var _Twitter_ = require('twitter');
module.exports = Twitter;
function Twitter(config) {
    this.consumer_key = config.twitter.consumer_key,
        this.consumer_secret = config.twitter.consumer_secret,
        this.access_token_key = config.twitter.access_token_key,
        this.access_token_secret = config.twitter.access_token_secret
}
Twitter.prototype.listen = function (handle, callback) {
    const twitter = new _Twitter_({
        consumer_key: this.consumer_key,
        consumer_secret: this.consumer_secret,
        access_token_key: this.access_token_key,
        access_token_secret: this.access_token_secret
    });
    // twitter.stream('statuses/user_timeline', {
    //     track: `${handle}`
    // }, function (stream) {
    //     stream.on('data', function (event) {
    //         console.log(tweet.user['name'] + ': ' + tweet.text);
    //         return callback(null, tweet);
    //     });

    //     stream.on('error', function (error) {
    //         return callback(error, null);
    //     });
    // });
    var params = {
        screen_name: handle
    };
    twitter.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            console.log(tweets);
        }
    });
}