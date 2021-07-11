//polyphony.js
const Twitch = require(`./lib/twitch`);
const OBS = require(`./lib/obs`);
const Twitter = require(`./lib/twitter`);
const Quaver = require(`quaver`);
class Polyphony {
    constructor(config, port) {
        this.Twitch = new Twitch(config, port);
        this.OBS = new OBS(config);
        this.Twitter = new Twitter(config);
        this.Symphony = new Quaver(config);
    }
}
module.exports = Polyphony;