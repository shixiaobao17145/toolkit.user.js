// ==UserScript==
// @name        tookit
// @namespace   bob
// @description tookit
// @include     *
// @version     1
// ==/UserScript==
function log(msg){
	if(window.level=='debug'){
		console.log(msg);
	}
}
function inject(content, type, id) {
	var s = null;
	if (type == 'css') {
		s = document.createElement("style");
		s.type = "text/css";
	} else {
		s = document.createElement("script");
		s.type = "text/javascript";
	}
	if (id)
		s.id = id;
	s.textContent = content;
	//console.log('inject_content:'+content);
	(type=="css"?document.head:document.body).appendChild(s);
}
function addSrcScript(src,callback,arg_str,props) {
  var script = document.createElement("script");
  script.setAttribute("src", src);
  script.addEventListener('load', function() {
    textContent = "(" + callback.toString() + ")("+(arg_str||"")+");";
    inject(textContent);
  }, false);
  script.type = "text/javascript";
  if(props){
  	for(var key in props){
  		script.setAttribute(key,props[key]);
  	};
  }
  document.body.appendChild(script);
}
function loadSrcCss(src,id){
     var cssTag = document.getElementById(id);
     var head = document.getElementsByTagName('head').item(0);
     if(cssTag) head.removeChild(cssTag);
     css = document.createElement('link');
     css.href = src;
     css.rel = 'stylesheet';
     css.type = 'text/css';
     if(id){css.id = id;}
     head.appendChild(css);
}

function globalCallBackWithDojo(executeFuns){
	//这里做你加载完js后的操作
	console.log("加载所需js完毕，开始执行用户自定义脚本");
	console.log(dojo);
	console.log('xxxxxx');
	dojo.addClass(dojo.query('body')[0],'claro');
	dojo.forEach(executeFuns,function(executeFun){
		console.log('执行方法'+executeFun.name);
		executeFun();
	});
	console.log(window.xxxx);
}
// var src = "http://ajax.googleapis.com/ajax/libs/dojo/1.8.1/dojo/dojo.js";//你要引入的js文件
var src = "http://ajax.googleapis.com/ajax/libs/dojo/1.8.3/dojo/dojo.js";//你要引入的js文件
// var src = "http://ajax.googleapis.com/ajax/libs/dojo/1.9.0/dojo/dojo.js";//你要引入的js文件
window.level = 'debug';
if(typeof dojo==="undefined"){//js文件是否正常引入判断
	// var dojoConfigStr = "var dojoConfig = {async: false};"
	// inject(dojoConfigStr);
	// loadSrcCss("http://ajax.googleapis.com/ajax/libs/dojo/1.9.0/dijit/themes/claro/claro.css");//你要引入的css文件
	// loadSrcCss("http://ajax.googleapis.com/ajax/libs/dojo/1.8.1/dijit/themes/claro/claro.css");//你要引入的css文件
	loadSrcCss("http://ajax.googleapis.com/ajax/libs/dojo/1.8.3/dijit/themes/claro/claro.css");//你要引入的css文件
	var requireFuns = [];
	var executeFuns = [];
	if(true||location.href.split('http://account.linkxing.cn/cli/index.php?r=site/syslogs').length==2){
		requireFuns.push(tooltip);
		requireFuns.push(parseIp);
		executeFuns.push(parseIp.name);
	}
	// console.log('requireFuns')
	for(var i=0;i<requireFuns.length;i++){
		inject(requireFuns[i].toString());
	}
	var props = {"data-dojo-config":"async:false"};
	addSrcScript(src,globalCallBackWithDojo,"["+executeFuns.toString()+"]",props);
}else{
	globalCallBackWithDojo(dojo);
}

function parseIp () {
	var ipReg = /((?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d))/g;
	if(!document.body.innerText.match(ipReg)){console.log('have not find ip.');return;}
	document.body.innerHTML = document.body.innerHTML.replace(ipReg,'<span style="color:red" class="ip" id="ip$1">$1</span>');
	function getIps(){
		return dojo.query('.ip');
	}

	function uptIpInfo(node,id,ip,tip){
		require(["dojo/request/script"], function(script){
	    tip = tip||getTipByNode(node);
		var backFunName = 'fYodaoCallBack'+tip.id;
		window[backFunName] = function(code,data){console.log(data);
				//tip = getTipByNode(node);
				tip.show("IP:["+data.ip+"]<br/>来自:"+data.location,node);
		}
		script.get("http://www.youdao.com/smartresult-xml/search.s?jsFlag=true&keyfrom=163.com&type=ip", 
		  	{query:{q:ip,event:backFunName}});
		});
	}

	function getTipByNode(node){
		var tip = dijit.byId(dojo.attr(node,'tipId'))||new dijit.Tooltip._MasterTooltip();
		var tipId = tip.id;
		dojo.attr(node,'tipId',tipId);
		return tip;
	}

	function showIpTip(node){
		var ip = node.innerHTML;
		var id = "ipInfo"+ip;
		var tip = getTipByNode(node);
		tip.show('<span id="'+id+'">正在查询:'+ip
			+"&nbsp;<a><img src='http://dealtao.cn/images/loading.gif'/></a></span>",node);
		tip.on('click',function(){this.hide(node);});
		uptIpInfo(node,id,ip,tip);
	}

	require(['dojo/on','dijit/Tooltip'],function(on,popup,TooltipDialog){
		var ips = getIps();
		ips.forEach(function(node) {
			on(node,'mouseover',function(evt){
				showIpTip(node);
			});
		});
		window.showAll = function(isShow){
			ips.forEach(function(node){
				var tip = getTipByNode(node);
				if(tip){
					if(isShow){showIpTip(node);}else {tip.hide(node);};
				}
			});
		}
	});
}

function tooltip (cfg) {
	require(["dijit/Tooltip", "dojo/domReady!"], function(Tooltip){
	   var tip = new Tooltip(cfg);
	   //if(cfg.connectId)require(["dojo/NodeList-data"],function(){dojo.query(cfg.connectId).data('tooltip',tip);});
	});
}

function tooltipDlg(node,ip){
	var tipDlg = new TooltipDialog({content:'<span id="'+id+'">正在查询:'+node.innerHTML+"&nbsp;<a><img src='http://dealtao.cn/images/loading.gif'/></a></span>"});
}

function gDirectLink (dj) {
	require(["dojo/dom", "dojo/dom-construct", "dojo/domReady!"],function(dom, domConstruct) {
		console.log('sdfsfs');
    	 	dojo.query('li.g h3.r').forEach(function(node){
	 		console.log(dojo.NodeList(node).query('a[href]').attr('href')[0]);
	 		var url = dojo.NodeList(node).query('a[href]').attr('href')[0];
	 		var a = dojo.create('a',{href:url,target:'_blank'});
	 		dojo.create('img',{src:'http://cdn-img.easyicon.net/png/10655/1065580.png'},a,'last');
	 		domConstruct.place(a,node,'last');
	 	});
	});
}
function bdDirectLink (dj) {
	require(["dojo/dom", "dojo/dom-construct", "dojo/domReady!"],function(dom, domConstruct) {
		console.log('sdfsfs');
    	 	dojo.query('li.g h3.r').forEach(function(node){
	 		console.log(dojo.NodeList(node).query('a[href]').attr('href')[0]);
	 		var url = dojo.NodeList(node).query('a[href]').attr('href')[0];
	 		var a = dojo.create('a',{href:url,target:'_blank'});
	 		dojo.create('img',{src:'http://cdn-img.easyicon.net/png/10655/1065580.png'},a,'last');
	 		domConstruct.place(a,node,'last');
	 	});
	});
}
function parseUrlToDirect(url,compare){

}