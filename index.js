//polyphony.js
const Twitch = require(`./lib/twitch`);
const OBS = require(`./lib/obs`);
const Twitter = require(`./lib/twitter`);
const Symphony = require(`@cazgem/symphony.js`);
class Polyphony {
    constructor(config, port) {
        this.Twitch = new Twitch(config, port);
        this.OBS = new OBS(config);
        this.Twitter = new Twitter(config);
        this.Symphony = new Symphony(config);
    }
}
module.exports = Polyphony;