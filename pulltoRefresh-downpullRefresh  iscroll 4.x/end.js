/*
	thunder network
*/

//common.js

//下载站点动态链接正则表达式
var g_thunderPluginId = "xunlei_com_thunder_helper_plugin_d462f475-c18e-46be-bd10-327458d045bd";

var g_expSina = "http\\:\\/\\/.*sina.com.+\\/d_load\\.php\\?";
var g_expPConline = "http\\:\\/\\/.*pconline.com.+\\/filedown\\.jsp\\?";
var g_expZol = "http\\:\\/\\/.*zol.com.+\\/down\\.php\\?";
var g_expCrsky = "http\\:\\/\\/.*\\/.+\\?down_url=(.+\\:\\/\\/.+)";
var g_expRefix = "http\\:\\/\\/.*\\/.+\\?uri=(.+\\:\\/\\/.+)";
var g_expGougou= "http\\:\\/\\/.*gougou.+\\/.+&url=(.+)";
var g_expReToArray = ["http\\:\\/\\/.+\\/.+\\?uri=(.+\\:\\/\\/.+)",
					"http\\:\\/\\/.+\\/.+\\?uri=(.+\\:\\/\\/.+)"
					];
var g_expIapplez = "http\\:\\/\\/.*iapplez.com.+\\/download\\.php\\?";
var g_expApplex = "http\\:\\/\\/.*www.applex.net\\/publish\\/download\\.php\\?id=";
//var g_expXunleiLixian = "http\\:\\/\\/gdl.lixian.vip.xunlei.com\\/download\\?fid=";


function isSameHost(url,refer_url){
    try{
        if(url.substr(0,6) == 'magnet'){                                                       
            return false;                                                               
        }   

        var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
        var host_url = url.match(re)[1].toString().toLowerCase();
        var host_refer_url = refer_url.match(re)[1].toString().toLowerCase();

        var lastIndex = host_refer_url.lastIndexOf(host_url);
        if((lastIndex != -1) && (lastIndex + host_url.length == host_refer_url.length)){
            return true;
        }
        else{
            lastIndex = host_url.lastIndexOf(host_refer_url);
            if((lastIndex != -1) && (lastIndex + host_refer_url.length == host_url.length)){
                return true;
            }
        }
        return false;
    }catch(e){
        return false;
    }
}

/*
	return false if urs is invalid,else return url
*/
function PreParseURL(url)
{
  //alert(url);
  var bValidate = false;
  bValidate = IsValidateURL(url)
  if( bValidate )
  {
     return url;
  }
		//gougou
		var re = new RegExp(g_expGougou, "i");
		reArray = re.exec(url);
		if( reArray != null && reArray.length == 2 )
		{
			return decodeURIComponent(reArray[1]);
		}
				
		//
		re = new RegExp(g_expSina, "i");
		var reArray = re.exec(url);
		if( reArray != null && reArray.length == 1)
		{
			return url;
		}
		//iapple.com
		re = new RegExp(g_expIapplez, "i");
		var reArray = re.exec(url);
		if( reArray != null && reArray.length == 1)
		{
			return url;
		}
        //applex.net
        re = new RegExp(g_expApplex, "i");
        var reArray = re.exec(url);
        if( reArray != null && reArray.length == 1)
        {
                return url;
        }
		//
		var re = new RegExp(g_expPConline, "i");
		var reArray = re.exec(url);
		if( reArray != null && reArray.length == 1)
		{
			return url;
		}
		//
		re = new RegExp(g_expZol, "i");
		reArray = re.exec(url);
		if( reArray != null && reArray.length == 1)
		{
			return url;
		}
		
		//
		re = new RegExp(g_expCrsky, "i");
		reArray = re.exec(url);
		if( reArray != null && reArray.length == 2 )
		{
			return url;
		}
				
		//
		re = new RegExp(g_expRefix, "i");
		reArray = re.exec(url);
		if( reArray != null && reArray.length == 2 )
		{
			//alert(reArray[1]);
			bValidate = IsValidateURL(reArray[1]);
			if( bValidate )
			{
				return reArray[1];
			}
		}
		
}
/*
	URL
*/
function IsValidateURL(url){
	var plugin = document.getElementById(g_thunderPluginId);
	if(plugin != null){
		return plugin.IsUrlSupported(url);
	}
	return false;
}

//--end common.js--
var g_isUndetectedUrl = false;
var g_isUndetectWithCommandKey = true; //command + click 不监视
var g_isCommandKeyPressed = false;
var g_isBrowserDetectEnabled = true;//

//handle command key	
function OnWindowKeyDown(event){
	var unicode=event.charCode ? event.charCode : event.keyCode;
	if(unicode == 91) //chrome:COMMAND
	{
		g_isCommandKeyPressed = true;
	}
}
window.document.onkeydown=OnWindowKeyDown;

function OnWindowKeyUp(event){
	var unicode=event.charCode ? event.charCode : event.keyCode;
	if(unicode == 91){
		g_isCommandKeyPressed = false;
  }
}
window.document.onkeyup=OnWindowKeyUp;

//context menu
function handleContextMenu(event){
	
  var tagName = event.target.tagName.toLowerCase();
  if(tagName == "a"){
  	url = event.target.href;
  }
  else{
  	url = null;
  }
  var userInfo = {"url":url,"pageUrl":document.location.href};

  safari.self.tab.setContextMenuEventUserInfo(event, userInfo);
}

document.addEventListener("contextmenu", handleContextMenu, false);

//Plugin object
var e = document.createElement("embed");
e.id = g_thunderPluginId;
e.type = "application/thunder_download_plugin";
e.height = "0";
e.width = "0";

document.body.appendChild(e);

if(window.top === window){//filter iframe
    safari.self.addEventListener("message", handleMessage, true);
}

function handleMessage(msg)
{
    if(msg.name === "MSG_DOWNLOAD_BY_THUNDER"){
   	  var plugin = document.getElementById(g_thunderPluginId);
   	  if(plugin != null){
   	  	var url = msg.message.url;
   	  	var refer_url = msg.message.pageUrl;
                var cookie = document.cookie;
                //alert(cookie);
                if(!isSameHost(url,refer_url)){
                    cookie = '';
                }
   	  	plugin.Download(url,refer_url,cookie);
                return false;
   	  }
   	  else{
   	  }
   }
}

//read config
function readConfig(){
    var plugin = document.getElementById(g_thunderPluginId);
    if(plugin != null){
        //读取配置信息:command + click 是否监视
        g_isUndetectWithCommandKey = plugin.IsCommandKeyUndetectEnable();
        g_isBrowserDetectEnabled = plugin.IsBrowserDetectEnabled();
        var pageUrl = document.location.href;
        g_isUndetectedUrl = plugin.IsUndetectedUrl(pageUrl);
    }
}


function isHookDownload(){
    //读取配置信息:command + click 是否监视
	//alert('g_isUndetectedUrl = ' + g_isUndetectedUrl + ' g_isBrowserDetectEnabled = ' + g_isBrowserDetectEnabled);
    
    //safari更新到7.0后，这一句不能放在全局区域直接调用，放在外面调用plugin.IsCommandKeyUndetectEnable();会有undefined的异常
    readConfig();
	if(g_isUndetectedUrl === true || g_isBrowserDetectEnabled === false || g_isCommandKeyPressed && g_isUndetectWithCommandKey)
	{
		return false;
	}
	return true;
}

function downloadByThunderImpl(url,referer){
	if(!isHookDownload()){
	    return false;
	}
	
	var theURL = PreParseURL(url);
	if(theURL)
	{
        var refer_url = referer;
        if(referer == false){
            refer_url = document.location.href;
        }
        var cookie = document.cookie;
		var plugin = document.getElementById(g_thunderPluginId);
		if(plugin != null){
            if(!isSameHost(url,refer_url)){
                cookie = '';
            }
		    return plugin.Download(url,refer_url,cookie);
		}
	}
	return false;
}

function downloadByThunder(url){
    return downloadByThunderImpl(url,false);
}

document.addEventListener("click", onDocClick, false);
function onDocClick(event)
{
	var e = event.target ? event.target : event.srcElement;
	if(e.nodeName.toUpperCase() != "A"){
		e = e.parentNode;
	}
	
	if(e.nodeName.toUpperCase() == "A"){
		var url = e.href;
		var thunderHref = e.getAttribute("thunderHref");
		if(thunderHref != null){
			url = thunderHref;
		}
        var ret = downloadByThunder(url);
        if(ret){
            event.preventDefault();
        }
        else{
        }
	}
}

