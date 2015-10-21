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
function getParams( fn, params ) {
	var commentReg = /((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,
		parsReg = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
		tempfn = fn.toString.call(fn).replace( commentReg,'' ),
		paramskeys = tempfn.match( parsReg )[1]
		;
	if ( !paramskeys ) return [];
	paramskeys = paramskeys.split(/\s*,\s*/);
	
	return paramskeys.map(function (item) {
		return params[item];
	});
}
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
			if( this.type === "application/octet-stream" ){
				//设置为文件下载
				this.set("Content-Disposition", "attachment");
			}
			this.body = yield fs.createReadStream(conf["resource_path"]+this.req.url);
			return;
		}
		//检查并合法化url
		var urls = this.req.url.split("?"),
			params = urls[0].replace(/(^\/*)|(\/*$)/g, "").split("/"),
			controller = params.shift() || conf['default_controller'],
			action = params.shift() || conf['default_action'],
			urlparams = urls[1].split("&")
			;
		
		//查找Controller
		if ( yield fs.exists(conf["controller_path"]+"/"+controller+".js")){
			var controller = require(conf["controller_path"]+"/"+controller+".js");
			if (controller[action] === undefined){
				this.res.stuts = "404";
				throw Error("There is no action found!")
			}
			action = controller[action];
			
			//处理参数
			var paramsObj = Object.create({});
			for (var i=0 ;i<params.length; i+=2){
				paramsObj[params[i]] = params[i+1];
			}
			for (var vo of urlparams){
				var kv = vo.split("=");
				paramsObj[kv[0]] = kv[1];
			}
			this.query = paramsObj;
			
			//执行Action
			yield action.apply(this,paramsObj);
		}
		else{
			this.res.stuts = "404";
			throw Error("There is no controller found!")
		}
	}
}