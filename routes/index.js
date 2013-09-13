var settings = require('../settings'),
	User = require('../api/user'),
	Album = require('../api/album'),
	Comment = require('../api/comment'),
	Event = require('../api/event'),
	Message = require('../api/message'),
	Photo = require('../api/photo'),
	Pmsg = require('../api/pmsg'),
	Portrait = require('../api/portrait'),
	xss = require('xss'),
	easyimg = require('easyimage'),
	im = require('imagemagick'),
	fs = require('fs'),
	crypto = require('crypto'),
	mime = require('mime'),
	Sina = require('../lib/sina.js'),
	Renren = require('../lib/renren.js'),
	QQ = require('../lib/qq.js'),
	DouBan = require('../lib/douban.js'),
	Templates = require('../common/template');

var sina = new Sina(settings.social_account.sina);
var renren = new Renren(settings.social_account.renren);
var qq = new QQ(settings.social_account.qq);
var douban = new DouBan(settings.social_account.douban);

module.exports = function(app) {

	//首页
	app.get('/', function(req, res) {
		res.render('index', {
			title: '我爱你---张怡'
		});

	});

	app.get('/message/getunread', function(req, res) {
		Message.getMessages({
			readed: 0,
			user: {
				id: req.session.uid
			}
		}, function(err, messages) {
			messages.forEach(function(o, i) {
				Message.setReaded({
					_id: o._id
				}, function(err) {
					if (err) console.log(err);
				});
			});
			res.json(messages);
		});
	});

	//获取一个事件
	app.get('/event/get/:id', function(req, res) {
		var condition = {};
		condition._id = req.params.id;
		Event.get(condition, function(err, event) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			if (!isAdmin(req.session.user) && (event.isprivacy == 1 && event.user.id != req.session.uid)) return;
			Event.update({
				_id: req.params.id
			}, {
				"$inc": {
					views: 1
				}
			}, function(err) {
				if (err) {
					throw res.json({
						info: "error",
						data: err
					});
				}

			});
			res.json(event);
		});
	});

	//获取某个日期内的事件集合
	app.get(/\/events\/date\/(\d{4})?\/?(\d{1,2})?\/?(\d{1,2})?\/?/, function(req, res) {
		var year = req.params[0],
			month = req.params[1],
			day = req.params[2],
			count = req.query.count,
			start = req.query.start;
		Event.getSetByDate({
			year: year,
			month: month,
			day: day,
			count: parseInt(count),
			start: parseInt(start)
		}, function(err, events) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			var results = [];
			events.forEach(function(o, i) {
				if (isAdmin(req.session.user) || !(o.isprivacy == 1 && o.user.id != req.session.uid)) results.push(o);
			});
			res.json(results);
		});
	});
	//获取火热事件集
	app.get('/events/hot', function(req, res) {
		var count = req.query.count,
			start = req.query.start;
		Event.getHotEvents({
			count: parseInt(count),
			start: parseInt(start)
		}, function(err, events) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			var results = [];
			events.forEach(function(o, i) {
				if (isAdmin(req.session.user) || !(o.isprivacy == 1 && o.user.id != req.session.uid)) results.push(o);
			});
			res.json(results);
		});
	});
	//获取最新事件集
	app.get('/events/new', function(req, res) {
		var count = req.query.count,
			start = req.query.start;
		Event.getLatestEvents({
			count: parseInt(count),
			start: parseInt(start)
		}, function(err, events) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			var results = [];
			events.forEach(function(o, i) {
				if (isAdmin(req.session.user) || !(o.isprivacy == 1 && o.user.id != req.session.uid)) results.push(o);
			});
			res.json(results);
		});
	});

	//将某事件设置为隐私
	app.post('/event/lock/:id', checkLogin);
	app.post('/event/lock/:id', checkRole);
	app.post('/event/lock/:id', function(req, res) {
		Event.setPrivacy({
			_id: req.params.id,
			user: {
				id: req.session.uid
			}
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//取消某事件的隐私
	app.post('/event/unlock/:id', checkLogin);
	app.post('/event/unlock/:id', checkRole);
	app.post('/event/unlock/:id', function(req, res) {
		Event.removePrivacy({
			_id: req.params.id,
			user: {
				id: req.session.uid
			}
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//添加一条事件
	app.post('/event/post', checkLogin);
	app.post('/event/post', checkRole);
	app.post('/event/post', function(req, res) {
		Event.add({
			title: template('EventTitle', {
				title: xss(req.body.title)
			}),
			body: template('EventContent', {
				body: xss(req.body.content)
			}),
			published: new Date().getTime(),
			user: {
				social_account_type: /*req.session.user_info.social_account_type ||*/ "qq",
				id: /*req.session.uid ||*/ "janry"
			}
		}, function(err,event) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			console.log(event);
			res.json({
				info: "ok"
			});
		});
	});


	//修改某一事件
	app.post('/event/put', checkLogin);
	app.post('/event/put', checkRole);
	app.post('/event/put', function(req, res) {
		var query = {};
		query._id = req.body.id;
		if (!isAdmin(req.session.user)) {
			query.user.id = req.session.uid;
		}
		Event.update(query, {
			title: template('EventTitle', {
				title: xss(req.body.title)
			}),
			body: template('EventContent', {
				body: xss(req.body.content)
			}),
			modifyed: new Date().getTime(),
			user: {
				id: req.session.uid,
				social_account_type: req.session.user_info.social_account_type
			}
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});


	//删除某一事件
	app.post('/event/del/:id', checkLogin);
	app.post('/event/del/:id', checkRole);
	app.post('/event/del/:id', function(req, res) {
		var query = {};
		query._id = req.params.id;
		if (!isAdmin(req.session.user)) {
			query.user.id = req.session.uid;
		}
		Event.deleteEvent(query, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//删除所有事件
	app.post('/events/del', checkLogin);
	app.post('/events/del', checkRole);
	app.post('/events/del', function(req, res) {
		var query = {};
		if (!isAdmin(req.session.user)) {
			query.user.id = req.session.uid;
		}
		Event.deleteEvent(query, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//------------------------------------------------------------------------------------------------------------------------

	//获取一个相册
	app.get('/album/get/:id', function(req, res) {
		Album.get({
			_id: req.params.id
		}, function(err, album) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			if (!isAdmin(req.session.user) && (album.isprivacy == 1 && album.user.id != req.session.uid)) return;
			res.json(album);
		});
	});

	//获取某个日期内的相册集合
	app.get(/\/albums\/date\/(\d{4})?\/?(\d{1,2})?\/?(\d{1,2})?\/?/, function(req, res) {
		var year = req.params[0],
			month = req.params[1],
			day = req.params[2],
			count = req.query.count,
			start = req.query.start;
		Album.getSetByDate({
			year: year,
			month: month,
			day: day,
			count: parseInt(count),
			start: parseInt(start)
		}, function(err, albums) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			var results = [];
			albums.forEach(function(o, i) {
				if (isAdmin(req.session.user) || !(o.isprivacy == 1 && o.user.id != req.session.uid)) results.push(o);
			});
			res.json(results);
		});
	});


	//获取火热相册集
	app.get('/albums/hot', function(req, res) {
		var count = req.query.count,
			start = req.query.start;
		Album.getHotAlbums({
			count: parseInt(count),
			start: parseInt(start)
		}, function(err, albums) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			var results = [];
			albums.forEach(function(o, i) {
				if (isAdmin(req.session.user) || !(o.isprivacy == 1 && o.user.id != req.session.uid)) results.push(o);
			});
			res.json(results);
		});
	});


	//获取最新相册集
	app.get('/albums/new', function(req, res) {
		var count = req.query.count,
			start = req.query.start;
		Album.getLatestAlbums({
			count: parseInt(count),
			start: parseInt(start)
		}, function(err, albums) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			var results = [];
			albums.forEach(function(o, i) {
				if (isAdmin(req.session.user) || !(o.isprivacy == 1 && o.user.id != req.session.uid)) results.push(o);
			});
			res.json(results);
		});
	});

	//将某相册设置为隐私
	app.post('/album/lock/:id', checkLogin);
	app.post('/album/lock/:id', checkRole);
	app.post('/album/lock/:id', function(req, res) {
		Album.setPrivacy({
			_id: req.params.id,
			user: {
				id: req.session.uid
			}
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});
	//设置相册封面
	app.post('/album/cover/:albumid/:url', checkLogin);
	app.post('/album/cover/:albumid/:url', checkRole);
	app.post('/album/cover/:albumid/:url', function(req, res) {
		Album.update({
			_id: req.params.albumid,
			user: {
				id: req.session.uid
			}
		}, {
			cover: xss(req.params.url)
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//取消某相册的隐私
	app.post('/album/unlock/:id', checkLogin);
	app.post('/album/unlock/:id', checkRole);
	app.post('/album/unlock/:id', function(req, res) {
		Album.removePrivacy({
			_id: req.params.id,
			user: {
				id: req.session.uid
			}
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//添加一个相册
	app.post('/album/post', checkLogin);
	app.post('/album/post', checkRole);
	app.post('/album/post', function(req, res) {
		Album.add({
			title: template('AlbumTitle', {
				title: xss(req.body.title)
			}),
			description: template('AlbumContent', {
				description: xss(req.body.content)
			}),
			created: new Date().getTime(),
			user: {
				social_account_type: req.session.user_info.social_account_type,
				id: req.session.uid
			}
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});


	//修改某一相册
	app.post('/album/put', checkLogin);
	app.post('/album/put', checkRole);
	app.post('/album/put', function(req, res) {
		var query = {};
		query._id = req.body.id;
		if (!isAdmin(req.session.user)) {
			query.user.id = req.session.uid;
		}
		Album.update(query, {
			title: template('AlbumTitle', {
				title: xss(req.body.title)
			}),
			description: template('AlbumContent', {
				description: xss(req.body.content)
			}),
			modifyed: new Date().getTime(),
			user: {
				social_account_type: req.session.user_info.social_account_type,
				id: req.session.uid
			}
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});


	//删除某一相册
	app.post('/album/del/:id', checkLogin);
	app.post('/album/del/:id', checkRole);
	app.post('/album/del/:id', function(req, res) {
		var query = {};
		query._id = req.params.id;
		if (!isAdmin(req.session.user)) {
			query.user.id = req.session.uid;
		}
		Album.deleteAlbum(query, function(err) {
			var query = {};
			query.album.id = req.params.id;
			if (!isAdmin(req.session.user)) {
				query.user.id = req.session.uid;
			}
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			Photo.deletePhoto(query, function(err, photos) {
				if (err) {
					return res.json({
						info: "error",
						data: err
					});
				}
				photos.forEach(function(o, i) {
					fs.unlinkSync(o.url);
				});
				res.json({
					info: "ok"
				});
			});

		});
	});

	//-------------------------------------------------------------------------------------------------------------------------------------


	//获取一张照片
	app.get('/photo/get/:id', function(req, res) {
		Photo.get({
			_id: req.params.id
		}, function(err, photo) {
			if (err) {
				throw res.json({
					info: "error",
					data: err
				});
			}

			if (!isAdmin(req.session.user) && (photo.isprivacy == 1 && photo.user.id != req.session.uid)) return;

			Photo.update({
				_id: req.params.id
			}, {
				"$inc": {
					views: 1
				}
			}, function(err) {
				if (err) {
					throw res.json({
						info: "error",
						data: err
					});
				}

			});
			res.json(photo);
		});
	});

	//获取某个日期内的照片集合
	app.get(/\/photos\/date\/(\d{4})?\/?(\d{1,2})?\/?(\d{1,2})?\/?/, function(req, res) {
		var year = req.params[0],
			month = req.params[1],
			day = req.params[2],
			count = req.query.count,
			start = req.query.start;
		Photo.getSetByDate({
			year: year,
			month: month,
			day: day,
			count: parseInt(count),
			start: parseInt(start)
		}, function(err, photos) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			var results = [];
			photos.forEach(function(o, i) {
				if (isAdmin(req.session.user) || !(o.isprivacy == 1 && o.user.id != req.session.uid)) results.push(o);
			});
			res.json(results);
		});
	});

	//获取火热照片集
	app.get('/photos/hot', function(req, res) {
		var count = req.query.count,
			start = req.query.start;
		Photo.getHotPhotos({
			count: parseInt(count),
			start: parseInt(start)
		}, function(err, photos) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			var results = [];
			photos.forEach(function(o, i) {
				if (isAdmin(req.session.user) || !(o.isprivacy == 1 && o.user.id != req.session.uid)) results.push(o);
			});
			res.json(results);
		});
	});

	//获取最新相册集
	app.get('/photos/new', function(req, res) {
		var count = req.query.count,
			start = req.query.start;
		Photo.getLatestPhotos({
			count: parseInt(count),
			start: parseInt(start)
		}, function(err, albums) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			var results = [];
			albums.forEach(function(o, i) {
				if (isAdmin(req.session.user) || !(o.isprivacy == 1 && o.user.id != req.session.uid)) results.push(o);
			});
			res.json(results);
		});
	});


	//将某照片设置为隐私
	app.post('/photo/lock/:id', checkLogin);
	app.post('/photo/lock/:id', checkRole);
	app.post('/photo/lock/:id', function(req, res) {
		Photo.setPrivacy({
			_id: req.params.id,
			user: {
				id: req.session.uid
			}
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//取消某照片的隐私
	app.post('/photo/unlock/:id', checkLogin);
	app.post('/photo/unlock/:id', checkRole);
	app.post('/photo/unlock/:id', function(req, res) {
		Photo.removePrivacy({
			_id: req.params.id,
			user: {
				id: req.session.uid
			}
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});


	//获取图片

	app.get('/images/get/photo/:uid/:year/:month/:day/:name', function(req, res) {
		var imgname = req.params.imgname,
			time = new Date(req.params.year, req.params.month, req.params.day),
			path = generateUrl('./upload_images/', req.params.name, 'photo', req.params.uid, time),
			imgCur = generateUrl('/images/get/', req.params.name, 'photo', req.params.uid, time);

		if (req.headers.referer && req.headers.referer.indexOf(req.headers.host) == -1) return res.send('非法盗链哦！！');
		if (!(/.*\/(([-_a-zA-Z0-9x()]+)\.(jpg|jpeg|png|gif|bmp))$/i.test(path))) return res.send('路径解析错误！！');

		fs.readFile(path, function(err, data) {

			if (!data) {
				res.writeHead(
					200, {
					'Content-Type': mime.lookup(settings.cannotFindPhoto)
				});
				res.end(fs.readFileSync(settings.cannotFindPhoto));
			} else {
				Photo.get({
					url: imgCur
				}, function(err, photo) {
					if (!isAdmin(req.session.user) && (photo.isprivacy == 1 && photo.user.id != req.session.uid)) {
						res.writeHead(
							200, {
							'Content-Type': mime.lookup(settings.photoForbidden)
						});
						return res.end(fs.readFileSync(settings.photoForbidden));
					}
					res.writeHead(
						200, {
						'Content-Type': mime.lookup(path)
					});
					res.end(data);
				});

			}
		});
	});

	//添加一个相册照片 
	app.post('/photo/upload', checkLogin);
	app.post('/photo/upload', checkRole);
	app.post('/photo/upload', function(req, res) {
		var iamges = req.files.images,
			errorn = [],
			snum = 0,
			time = new Date();

		images.forEach(function(o, i) {
			if ((/^([-_a-zA-Z0-9x()]+)\.(jpg|jpeg|png|gif|bmp)$/i.test(o.name))) {
				var tmp_path = o.path,
					target_path, file, newName = o.name;
				target_path = getTargetPath('./upload_images/', o.name, 'photo', req.session.uid, time);
				try {
					file = fs.readFileSync(target_path);
				} catch (e) {}
				if (file) {
					newName = generateNewName(o.name);
					target_path = getTargetPath('./upload_images/', newName, 'photo', req.session.uid, time);
				}
				try {
					fs.renameSync(tmp_path, target_path);
				} catch (e) {
					console.log(e);
					if (snum == 0 && i == images.length - 1) {
						return res.json({
							info: "error",
							data: "上传失败!"
						});
					}
					return;
				}
				try {
					fs.unlinkSync(tmp_path);
				} catch (e) {
					console.log(e);
					if (snum == 0 && i == images.length - 1) {
						return res.json({
							info: "error",
							data: "上传失败!"
						});
					}
					return;
				}

				im.readMetadata(target_path, function(err, metadata) {
					if (err) {
						console.log(err);
						if (snum == 0 && i == images.length - 1) {
							return res.json({
								info: "error",
								data: "上传失败!"
							});
						}
						return;

					}
					Photo.add({
						title: template('PhotoTitle', {
							title: xss(o.name)
						}),
						url: generateUrl('/images/get/', newName, 'photo', req.session.uid, time),
						width: metadata.exif.exifImageWidth,
						height: metadata.exif.exifImageLength,
						cameraMake: metadata.exif.make,
						cameraType: metadata.exif.model,
						size: calculateSize(o.size),
						uploaded: time.getTime(),
						album: {
							id: req.body.albumid,
							name: req.body.albumName
						},
						user: {
							social_account_type: req.session.user_info.social_account_type,
							id: req.session.uid
						}
					}, function(err) {
						if (err) {
							console.log(err);
							if (snum == 0 && i == images.length - 1) {
								return res.json({
									info: "error",
									data: "上传失败!"
								});
							}
							return;

						}

						snum++;

						if (i == images.length - 1)

							return res.json({
								info: "ok",
								data: "上传成功!",
								successNum: snum
							});


					});
				});

			}
		});

	});

	//修改某张照片
	app.post('/photo/put', checkLogin);
	app.post('/photo/put', checkRole);
	app.post('/photo/put', function(req, res) {
		var query = {};
		query._id = req.body.id;
		if (!isAdmin(req.session.user)) {
			query.user.id = req.session.uid;
		}
		Photo.update(query, {
			title: template('PhotoTitle', {
				title: xss(req.body.title)
			}),
			description: template('PhotoContent', {
				description: xss(req.body.content)
			}),
			album: {
				id: req.body.albumid,
				name: req.body.albumname
			}
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//删除某张照片
	app.post('/photo/del/:id', checkLogin);
	app.post('/photo/del/:id', checkRole);
	app.post('/photo/del/:id', function(req, res) {
		var query = {};
		query._id = req.body.id;
		if (!isAdmin(req.session.user)) {
			query.user.id = req.session.uid;
		}
		Photo.deletePhoto(query, function(err, photos) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			photos.forEach(function(o, i) {
				fs.unlinkSync(o.url);
			});
			res.json({
				info: "ok"
			});
		});
	});


	//----------------------------------------------------------------------------------------------------------------------------------------

	//获取一个评论列表

	app.get('/comment/get/:appname/:appid', function(req, res) {
		var appname = req.params.appname,
			appid = req.params.appid,
			count = req.query.count,
			start = req.query.start,
			query = {
				courceId: appid,
				sourceType: appname,
				count: count,
				start: start
			};
		if (!isAdmin(req.session.user) && settings.commentAudit == true) {
			query.admit = 1;
		}
		Comment.getComments(query, function(err, comments) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json(comments);
		});
	});

	//发表一篇评论

	app.post('/comment/post', checkLogin);
	app.post('/comment/post', checkRole);
	app.post('/comment/post', function(req, res) {
		Comment.add({
			app: {
				name: req.body.appname,
				outkey: req.body.appid
			},
			parentid: req.body.commentid || 0,
			body: template('CommentContent', {
				body: xss(req.body.content)
			}),
			time: new Date().getTime(),
			user: {
				social_account_type: req.session.user_info.social_account_type,
				id: req.session.uid
			}
		}, function(err, comment) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			Message.add({
				title: template('MessagetTitle', {
					sourceUser: req.session.user_info.name
				}),
				appname: 'comment',
				outkey: comment._id,
				body: template('CommentContent', {
					body: xss(req.body.content)
				}),
				time: new Date().getTime(),
				user: {
					id: req.body.tgtuid,
					social_account_type: req.body.social_account_type
				}
			}, function(err) {
				if (err) {
					return res.json({
						info: "error",
						data: err
					});
				}
				res.json({
					info: "ok"
				});
			});

		});
	});

	//审核通过一条评论

	app.post('/comment/pass/:id', checkLogin);
	app.post('/comment/pass/:id', checkRole);
	app.post('/comment/pass/:id', function(req, res) {
		var query = {
			_id: req.params.id,
			user: {
				id: req.session.uid
			}
		};

		Comment.admitComment(query, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//屏蔽某条评论

	app.post('/comment/notpass/:id', checkLogin);
	app.post('/comment/notpass/:id', checkRole);
	app.post('/comment/notpass/:id', function(req, res) {
		var query = {
			_id: req.params.id,
			user: {
				id: req.session.uid
			}
		};
		Comment.removeAdmit(query, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//删除某条评论

	app.post('/comment/del/:id', checkLogin);
	app.post('/comment/del/:id', checkRole);
	app.post('/comment/del/:id', function(req, res) {
		var query = {};
		query._id = req.params.id;
		if (!isAdmin(req.session.user)) {
			query.user.id = req.session.uid;
		}
		Comment.deleteComment(query, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//--------------------------------------------------------------------------------------------------------------------------


	//获取消息列表
	app.get('/messages/get/:appname/:uid', checkLogin);
	app.get('/messages/get/:appname/:uid', checkRole);
	app.get('/messages/get/:appname/:uid', function(req, res) {
		var appname = req.params.appname,
			uid = req.params.uid,
			count = req.query.count,
			start = req.query.start,
			query = {
				userId: uid,
				appName: appname,
				count: count,
				start: start
			};
		Message.getMessages(query, function(err, messages) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json(messages);
		});
	});


	//删除一条消息
	app.post('/message/del/:id', checkLogin);
	app.post('/message/del/:id', checkRole);
	app.post('/message/del/:id', function(req, res) {
		var query = {};
		query._id = req.params.id;
		if (!isAdmin(req.session.user)) {
			query.user.id = req.session.uid;
		}
		Message.deleteMessage(query, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});


	//标记已查看，用于响应点击事件
	app.post('/message/viewed/:id', checkLogin);
	app.post('/message/viewed/:id', checkRole);
	app.post('/message/viewed/:id', function(req, res) {
		var query = {};
		query._id = req.params.id;
		if (!isAdmin(req.session.user)) {
			query.user.id = req.session.uid;
		}
		Message.setReaded(query, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//---------------------------------------------------------------------------------------------------------


	//获取与某人的私信列表
	app.get('/chats/get/:targetid', checkLogin);
	app.get('/chats/get/:targetid', checkRole);
	app.get('/chats/get/:targetid', function(req, res) {
		var targetId = req.params.targetid,
			currentId = req.session.uid,
			count = req.query.count,
			start = req.query.start,
			query = {
				targetUserId: targetId,
				userId: currentId,
				count: count,
				start: start
			};
		Pmsg.getChatsWithSomebody(query, function(err, pmsgs) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			res.json(pmsgs);
		});
	});

	//发表私信
	app.post('/chat/post', checkLogin);
	app.post('/chat/post', checkRole);
	app.post('/chat/post', function(req, res) {
		var obj = {
			body: template('ChatBody', {
				body: xss(req.body.content)
			}),
			time: new Date().getTime(),
			targetuser: {
				id: req.body.tgtuid,
				social_account_type: req.body.social_account_type
			},
			user: {
				id: req.session.uid,
				social_account_type: req.session.user_info.social_account_type
			}
		};
		Pmsg.add(obj, function(err, pmsg) {
			if (err) {
				return res.json({
					info: "error",
					data: err
				});
			}
			Message.add({
				title: template('ChatTitle', {
					sourceUser: req.session.user
				}),
				appname: 'chat',
				outkey: pmsg._id,
				body: template('ChatBody', {
					body: xss(req.body.content)
				}),
				time: new Date().getTime(),
				user: {
					id: req.body.tgtuid,
					social_account_type: req.body.social_account_type
				}
			}, function(err) {
				if (err) {
					return res.json({
						info: "error",
						data: err
					});
				}
				res.json({
					info: "ok"
				});
			});
		});
	});

	//------------------------------------------------------------------------------------------------------------------

	//上传头像
	app.post('/portrait/upload', checkLogin);
	app.post('/portrait/upload', checkRole);
	app.post('/portrait/upload', function(req, res) {
		var image = req.files.image,
			tmp_path = image.path,
			target_path = generatePortrait(req.session.uid);
		if ((/^([-_a-zA-Z0-9x()]+)\.(jpg|jpeg|png|gif|bmp)$/i.test(image.name))) {
			try {
				fs.renameSync(tmp_path, target_path);
			} catch (e) {
				console.log(e);
				return res.json({
					info: "error",
					data: "头像上传失败"
				});
			}
			try {
				fs.unlinkSync(tmp_path);
			} catch (e) {
				console.log(e);
				return res.json({
					info: "error",
					data: "头像上传失败"
				});
			}
			Portrait.add({
				url: {
					local: target_path
				},
				type: "local",
				user: {
					id: req.session.uid,
					social_account_type: req.session.user_info.social_account_type
				}
			}, function(err) {
				if (err) return res.json({
						info: "error",
						data: "头像上传失败"
					});
				res.json({
					info: "ok",
					data: "头像上传成功！"
				});
			});
		}
	});

	//获取头像

	app.get('/images/get/portrait/:uid', function(req, res) {
		var uid = req.params.uid,
			url = generatePortrait(uid);
		if (req.headers.referer && req.headers.referer.indexOf(req.headers.host) == -1) return res.send('非法盗链哦！！');
		Portrait.get({
			user: {
				id: uid
			}
		}, function(err, portrait) {
			var x;
			if (err) return console.log(err);
			if (req.query.type) {
				switch (req.query.type) {
					case "social":
						x = request(portrait.url.social);
						req.pipe(x);
						x.pipe(res);
						break;
					case "local":
						fs.readFile(portrait.url.local, function(err, data) {

							if (!data) {
								res.writeHead(
									200, {
									'Content-Type': mime.lookup(settings.cantFindPortrait)
								});
								res.end(fs.readFileSync(settings.cantFindPortrait));
							} else {
								res.writeHead(
									200, {
									'Content-Type': mime.lookup(portrait.url.local)
								});
								res.end(data);
							}
						});
						break;
				}
			} else if (portrait && (portrait.type == "social")) {
				x = request(portrait.url.social);
				req.pipe(x);
				x.pipe(res);
			} else {
				fs.readFile(portrait.url.local, function(err, data) {

					if (!data) {
						res.writeHead(
							200, {
							'Content-Type': mime.lookup(settings.cantFindPortrait)
						});
						res.end(fs.readFileSync(settings.cantFindPortrait));
					} else {
						res.writeHead(
							200, {
							'Content-Type': mime.lookup(portrait.url.local)
						});
						res.end(data);
					}
				});
			}
		});


	});

	//设置头像类型
	app.post('/portrait/type/:value', checkLogin);
	app.post('/portrait/type/:value', checkRole);
	app.post('/portrait/type/:value', function(req, res) {
		Portrait.update({
			user: {
				id: req.session.uid
			}
		}, {
			type: req.params.value == "social" ? "social" : "local"
		}, function(err) {
			if (err) return res.json({
					info: "error",
					data: "头像类型设置失败！"
				});
			return res.json({
				info: "error",
				data: "头像类型设置成功！"
			});
		});
	});

	//裁剪头像

	app.post('/portrait/scrop', checkLogin);
	app.post('/portrait/scrop', checkRole);
	app.post('/portrait/scrop', function(req, res) {
		var uid = req.session.uid,
			width = parseInt(req.query.width) || 180,
			height = parseInt(req.query.height) || 180,
			x = parseFloat(req.query.x) || 0,
			y = parseFloat(req.query.y) || 0,
			cropwidth = parseInt(req.query.cropwith) || 180,
			cropheight = parseInt(req.quer.cropheight) || 180;
		easyimage.rescrop({
			src: generatePortrait(uid),
			dst: generatePortrait(uid),
			height: height,
			width: width,
			cropwidth: cropwidth,
			cropheight: cropheight,
			x: x,
			y: y
		}, function(err) {
			if (err) {
				return res.json({
					info: "error",
					data: "头像裁剪失败!"
				});
			}
			res.json({
				info: "ok"
			});
		});
	});

	//获取用户信息
	app.get('/user/get/:uid', function(req, res) {
		User.get({
			_id: req.params.uid
		}, function(err, user) {
			if (err) {
				console.log(err);
				return res.json({
					info: "error",
					data: "用户信息获取失败"
				});
			}
			res.send(user.info);
		});
	});

	app.get('/sina_auth_cb', function(req, res, next) {
		sina.oauth.accesstoken(req.query.code, function(error, data) {
			if (!error) {
				access_token = data.access_token;
				sina.users.show({
					source: settings.social_account.sina.app_key,
					uid: data.uid,
					access_token: access_token,
					method: "GET"
				}, function(error, data) {
					if (error) {
						console.log(error);
						res.json({
							info: "error",
							data: "无法获取数据！"
						});
					} else {
						User.get({
							sina: {
								openid: data.uid
							}
						}, function(err, user) {
							if (err) {
								console.log(err);
								return res.json({
									info: "error",
									data: "数据库异常"
								});
							}
							if (user) {
								req.session.uid = user._id;
								req.session.role = 'user';
								user.info = adapterUser(JSON.parse(user.info), "sina");
								req.session.user_info = user.info;
								res.json({
									info: "ok",
									data: "登陆成功！"
								});
							} else {
								User.add({
									sina: {
										openid: data.uid
									},
									info: JSON.stringify(data)
								}, function(err, user) {
									req.session.uid = user._id;
									req.session.role = 'user';
									user.info = adapterUser(JSON.parse(user.info), "sina");
									req.session.user_info = user.info;
									Portrait.add({
										url: {
											social: user.info.avatar
										},
										type: "social",
										user: {
											id: req.session.uid,
											social_account_type: req.session.user_info.social_account_type
										}
									}, function(err) {
										if (err) console.log(err);
									});
									res.json({
										info: "ok",
										data: "登陆成功！"
									});
								});
							}

						});
					}
				});
			} else {
				console.log(error);
				res.json({
					info: "error",
					data: "无法获取密钥！"
				});
			}
		});
	});

	app.get('/renren_auth_cb', function(req, res, next) {
		renren.oauth.accesstoken(req.query.code, function(error, data) {
			if (!error) {
				renren.users.getInfo({
					access_token: data.access_token,
					userId: data.user.id
				}, function(error, data) {
					if (error) {
						console.log(error);
						res.json({
							info: "error",
							data: "无法获取数据！"
						});
					} else {
						User.get({
							renren: {
								openid: data.id
							}
						}, function(err, user) {
							if (err) {
								console.log(err);
								return res.json({
									info: "error",
									data: "数据库异常"
								});
							}
							if (user) {
								req.session.uid = user._id;
								req.session.role = 'user';
								user.info = adapterUser(JSON.parse(user.info), "renren");
								req.session.user_info = user.info;
								res.json({
									info: "ok",
									data: "登陆成功！"
								});
							} else {
								User.add({
									renren: {
										openid: data.id
									},
									info: JSON.stringify(data.response)
								}, function(err, user) {
									req.session.uid = user._id;
									req.session.role = 'user';
									user.info = adapterUser(JSON.parse(user.info), "renren");
									req.session.user_info = user.info;
									Portrait.add({
										url: {
											social: user.info.avatar
										},
										type: "social",
										user: {
											id: req.session.uid,
											social_account_type: req.session.user_info.social_account_type
										}
									}, function(err) {
										if (err) console.log(err);
									});
									res.json({
										info: "ok",
										data: "登陆成功！"
									});
								});
							}

						});
					}
				});
			} else {
				console.log(error);
				res.json({
					info: "error",
					data: "无法获取密钥！"
				});
			}
		});
	});

	app.get('/qq_auth_cb', function(req, res, next) {
		qq.oauth.accesstoken(req.query.code, function(error, token) { //{access_token:YOUR_ACCESS_TOKEN, expires_in:7776000}
			if (error) {
				console.log(error);
				res.json({
					info: "error",
					data: "无法获取密钥！"
				});
			} else {
				var access_token = querystring.parse(token)['access_token'];
				qq.oauth.openid(access_token, function(err, data) { //{"client_id":"YOUR_APPID","openid":"YOUR_OPENID"}
					if (err) {
						console.log(error);
						res.json({
							info: "error",
							data: "无法获取用户信息！"
						});
					} else {
						var OPENID = data.openid;
						qq.user.get_user_info({
							openid: OPENID,
							access_token: access_token,
							oauth_consumer_key: settings.social_account.qq.client_id,
							method: "GET"
						}, function(error, data) {
							if (error) {
								console.log(error);
								res.json({
									info: "error",
									data: "无法获取数据！"
								});
							} else {
								User.get({
									qq: {
										openid: OPENID
									}
								}, function(err, user) {
									if (err) {
										console.log(err);
										return res.json({
											info: "error",
											data: "数据库异常"
										});
									}
									if (user) {
										req.session.uid = user._id;
										req.session.role = 'user';
										user.info = adapterUser(JSON.parse(user.info), "qq", OPENID);
										req.session.user_info = user.info;
										res.json({
											info: "ok",
											data: "登陆成功！"
										});
									} else {
										User.add({
											qq: {
												openid: OPENID
											},
											info: JSON.stringify(data)
										}, function(err, user) {
											req.session.uid = user._id;
											req.session.role = 'user';
											user.info = adapterUser(JSON.parse(user.info), "qq", OPENID);
											req.session.user_info = user.info;
											Portrait.add({
												url: {
													social: user.info.figureurl_1
												},
												type: "social",
												user: {
													id: req.session.uid,
													social_account_type: req.session.user_info.social_account_type
												}
											}, function(err) {
												if (err) console.log(err);
											});
											res.json({
												info: "ok",
												data: "登陆成功！"
											});
										});
									}

								});
							}
						});
					}
				});
			}

		});
	});

	app.get('/douban_auth_cb', function(req, res, next) {
		douban.oauth.accesstoken(req.query.code, function(error, data) {
			if (!error) {
				douban.users.getInfo(data.access_token, function(error, data) {
					if (error) {
						console.log(error);
						res.json({
							info: "error",
							data: "无法获取数据！"
						});
					} else {
						User.get({
							douban: {
								openid: data.id
							}
						}, function(err, user) {
							if (err) {
								console.log(err);
								return res.json({
									info: "error",
									data: "数据库异常"
								});
							}
							if (user) {
								req.session.uid = user._id;
								req.session.role = 'user';
								user.info = adapterUser(JSON.parse(user.info), "douban");
								req.session.user_info = user.info;
								res.json({
									info: "ok",
									data: "登陆成功！"
								});
							} else {
								User.add({
									douban: {
										openid: data.id
									},
									info: JSON.stringify(data)
								}, function(err, user) {
									req.session.uid = user._id;
									req.session.role = 'user';
									user.info = adapterUser(JSON.parse(user.info), "douban");
									req.session.user_info = user.info;
									Portrait.add({
										url: {
											social: user.info.avatar
										},
										type: "social",
										user: {
											id: req.session.uid,
											social_account_type: req.session.user_info.social_account_type
										}
									}, function(err) {
										if (err) console.log(err);
									});
									res.json({
										info: "ok",
										data: "登陆成功！"
									});
								});
							}

						});
					}
				});
			} else {
				console.log(error);
				res.json({
					info: "error",
					data: "无法获取密钥！"
				});
			}
		});
	});

	app.post('/login_admin', function(req, res) {
		if (md5(req.body.password) == md5("14736925800jay")) {
			req.session.role = "admin";
		}
	});

	app.post('/login_lover', function(req, res) {
		if (md5(req.body.password) == md5("520zhangyi")) {
			req.session.role = "lover";
		}
	});

	app.get('/islogin', function(req, res) {
		if (req.session.uid)
			res.send('yes');
		else
			res.send('no');
	});

	function isAdmin() {
		return /*req.session.role == "admin"*/ true;
	}

	function checkLogin(req,res,next) {
		/*if (!req.session.uid) return res.json({
			info: "error",
			data: "对不起，您还没有登录！！"
		});*/
		next();
	}

	function checkRole(req,res,next) {
		/*if (req.session.role != 'admin' || req.session.role != 'lover')
			return res.json({
				info: "error",
				data: "对不起，您没有操作权限！！"
			});*/
		next();
	}

	function template(templateName, paramsList) {
		var currentTemplate = Templates[templateName];
		for (name in paramsList) {
			currentTemplate = currentTemplate.replace("{" + name + "}", paramsList[name]);
		}
		return currentTemplate;
	}

	function adapterUser(userInfo, type, id) {
		var user;
		switch (type) {
			case "sina":
				user = {
					id: userInfo.uid,
					name: userInfo.name,
					avatar: userInfo.profile_image_url,
					social_account_type: "sina"
				};
				break;
			case "qq":
				user = {
					id: id,
					name: userInfo.nickname,
					avatar: userInfo.figureurl,
					social_account_type: "qq"
				};
				break;
			case "renren":
				user = {
					id: userInfo.id,
					name: userInfo.name,
					avatar: userInfo.avatar[0].url,
					social_account_type: "renren"
				};
				break;
			case "douban":
				user = {
					id: userInfo.id,
					name: userInfo.name,
					avatar: userInfo.avatar,
					social_account_type: "sina"
				};
				break;
		}
		return user;
	}

	function calculateSize(size) {
		size = (size + "").replace(/(\d+)([a-zA-Z]+)?/, function() {
			switch (arguments[2].toLowerCase()) {
				case "b":
					return arguments[1];
				case "kb":
					return arguments[1] * 1024;
				case "mb":
					return arguments[1] * 1024 * 1024;
				case "tb":
					return arguments[1] * 1024 * 1024 * 1024;
			}
		});
		if (size / 1024 >= 1 && size / 1024 < 1024) return (size / 1024).toFixed(2) + "KB";
		else if (size / (1024 * 1024) >= 1 && size / (1024 * 1024) < 1024) return (size / 1024 / 1024).toFixed(2) + "MB";
		else if (size / (1024 * 1024 * 1024) >= 1 && size / (1024 * 1024 * 1024) < 1024) return (size / (1024 * 1024 * 1024)).toFixed(2) + "GB";
		else if (size / (1024 * 1024 * 1024 * 1024) >= 1) return (size / (1024 * 1024 * 1024 * 1024)).toFixed(2) + "TB";
	}

	function generateDir(path, mode) {
		var d = path.replace(/^\/|\/$/, "").split('/'),
			i = 0;
		if (/(.+)\.(.+)/.test(d[d.length - 1])) d.pop();
		if (d[0] == '.') {
			d.shift();
			d[0] = './' + d[0];
			for (i++; i < d.length; i++) {
				d[i] = d[i - 1] + '/' + d[i];
			}
		} else {
			d[0] = '/' + d[0];
			for (i++; i < d.length; i++) {
				d[i] = d[i - 1] + '/' + d[i];
			}
		}
		d.forEach(function(o, i) {
			try {
				fs.readdirSync(o);
			} catch (e) {
				if (e) {
					if (mode) fs.mkdirSync(o, mode);
					else fs.mkdirSync(o);
				}
			}

		});
	}

	function generateNewName(str) {
		var t = parseImageUrl(str),
			reg = /([-_a-zA-Z0-9x()]+)\((\d+)\)$/,
			result;
		if (reg.test(t.name)) {
			result = t.name.replace(reg, function() {
				return arguments[1] + "(" + (parseInt(arguments[2]) + 1) + ").";
			}) + t.ext;
		} else {
			result = t.name + "(1)." + t.ext;
		}
		return result;
	}

	function parseImageUrl(str) {
		var results = /.*\/(([-_a-zA-Z0-9x()]+)\.(jpg|jpeg|png|gif|bmp))$/i.exec(str);
		return {
			name: results[2],
			ext: results[3]
		};
	}

	function generatePortrait(uid) {
		var secret = "VsOTs0_34";
		return './upload_images/portrait/' + md5('portrait' + secret + uid) + '.jpg';
	}

	function getTargetPath(rootdir, name, appname, uid, DateTime) {
		var path = rootdir.replace(/\/$/, "") + '/' + appname + '/' + uid + "/" + DateTime && (DateTime instanceof Date) && (DateTime.getFullYear() + "/" + DateTime.getMonth() + "/" + DateTime.getDay() + "/") + name;
		generateDir(path);
		return path;
	}

	function generateUrl(pre, name, appname, uid, DateTime) {
		return pre.replace(/\/$/, "") + '/' + appname + '/' + uid + "/" + DateTime && (DateTime instanceof Date) && (DateTime.getFullYear() + "/" + DateTime.getMonth() + "/" + DateTime.getDay() + "/") + name;
	}

	function md5(str) {
		var md5 = crypto.createHash('md5');
		return md5.update(_md5(str)).digest('hex');

		function _md5(str) {
			var md5 = crypto.createHash('md5');
			return md5.update(str).digest('base64');
		}
	}
};