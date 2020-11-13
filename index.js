//polyphony.js
const Twitch = require(`./lib/twitch`);
const OBS = require(`./lib/obs`);
const Twitter = require(`./lib/twitter`);
class Polyphony {
    constructor(config, port) {
        this.Twitch = new Twitch(config, port);
        this.OBS = new OBS(config);
        this.Twitter = new Twitter(config);
    }
}
module.exports = Polyphony;