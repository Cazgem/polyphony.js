// const Promise = require(`promise`);
const OBSWebSocket = require('obs-websocket-js');
const _obs = new OBSWebSocket();
module.exports = OBS;
function OBS(config) {
    this.obs_address = config.default.obs_address;
    this.obs_pass = config.default.obs_pass;
}
OBS.prototype.listen = function (callback) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        .then(() => {
            console.log(`OBS Connection Established`);
        })
    _obs.on('SwitchScenes', data => {
        return callback(null, 'SwitchScenes', data.sceneName)
    });
    _obs.on('SwitchScenes', data => {
        return callback(null, 'SwitchScenes', data.sceneName)
    });
}
OBS.prototype.scene = function (scene, callback) {
    console.log(`New Active Scene: ${scene}`);
    return callback(null, `New Active Scene: ${scene}`);

}
OBS.prototype.trigger = function (item, time) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        .then(() => {
            console.log(`OBS Connection Established`);
        })
        .then(data => {
            _obs.send('SetSceneItemProperties', {
                item: item,
                visible: true
            })
            setTimeout(() => {
                _obs.send('SetSceneItemProperties', {
                    item: item,
                    visible: false
                })
            }, (time * 1000));
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
OBS.prototype.scenes = function () {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        .then(() => {
            return _obs.send(`GetSceneList`)
        })
        .then(() => {
        })
}
OBS.prototype.setScene = function (item, callback) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        .then(data => {
            console.log(`Found a different scene! Switching to Scene: ${item}`);

            _obs.send('SetCurrentScene', {
                'scene-name': item
            });
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            return callback(`Error in Poly OBS Scene`);
        });
    _obs.on('error', err => {
        console.error('socket error:', err);
    });
}
OBS.prototype.hide = function (item) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        // .then(() => {
        // console.log(`OBS Connection Established`);
        // })
        .then(data => {
            _obs.send('SetSceneItemProperties', {
                item: item,
                visible: false
            })
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
OBS.prototype.show = function (item) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        // .then(() => {
        // console.log(`OBS Connection Established`);
        // })
        .then(data => {
            return _obs.send('SetSceneItemProperties', {
                item: item,
                visible: true
            })
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
OBS.prototype.mute = function (source, callback) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        // .then(() => {
        // console.log(`OBS Connection Established`);
        // })
        .then(data => {
            _obs.send('SetMute', {
                source: source,
                mute: true
            })
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
            return err;
        });
}
OBS.prototype.unmute = function (source, callback) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        .then(() => {
            // console.log(`OBS Connection Established`);
        })
        .then(data => {
            _obs.send('SetMute', {
                source: source,
                mute: false
            })
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
            return err;
        });
}
OBS.prototype.getVol = function (source, callback) {
    const that = this;
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        .then(() => {
            return _obs.send('GetVolume', {
                source: source
            })
        })
        .then(data => {
            return callback(null, `${data.volume * 100}`);
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
OBS.prototype.setVol = function (source, volume, callback) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        .then(data => {
            _obs.send('SetVolume', {
                'source': source,
                'volume': (volume / 100)
            })
        })
        .then(() => {
            return callback(null, `${volume}`);
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
OBS.prototype.getScene = function (callback) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        .then(() => {
            return _obs.send('GetSceneList');
        })
        .then(data => {
            return callback(null, data);
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
OBS.prototype.test = function (callback) {
    this.container(callback(null, 'Success! OBS Connection Established'))
}
OBS.prototype.container = function (passthrough) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        .then(() => {
            return passthrough;
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            return callback(null, 'Error!');
        });
}
OBS.prototype.version = function (input, callback) {
    _obs.connect({
        address: this.obs_address,
        password: this.obs_pass
    })
        .then(data => {
            return _obs.send(`GetVersion`)
        }).then(data => {
            if (input === 'obs') {
                return callback(null, data.obsStudioVersion);
            } else if (input === 'websocket') {
                return callback(null, data.obsWebsocketVersion);
            } else {
                return callback(null, 'Please select either "obs" or "websocket".');
            }
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}