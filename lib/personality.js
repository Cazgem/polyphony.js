//polyphony.js/lib/personality.js
module.exports = Personality;
function Personality(config) {
    this.botname = config.identity.username;
    this._followup = ['...dumbass....', `Soon you'll learn....`, `psh....`, `10 point deduction`];
}
Personality.prototype.randomize = async function (arr, callback) {
    const random = Math.floor(Math.random() * this.arr.length);
    return callback(null, arr[random]);
}
Personality.prototype.followup = async function (callback) {
    const random = Math.floor(Math.random() * this._followup.length);
    return callback(null, this._followup[random]);
}
Personality.prototype.response = async function (type) {

}