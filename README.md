#koa-derouter

*Koa derouter, but a router of koa.*

### Version log

##### 0.0.4
- Support REST API.

##### 0.0.3
- Fixed special url can not get query params.

##### 0.0.2
- Fixed static resouce download in IE/Edge.
- Add params suport.

##### 0.0.1
- First commit.

### How to use it

- In app.js

```js
    var koa = require('koa'),
        koa_gzip = require('koa-gzip'),
        koa_derouter = require('koa-derouter');

    var app = koa();
    var derouter = koa_derouter({
    	exception:{
    		"/home/index":/^\/$/,
    	},
    	default_controller:"index",
    	default_action : "index",
    	controller_path :  process.cwd() + "/controller",
    	resource_reg : /^\/(asset\/|upload\/|favicon\.ico|robot\.txt)/,
    	resource_path : process.cwd()
    });
    app.use(koa_gzip());
    app.use(derouter);
    
    app.listen(3000);
```

- In a controller

```js
    module.exports = {
        index : function*(id){
            
            var a = id;
            
            this.body = a;
        },
        art : {
            GET : function *(id){
                this.body = id;
            },
            POST : function *(aid){
                this.body = toString.call(aid);
            }
        }
    }
```
