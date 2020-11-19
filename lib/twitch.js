//polyphony.js
const request = require(`request`);
const tmi = require(`tmi.js`);
const mysql = require(`mysql`);
const Promise = require(`promise`);
module.exports = Twitch;
function Twitch(config, port = 3140) {
    this.db = mysql.createPool({
        connectionLimit: 10,
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database
    });
    this.botname = config.identity.username;
    this.OAuth = config.identity.password.slice(6);
    this.OAuth2 = config.identity.password.slice(6);
    this.pass = config.identity.pass;
    this.client_id = config.identity.client_id;
    this.channel_id = config.default.channel_id;
    this.client_secret = config.identity.client_secret;
    this.ip_address = config.ip_address;
    this.eventsubCallback = `https://twitchapi.polyphony.me/webhooks/callback`;
    const client_id = config.default.clientID;
    const accessToken = config.default.accessToken;
    const ip_address = config.ip_address;

    this.access_token = config.default.access_token;

}
Twitch.prototype.modules = async function (modules, config = ['channel', 'channels']) {
    const output = new Promise((res, rej) => {
        const channels_list = [];
        if (modules === 'all') {
            var sql = `SELECT DISTINCT ${config[0]} FROM ${config[1]}`;
            this.db.query(sql, [1], (err, result) => {
                if (err) log(`info`, err);
                let count = 0;
                result.forEach((data) => {
                    count = count + 1;
                    channels_list.push(Object.values(data)[0]);
                    if (count === result.length) {
                        res(channels_list);
                    }
                })
            });
        } else {
            var sql = `SELECT ${config[0]} FROM ${config[1]} WHERE ${modules}=?`;
            this.db.query(sql, [1], (err, result) => {
                if (err) log(`info`, err);
                let count = 0;
                result.forEach((data) => {
                    count = count + 1;
                    channels_list.push(Object.values(data)[0]);
                    if (count === result.length) {
                        res(channels_list);
                    }
                })
            });
        }
    });
    return output;
}
Twitch.prototype.isLive = async function (userName) {
    const user = await this.apiClient.helix.users.getUserByName(userName);
    if (!user) {
        return false;
    }
    return await user.getStream() !== null;
}
Twitch.prototype.followers = async function (userId, callback) {
    const subscription = await this.listener.subscribeToFollowsToUser(userId, async (data) => {
        if (data) {
            username = data._data.from_name;
            // console.log(`${JSON.stringify(data)}`);
            return callback(null, username);
        }
    });
}
Twitch.prototype.subscribers = async function (userId, callback) {
    const subscription = await this.listener.subscribeToSubscriptionEvents(userId, async (data) => {
        if (data) {
            username = data._data.from_name;
            // console.log(`${JSON.stringify(data)}`);
            return callback(null, username);
        }
    });
}
Twitch.prototype.authenticate = function (callback) {
    const opts = {
        url: 'https://id.twitch.tv/oauth2/validate',
        headers: {
            'Authorization': `Bearer ${this.OAuth}`,
            'Client-ID': `${this.client_id}`
        }
    };
    request(opts, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const info = JSON.parse(body);
            return callback(null, info);
        } else (
            console.log(`ERROR WITH ENGAGE! ${response}`)
        )
    });
}
Twitch.prototype.accessToken = function (callback) {
    const opts = {
        url: 'https://id.twitch.tv/oauth2/validate',
        headers: {
            'Authorization': `Bearer ${this.OAuth}`,
            'Client-ID': `${this.client_id}`
        }
    };
    request(opts, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const info = JSON.parse(body);
            return callback(null, info);
        } else (
            console.log(`ERROR WITH ENGAGE! ${response}`)
        )
    });
}
Twitch.prototype.userID = function (user, callback) {
    const that = this;
    this.authenticate(function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/users?login=${user}`,
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.data[0].id);
            } else (
                console.log(`ERROR in USERID! ${JSON.stringify(response)}`)
            )
        });
    });
}
Twitch.prototype.user = function (user, callback) {
    const that = this;
    this.authenticate(function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/users?login=${user}`,
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.data[0]);
            } else (
                console.log(`ERROR in USERID! ${JSON.stringify(response)}`)
            )
        });
    });
}
Twitch.prototype.userName = function (user, callback) {
    const that = this;
    this.authenticate(function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/users?id=${user}`,
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.data[0].login);
            } else (
                console.log(`ERROR! ${response}`)
            )
        });
    });
}
Twitch.prototype.userReport = function (user, callback) {
    const that = this;
    this.authenticate(function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/users?login=${user}`,
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.data[0]);
            } else (
                console.log(`ERROR! ${response}`)
            )
        });
    });
}
Twitch.prototype.snoop = function ([options, name], callback) {
    this.authenticate(options, function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/users?login=${name}`,
            headers: {
                'Authorization': `Bearer ${options.OAuth.slice(6)}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.data[0].id);
            } else (
                console.log(`ERROR! ${response}`)
            )
        });
    });
}
Twitch.prototype.webhooks = function (user, callback) {
    const that = this;
    this.authenticate(function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/webhooks/hub`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${results.client_id}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'hub.mode': 'subscribe',
                'hub.topic': `https://api.twitch.tv/helix/users/follows?first=1&to_id=${user}`,
                'hub.callback': '207.154.201.115',
            })
        };
        console.log(opts.body)
        console.log(opts.headers)
        request.post(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
            } else (
                // console.log(`Webooks ERROR! ${response.toJSON().statuscode}`)
                console.log(`Webooks ERROR! ${response}`)

            )
        });
    });
}
Twitch.prototype.follows = function ([options, user], callback) {
    this.authenticate(options, function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/users/follows?first=1&to_id=${user}`,
            headers: {
                'Authorization': `Bearer ${options.OAuth.slice(6)}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.data[0].id);
            } else (
                console.log(`ERROR! ${response}`)
            )
        });
    });
}
Twitch.prototype.init_tmi = function (options) {
    return client = new tmi.Client({
        options: { debug: true },
        connection: {
            reconnect: true,
            secure: true
        },
        identity: {
            username: options.botname,
            password: options.OauthToken
        },
        channels: options.channel
    });
    // client.connect().catch(console.error);
}
Twitch.prototype.fetchIP = function (channel, callback) {
    try { // Search MySQL DB for command (good for simple commands. Use !polyphony add/edit <text> to add/edit commands
        let sql = `SELECT obs_ip FROM Polyphony_v1.users WHERE twitch = ?`;
        let results = this.db.query(sql, channel, (err, result) => {
            return callback(null, result[0].obs_ip);
        });
    } catch (err) {
        // console.log(err)
    }
}
Twitch.prototype.fetchModules = function ([userID, module], callback) {
    try { // Search MySQL DB for command (good for simple commands. Use !polyphony add/edit <text> to add/edit commands
        let sql = `SELECT ${module} FROM Polyphony_Twitch.channels WHERE channel_ID = ?`;
        // console.log(sql)
        let results = this.db.query(sql, userID, (err, results) => {
            // console.log(`result is ${result}`)
            if (results[0][module] === 0) { result = false } else { result = true }
            return callback(null, result);
        });
    } catch (err) {
        // console.log(err)
    }
}
Twitch.prototype.fetchAccessToken = function (userID, callback) {
    try {
        let sql = `SELECT twitch_access_token FROM Polyphony_v1.users WHERE twitch = ?`;
        let results = this.db.query(sql, userID, (err, results) => {
            let token = results[0]["twitch_access_token"];
            if (token === 0) { result = false } else { result = token; }
            return callback(null, result);
        });
    } catch (err) {
        console.log(`fetchAccessToken Error!`);
        return callback(err, null);
    }
}
Twitch.prototype.fetchTokens = function (userID, callback) {
    try {
        let sql = `SELECT * FROM Polyphony_v1.users WHERE twitch = ?`;
        let results = this.db.query(sql, userID, (err, results) => {
            let token = results[0];
            if (token === 0) { result = false } else { result = token; }
            return callback(null, result);
        });
    } catch (err) {
        return callback(err, null);
    }
}
Twitch.prototype.refreshToken = function (channel, callback) {
    const that = this;
    this.fetchTokens(channel, function (err, token) {
        // console.log(`Internal refreshToken: ${token['twitch_refresh_token']}`);
        // console.log(`Internal accessToken: ${token['twitch_access_token']}`);
        let urlFinal = `https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=${token['twitch_refresh_token']}&client_id=${that.client_id}&client_secret=${that.client_secret}`;
        const opts = {
            method: `POST`,
            url: urlFinal,
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${that.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                let insert = {
                    twitch_access_token: `${info.access_token}`,
                    twitch_refresh_token: `${info.refresh_token}`
                }
                let sql = `UPDATE Polyphony_v1.users SET ? WHERE twitch = ${channel}`;
                let results = that.db.query(sql, insert, (err, results) => {
                    if (err) throw err;
                    return callback(null, info);
                });
            } else (
                console.log(`ERROR WITH Refresh Token! ${JSON.stringify(response)}`)
            )
        });
    });
}
Twitch.prototype.revokeToken = function (token, callback) {
    let urlFinal = `https://id.twitch.tv/oauth2/revoke?client_id=${this.client_id}&token=${token}`;
    const opts = {
        method: `POST`,
        url: urlFinal,
        headers: {
            'Authorization': `Bearer ${this.OAuth}`,
            'Client-ID': `${this.client_id}`
        }
    };
    request(opts, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return callback(null, body);
        } else (
            console.log(`ERROR WITH Revoke Token! ${JSON.stringify(response)}`)
        )
    });
}
Twitch.prototype.fetchModulesByName = function (username, callback) {
    const that = this;
    this.userID(username, function (err, userID) {
        try { // Search MySQL DB for command (good for simple commands. Use !polyphony add/edit <text> to add/edit commands
            let sql = `SELECT * FROM Polyphony_Twitch.channels WHERE channel_ID = ?`;
            console.log(sql + ' ' + userID)
            let results = that.db.query(sql, userID, (err, results) => {
                // console.log(`result is ${result}`)
                if (results[0][module] === 0) { result = false } else { result = true }
                return callback(null, result);
            });
        } catch (err) {
            console.log(err)
        }
    });
}
Twitch.prototype.buildModules = function (module, callback) {
    try { // Search MySQL DB for command (good for simple commands. Use !polyphony add/edit <text> to add/edit commands
        let sql = `SELECT * FROM Polyphony_Twitch.channels WHERE ${module} = 1`;
        console.log(sql)
        let results = this.db.query(sql, [], (err, results) => {
            // console.log(`result is ${result}`)
            return callback(null, results);
        });
    } catch (err) {
        // console.log(err)
    }
}
Twitch.prototype.rollDice = function (sides) {
    return Math.floor(Math.random() * sides) + 1;
}
Twitch.prototype.banthem = function (client, name, chan) {
    client.ban(chan, `${name}`, `Please visit polyphony.me/public/twitch/banlist to see reasons`)
        .then((data) => {
            // client.action(data[0], `${name} has been cities1Snap1 'd from existence`);
        }).catch((err) => {
            console.log(err);
        });
}
Twitch.prototype.massban = function (client, name, channels) {
    console.log("Mass Ban Called Upon!");
    channels.forEach(chan => {
        client.action(chan, `cities1Snap1`);
        this.banthem(client, name, chan);
    });
    let load = {
        username: name
    };
    let sql2 = 'INSERT IGNORE INTO bans SET ?';
    let query = this.db.query(sql2, load, (err, result) => {
        if (err) throw err;
    });
    console.log(`${name} has been cities1Snap1 'd from existence`);
}
Twitch.prototype.massbanSilent = function (client, name, channels) {
    console.log("Mass Ban Called Upon!");
    channels.forEach(chan => {
        this.banthem(client, name, chan);
    });
    let load = {
        username: name
    };
    let sql2 = 'INSERT IGNORE INTO bans SET ?';
    let query = this.db.query(sql2, load, (err, result) => {
        if (err) throw err;
    });
    console.log(`${name} has been cities1Snap1 'd from existence`);
}
Twitch.prototype.massunban = function (client, name, channels) {
    console.log("Mass Unban Called Upon!");
    channels.forEach(channel => {
        client.unban(channel, `${name}`)
            .then((data) => {
                // client.action(data[0], `${name} has been cities1Snap1 'd back into  existence`);
            }).catch((err) => {
                console.log(err);
            });
    });
    let load = {
        username: name
    };
    let sql2 = `DELETE FROM bans WHERE ?`;
    let query = this.db.query(sql2, load, (err, result) => {
        if (err) throw err;
    });
    console.log(`${name} has been brought back from non-existence`);
}
Twitch.prototype.streams = function (input, options) {
    this.init_tmi(options);
    // client.api({
    //     url: `https://id.twitch.tv/oauth2/validate`,
    //     // method: "GET",
    //     headers: {
    //         // "Accept": `${options.accept}`,
    //         // "Client-ID": `${options.client_id}`,
    //         "Authorization": `${options.OauthToken}` 
    //     }
    // }, (err, res, body) => {
    //     console.log(body);
    // });
    client.api({
        url: `https://api.twitch.tv/helix/streams?game_id=${input}`,
        method: "GET",
        headers: {
            "Accept": `${options.accept}`,
            "Authorization": `${options.OauthToken}`,
            "Client-ID": `${options.client_id}`
        }
    }, (err, res, body) => {
        console.log(body);
    });
}
Twitch.prototype.addChannelToDB = function (params) {
    console.log(params)
    const that = this;
    params.forEach(user => {
        this.userID(user, function (err, results) {
            console.log(results)
            let load = {
                channel: user,
                channel_ID: results

            };
            console.log(load)
            try {
                let sql = 'INSERT IGNORE INTO channels SET ?';
                let query = that.db.query(sql, load, (err, result) => {
                    if (err) throw err;
                });
            } catch {

            }
        }
        )
    })

}
Twitch.prototype.getStream = function (user, callback) {
    const that = this;
    this.authenticate(function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/streams?first=20&user_login=${user}`,
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.data[0]);
            } else (
                console.log(`ERROR in GETSTREAM! ${JSON.stringify(response)}`)
            )
        });
    });
}
Twitch.prototype.getVod = function (userName, callback) {
    const that = this;
    this.userID(userName, function (err, user) {
        that.authenticate(function (err, results) {
            const opts = {
                url: `https://api.twitch.tv/helix/videos?user_id=${user}`,
                headers: {
                    'Authorization': `Bearer ${that.OAuth}`,
                    'Client-ID': `${results.client_id}`
                }
            };
            request(opts, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    const info = JSON.parse(body);
                    return callback(null, info.data[0]);
                } else (
                    console.log(`ERROR in GETSTREAM! ${JSON.stringify(response)}`)
                )
            });
        });
    });
}
Twitch.prototype.gameByID = function (input, callback) {
    const that = this;
    this.authenticate(function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/games?id=${input}`,
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.data[0]);
            } else (
                console.log(`ERROR in GETSTREAM! ${JSON.stringify(response)}`)
            )
        });
    });
}
Twitch.prototype.gameByName = function (input, callback) {
    const that = this;
    this.authenticate(function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/games?name=${input}`,
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.data[0]);
            } else (
                console.log(`ERROR in GETSTREAM! ${JSON.stringify(response)}`)
            )
        });
    });
}
Twitch.prototype.channels = function (input, callback) {
    const that = this;
    this.authenticate(function (err, results) {
        const opts = {
            url: `https://api.twitch.tv/helix/channels?broadcaster_id=${input}`,
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.data[0]);
            } else (
                console.log(response)
            )
        });
    });
}
Twitch.prototype.editChannel = function (channel, body, callback) {
    const that = this;
    this.fetchAccessToken(channel, function (err, token) {
        if (err || !token) { console.log(`No Results!`); throw err; } else {
            that._editChannel(channel, body, callback, token);
        }
    });
}
Twitch.prototype._editChannel = function (channel, reqbody, callback, token) {
    // console.log(`${token}`);
    let body = reqbody;
    const that = this;
    const opts = {
        method: 'PATCH',
        url: `https://api.twitch.tv/helix/channels?broadcaster_id=${channel}`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Client-ID': `${that.client_id}`
        },
        body,
        json: true
    };
    request(opts, function (error, response, resbody) {
        if (!error && response.statusCode == 204) {
            return callback(null, response);
        } else {
            that.refreshToken(channel, function (err, res) {
                that._editChannel(channel, reqbody, function (err, res) {
                    return callback(null, res);
                }, res.access_token);
            });
            return callback(`Refreshing Token!`, null);
        }
    });
}
Twitch.prototype.getViewCount = function (user, callback) {
    const that = this;
    this.getStream(user, function (err, results) {
        return callback(null, results.viewer_count);
    });
}
Twitch.prototype.getChatters = function (user, callback) {
    const that = this;
    console.log(`Checking chatters for ${user}`)
    this.engage(function (err, results) {
        const opts = {
            url: `https://tmi.twitch.tv/group/user/${user}/chatters`,
            headers: {
                'Authorization': `Bearer ${that.OAuth}`,
                'Client-ID': `${results.client_id}`
            }
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const info = JSON.parse(body);
                return callback(null, info.chatters.viewers);
            } else (
                console.log(`ERROR in getChatters! ${JSON.stringify(response)}`)
            )
        });
    });
}
Twitch.prototype.cleanup = function (db) {
    db.end(function (err) {
        if (err) {
        }
    });
}
Twitch.prototype.mod = function (context) {
    if ((context.mod) || (context['user-id'] === context['room-id'])) {
        return true;
    } else {
        return false;
    }
}
Twitch.prototype.userAccessToken = function (callback) {
    const opts = {
        method: `POST`,
        url: `https://id.twitch.tv/oauth2/validate?client_id=${this.client_id}&client_secret=${this.client_secret}&grant_type=client_credentials&scope=`,
        headers: {
            'Authorization': `Bearer ${this.OAuth}`,
            'Client-ID': `${this.client_id}`
        }
    };
    const OAuth = this.OAuth;
    request(opts, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const info = JSON.parse(body);
            return callback(null, info);
        } else {
            console.log(`ERROR WITH ENGAGE! ${response}`)
        }
    });
}
Twitch.prototype.createSubscription = function (type, channel, callback) {
    console.log(channel)
    const that = this;
    let body = JSON.stringify({
        "type": type,
        "version": "1",
        "condition": {
            "broadcaster_user_id": channel
        },
        "transport": {
            "method": "webhook",
            "callback": that.eventsubCallback,
            "secret": "polyphony12345"
        }
    });
    this.appAccessToken(function (err, token) {
        const opts = {
            url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Client-ID': `${that.client_id}`,
                'Content-Type': `application/json`
            },
            method: `POST`,
            body
        };
        request(opts, function (error, response, body) {
            if (response.status === 409) {
                return callback(`409: Subscription Already Exists!`, null);
            } else if (response) {
                const info = JSON.parse(body);
                return callback(null, info);
            } else {
                console.log(`ERROR WITH ENGAGE! ${JSON.stringify(body)}`)
            }
        });
    });
}
Twitch.prototype.getSubscriptions = function (channel, callback) {
    const that = this;
    this.appAccessToken(function (err, token) {
        const opts = {
            url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Client-ID': `${that.client_id}`,
                'Content-Type': `application/json`
            },
            method: `GET`
        };
        request(opts, function (error, response, body) {
            if (response.status === 409) {
                return callback(`409: Subscription Already Exists!`, null);
            } else if (response) {
                const info = JSON.parse(body);
                return callback(null, info);
            } else {
                console.log(`ERROR WITH ENGAGE! ${JSON.stringify(body)}`)
            }
        });
    });
}
Twitch.prototype.cleanSubscriptions = function (callback) {
    const that = this;
    this.getSubscriptions(null, function (err, res) {
        res.data.forEach(item => {
            if (item.status !== `enabled`) {
                that.deleteSubscription(item.id, callback);
            }
        })
    });
}
Twitch.prototype.deleteSubscription = function (id, callback) {
    const that = this;
    this.appAccessToken(function (err, token) {
        const opts = {
            url: `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Client-ID': `${that.client_id}`,
                'Content-Type': `application/json`
            },
            method: `DELETE`
        };
        request(opts, function (error, response, body) {
            if (response.status === 409) {
                return callback(`409: Subscription Already Exists!`, null);
            } else if (response) {
                const info = JSON.parse(body);
                return callback(null, info);
            } else {
                console.log(`ERROR WITH ENGAGE! ${JSON.stringify(body)}`)
            }
        });
    });
}
Twitch.prototype.appAccessToken = function (callback) {
    const opts = {
        url: `https://id.twitch.tv/oauth2/token?client_id=${this.client_id}&client_secret=${this.client_secret}&grant_type=client_credentials&scope=`,
        headers: {
            'Authorization': `Bearer ${this.OAuth}`,
            'Client-ID': `${this.client_id}`
        },
        method: `POST`
    };
    request(opts, function (error, response, body) {
        if (response) {
            const info = JSON.parse(body);
            return callback(null, info.access_token);
        } else if (error) {
            console.log(`ERROR WITH ENGAGE! ${JSON.stringify(error)}`)
        } else {
            console.log(`ERROR WITH ENGAGE! ${JSON.stringify(body)}`)
        }
    });
}
Twitch.prototype.twitter = function () {
    Twitter.cross();
}