//polyphony.js
const request = require(`request`);
const tmi = require(`tmi.js`);
const mysql = require(`mysql`);
const Promise = require(`promise`);
const { ApiClient, HelixStream } = require('twitch');
// const { PubSubClient } = require('twitch-pubsub-client');
const { ChatClient } = require('twitch-chat-client');
const { SimpleAdapter, WebHookListener } = require('twitch-webhooks');
const { AccessToken, RefreshableAuthProvider, StaticAuthProvider } = require('twitch-auth');
module.exports = Twitch;
function Twitch(config, port = 3140) {
    this.db = mysql.createPool({
        connectionLimit: 10,
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database
    })
    this.botname = config.identity.username;
    this.OAuth = config.identity.password.slice(6);
    this.OAuth2 = config.identity.password.slice(6);
    this.pass = config.identity.pass;
    this.client_id = config.identity.client_id;
    this.channel_id = config.default.channel_id;
    this.client_secret = config.identity.client_secret;
    const client_id = config.default.clientID;
    const accessToken = config.default.accessToken;
    // const clientSecret = this.client_secret;
    const ip_address = config.ip_address;
    // console.log('ClientSecret ' + clientSecret);
    // this.engage(function (err, results) { const refreshToken = results.client_id; console.log('refreshToken ' + refreshToken); });
    // const refreshToken = config.default.refreshToken;
    // console.log('refreshToken ' + refreshToken);
    const authProvider = new StaticAuthProvider(client_id, accessToken);
    // const authProvider = new RefreshableAuthProvider(
    //     new StaticAuthProvider(client_id, clientSecret),
    //     {
    //         clientSecret,
    //         refreshToken,
    //         onRefresh: (token) => {
    //             console.log(token)
    //         }
    //     }
    // );
    this.access_token = config.default.access_token;
    this.apiClient = new ApiClient({ authProvider });
    this.listener = new WebHookListener(this.apiClient, new SimpleAdapter({
        hostName: `${ip_address}`,
        listenerPort: port
    }));
    this.listener.listen();
}
const TwitchJs = require(`twitch-js`).default;
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
    const OAuth = this.OAuth;
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
    const OAuth = this.OAuth;
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
Twitch.prototype.chat = async function () {
    var channels = [`inasnap`, `cazgem`];
    chatClient = new ChatClient(this.authProvider, { channels: channels });
    await chatClient.connect();
    chatClient.onMessage(async (channel, user, message, msg) => {
        console.log(`[${channel}] <${user}>: ${message}`)
        if (message === '!followage') {
            const follow = await this.apiClient.kraken.users.getFollowedChannel(msg.userInfo.userId, msg.channelId);

            if (follow) {
                const currentTimestamp = Date.now();
                const followStartTimestamp = follow.followDate.getTime();
                chatClient.say(channel, `@${user} You have been following for ${secondsToDuration((currentTimestamp - followStartTimestamp) / 1000)}!`);
            } else {
                chatClient.say(channel, `@${user} You are not following!`);
            }
        }
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
Twitch.prototype.webhooks2 = function (user, callback) {
    const token = `gp762nuuoqcoxypju8c569th9wz7q5`;
    const username = 'polyphony';
    const channel = `cazgem`;
    const { api, chat } = new TwitchJs({ token, username });
    // api.get('streams/featured', { version: 'kraken' }).then(response => {
    //     console.log(response);
    //     // Do stuff ...
    // });
    const handleMessage = message => {
        console.log(message);
        // Do other stuff ...
    };

    chat.on(TwitchJs.Chat.Events.ALL, handleMessage);
    // Connect ...
    chat.connect().then(() => {
        // ... and then join the channel.
        chat.join(channel);
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
        return callback(err, null);
    }
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
    this.fetchAccessToken(channel, function (err, results) {
        const opts = {
            method: 'PATCH',
            url: `https://api.twitch.tv/helix/channels?broadcaster_id=${channel}`,
            headers: {
                'Authorization': `Bearer ${results}`,
                'Client-ID': `${that.client_id}`
            },
            body,
            json: true
        };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 204) {
                // const info = JSON.parse(body);
                return callback(null, response);
            } else {
                return callback(JSON.stringify(error), null);
            }
        });
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
        method: `GET`,
        url: 'https://id.twitch.tv/oauth2/validate',
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
        } else (
            console.log(`ERROR WITH ENGAGE! ${response}`)
        )
    });
}
