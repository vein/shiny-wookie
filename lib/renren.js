var querystring = require('querystring');
var underscore = require("underscore");
var request = require('request');

var RenRen = function(options) {
    this.options = {
        app_key: null,
        app_secret: null,
        access_token: null,
        user_id: 0,
        refresh_token: null,
        format: "JSON",
        redirect_uri: "",
        api_group: [],
        scope: ""
    };
    underscore.extend(this.options, options);

    this.oauth = this.oauth();
    this.users = this.users();
};

RenRen.prototype.request = function(options, callback) {
    var self = this;
    options['uri'] = options['uri'].replace(/^\/|(\/|\?)$/g, "") || "";
    options['userId'] = options['userId'] || "";
    options['access_token'] = options['access_token'] || "";

    request({
        url: 'https://api.renren.com/'+options['uri']+"?userId="+options['userId']+"&access_token="+options['access_token'],
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    }, function(e, r, body) {
        if (!e) {
            try {
                body = JSON.parse(body);
                if (body.error_code) {
                    e = new Error(body.error_description);
                }
            } catch (error) {
                e = error;
            }
        }
        callback && callback(e, body);
    });

};

RenRen.prototype.oauth = function() {
    var self = this;
    return {
        authorize: function(options) {
            return 'https://graph.renren.com/oauth/authorize?' + querystring.stringify(options);
        },
        accesstoken: function(code, callback) {
            var options = {
                grant_type: "authorization_code",
                code: code,
                client_id: self.options.app_key,
                client_secret: self.options.app_secret,
                redirect_uri: self.options.redirect_uri
            };

            var opts = {
                url: "https://graph.renren.com/oauth/token",
                path: '',
                method: 'POST',
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded'
                },
                body: querystring.stringify(options)
            };

            request(opts, function(e, r, body) {
                try {
                    body = JSON.parse(body);
                } catch (error) {
                    e = error;
                }

                if (body.error) {
                    e = new Error(body.error);
                }
                callback && callback(e, body);
            });
        }

        /*
        {
            "token_type": "bearer",
            "expires_in": 2595096,
            "refresh_token": "127021|0.KAS3b8doSitHk6RLDtitb2VY8PjktTRA.229819774.1376381303243",
            "user": {
                "id": 229819700,
                "name": "二小姐",
                "avatar": [{
                        "type": "avatar",
                        "url": "http://hdn.xnimg.cn/photos/hdn121/20130805/2055/h_head_KFTQ_d536000000d0111b.jpg"
                    }, {
                        "type": "tiny",
                        "url": "http://hdn.xnimg.cn/photos/hdn221/20130805/2055/tiny_jYQe_ec4300051e7a113f.jpg"
                    }, {
                        "type": "main",
                        "url": "http://hdn.xnimg.cn/photos/hdn121/20130805/2055/h_main_ksPJ_d536000000d0111b.jpg"
                    }, {
                        "type": "large",
                        "url": "http://hdn.xnimg.cn/photos/hdn121/20130805/2055/h_large_yxZz_d536000000d0111b.jpg"
                    }
                ]
            },
            "access_token": "127066|6.08718aa138db0578dda3250f33bads6e.2592000.1378976400-229819774"
            "scope": "read_user_feed read_user_album",
        }*/
    };
};

RenRen.prototype.users = function() {
    var users = {};
    var self = this;
    var users_methods = [{
            method: "getInfo",
            uri: "v2/user/get"
        }, {
            method: "getLoggedInUser",
            uri: "/v2/user/login/get"
        },{
            method: "getProfileInfo",
            uri: "/v2/profile/get"
        }
    ];

    users_methods.forEach(function(m) {
        users[m.method] = function(options, callback) {
            options.uri = m.uri;
            self.request(options, callback);
        };
    });
    return users;
};

module.exports = RenRen;