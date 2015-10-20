//Derouter

var fs = require('co-fs'),
	mime = require('mime'),
	conf = {
		exception:{},
		default_controller:"index",
		default_action : "index",
		controller_path : '',
		resource_reg : /^\/(asset\/|upload\/|favicon\.ico|robot\.txt)/,
		resource_path : ''
	};
module.exports = function (uconf){
	for (var key in uconf){
		conf[key] = uconf[key];
	}
	return function *derouter( next ){
		//处理特定路由
		var exception = conf["exception"];
		for (var url in exception){
			if ( exception[url].test(this.req.url) ){
				this.req.url = url;
				break;
			}
		}
		//处理静态资源
		if ( conf["resource_reg"].test(this.req.url) ){
			this.type = mime.lookup(conf["resource_path"]+this.req.url);
			this.body = yield fs.createReadStream(conf["resource_path"]+this.req.url);
			return;
		}
		//检查并合法化url
		var params = this.req.url.replace(/(^\/*)|(\/*$)/g, "").split("/");
		var controller = params.shift() || conf['default_controller'];
		var action = params.shift() || conf['default_action'];
		//查找Controller
		if ( yield fs.exists(conf["controller_path"]+"/"+controller+".js")){
			var controller = require(conf["controller_path"]+"/"+controller+".js");
			if (controller[action] === undefined){
				this.res.stuts = "404";
				throw Error("There is no action found!")
			}
			action = controller[action];
			yield action.apply(this,params);
		}
		else{
			this.res.stuts = "404";
			throw Error("There is no controller found!")
		}
	}
}