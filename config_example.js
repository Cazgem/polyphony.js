module.exports = {
    options: {
        debug: true
    },
    discord: {
        prefix: "!",
        token: "********************************"
    },
    twitter: {
        consumer_key: '****************',
        consumer_secret: '********************************',
        bearer_token: `********************************`,
        access_token_key: '********************************',
        access_token_secret: '********************************'
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: 'bot_name',
        password: 'oauth:********************************',
        client_id: '********************************',
        client_secret: '********************************',
        client_id_alt: `********************************`,
        authorization: `OAuth ********************************`
    },
    mysql: {
        host: '127.0.0.1',
        user: 'mysql_username',
        password: 'mysql_password',
        database: 'mysql_twitch_db'
    },
    obs: {
        address: `111.22.333.000:4444`,
        pass: `secure_password`
    },
    newsreel: {
        table: `mysql_table_name`,
        object: `mysql_table_object`,
        url: `https://polyphony.me/public/twitch/newsreel?channel=`
    },
    default: {
        streamer: 'noobmaster69',
        channel_id: '69696969',
        obs_address: '111.22.333.000:4444',
        obs_pass: 'secure_password',
        client_secret: 'client_secret_for_streaming_acc',
        token: `token_for_streaming_acc`,
        accessToken: `accessToken_for_streaming_acc`,
        clientID: `clientID_for_streaming_acc`,
        access_token: `Alternate_access_token`
    },
    ip_address: `127.0.0.1`,
    channels: ['bot_name'],
    secure_origin: 'secure.com/securepage',
    publicVapidKey: `**********************************************************************************`,
    privateVapidKey: `*********************************************`
}