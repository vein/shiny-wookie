var querystring = require('querystring');
var underscore = require("underscore");
var request = require('request');

var DouBan = function (options) {
    this.options = {
        app_key:null,
        app_secret:null,
        access_token:null,
        user_id:0,
        refresh_token:null,
        redirect_uri:"",
        api_group:[],
        scope:""
    };
    underscore.extend(this.options, options);

    this.oauth = this.oauth();//工厂方法生产出认证模块
    this.users = this.users();//工厂方法生产出用户API
};

DouBan.prototype.request = function (token,callback) {//API请求
    var self = this;

    request({
        url:'https://api.douban.com/v2/user/~me',
        headers:{
            'Authorization': 'Bearer ' + token,
            'content-type':'application/x-www-form-urlencoded'
        }
    }, function (e, r, body) {
        if (!e) {
            try {
                body = JSON.parse(body);
                if (body.error_code) {
                    e = new Error(body.error_description);
                }
            }
            catch (error) {
                e = error;
            }
        }
        callback && callback(e, body);
    });

};

DouBan.prototype.oauth = function () {
    var self = this;
    return {
        authorize:function (options) {//返回入口地址
            return  'https://www.douban.com/service/auth2/auth?' + querystring.stringify(options);
        },
        accesstoken:function (code, callback) {//获取密钥
            var options = {
                grant_type:"authorization_code",
                code:code,
                client_id:self.options.app_key,
                client_secret:self.options.app_secret,
                redirect_uri:self.options.redirect_uri
            };

            var opts = {
                url:"https://www.douban.com/service/auth2/token",
                path:'',
                method:'POST',
                headers:{
                    "Content-Type":'application/x-www-form-urlencoded'
                },
                body:querystring.stringify(options)
            };

            request(opts, function (e, r, body) {
                try {
                    body = JSON.parse(body);
                }
                catch (error) {
                    e = error;
                }

                if (body.error) {
                    e = new Error(body.error);
                }
                callback && callback(e, body);
            });
        }
    };
};

DouBan.prototype.users = function () {//定义用户接口
    var users = {};
    var self = this;
    var users_methods = ["getInfo"];

    users_methods.forEach(function (m) {
        users[m] = function (token,callback) {
            self.request(token,callback);
        };
    });
    return users;
};

module.exports = DouBan;
