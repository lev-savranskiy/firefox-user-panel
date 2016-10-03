var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

newAPI=false;

try{
    Components.utils.import("resource://gre/modules/FileUtils.jsm");
    newAPI = true;
}catch(e){

}finally{
    alert('[newAPI used = ' + newAPI + ']');
}


var upanel_tempfile = null;
var tcbutton;
var tcmeter;
var tcfield;
//var googbutton;
//var googmeter;
//var googfield;
var icbutton;
var icmeter;
var icfield;
//var sdbutton;
//var sdmeter;
//var sdfield;
//var dcbutton;
//var dcmeter;
//var dcfield;
var businessmeter;
var businessfield;

var cookieDomain = 'redaril.com';


function debug(aMessage) {
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage(aMessage);
}
var upanel_last = {};
var upanel_nebuadbatch = {cur_refr: 0, flag: false, filein: null, fileout: null, url: null, freq: 0, num: 0, refr: 1, cdir: null, snum: 1, seq: 0};
var upanel_pixels = {
    0: "http://ad.yieldmanager.com/pixel?id=57778&t=1",
    1: "http://ad.interclick.com/pixel?id=62209&t=2",
    2: "http://www.burstnet.com/enlightn/2144//4C36/",
    3: "http://popunder.adtrgt.com/ad_target.jsp?domain=www.nebuad.com&ttl=90&kw=nebuad1&rnd={TIME}",
    4: "http://adserving.cpxinteractive.com/pixel?id=92687&t=2",
    5: "http://am.trafficmp.com/a/bpix?adv=344&id=1",
    6: "http://ad.iconadserver.com/pixel?id=96356&t=2",
    7: "http://network.realmedia.com/RealMedia/ads/adstream_nx.ads/TRACK_Nebuad/Retarget_Landingpage_Nonsecure@Bottom3",
    8: "http://media.fastclick.net/rt?cn1=urt53&v1=2",
    9: "https://bh.contextweb.com/bh/set.aspx?action=replace&advid=711&token=NEBU1",
    10: "http://ad.doubleclick.net/activity;src=1702497;dcnet=4591;boom=1;sz=1x1;ord=",
    11: "http://ads.addynamix.com/category/1-1-0-28183?",
    12: "http://ads.addynamix.com/category/1-1-1",
    13: "http://fetchback.com/serve/fb/pdc?cat=&name=InitialCampaign&sid=367",
    14: "http://beacon.afy11.net/ad?mode=4&ac=0&av=4162&rand={random}",
    15: "http://ad.ad-flow.com/pixel?id=102448&t=2"
};
var upanel_backgroundchecker = {flag: null, seq: -1};

function getP(res) {
    return (res["W"] / 12.0).toFixed(2);
}

function classify() {

    debug('[classify]');
    debug('[tcbutton.disabled] ' + tcbutton.disabled);
    debug(1111);
    if (!checkContent() || tcbutton.disabled) {

        return;
    }
    debug(222);
    tcbutton.disabled = true;
    upanel_last["TC"] = null;
    try {
        debug(1);
        var doc = top.window.getBrowser().contentDocument;
        var out = {};
        if (findFrames(doc, out) == true) {
            doc = frames_confirm(out, doc);
            if (doc == null) {
                tcfield.value = "Frameset detected. Document wasn't classified.";
                tcbutton.disabled = false;
                return;
            }
        }
        debug(2);
        var filename = upanel_tempfile + ".tc.tmp";
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);
        file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
        //  var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist);
        // persist.saveDocument(doc, file, null, "text/html; charset=cp1251", 0, null);
        var prefix;
        debug(3);
        var proc = {
            start: function start() {
                tcbutton.disabled = true;
                tcfield.value = "";
                tcfield.hidden = true;
                tcmeter.hidden = false;
            },
            end: function end(str) {
                tcfield.value = standartParser.parseResponse(str, true, "TC");
                tcmeter.hidden = true;
                tcfield.hidden = false;
                tcbutton.disabled = false;
            },
            error: function error(str) {
                tcfield.value = str;
                tcmeter.hidden = true;
                tcfield.hidden = false;
                tcbutton.disabled = false;
            }
        };
        debug(4);
        if (prefs.getBoolPref("qbuilder.stc")) {
            debug(51);
            prefix = "TCclassifyByContentSpecific\t" + prefs.getCharPref("qbuilder.stcip") + ":" + prefs.getCharPref("qbuilder.stcport") + "\t" + top.window.getBrowser().currentURI.spec + "\t";
            classifyFile(prefix, filename, false, proc, prefs.getCharPref("qbuilder.serviceip"), prefs.getCharPref("qbuilder.serviceport"));
        } else {
            debug(52);
            prefix = "TCclassifyByContent\t" + top.window.getBrowser().currentURI.spec + "\t";
            classifyFile(prefix, filename, false, proc, prefs.getCharPref("qbuilder.serviceip"), prefs.getCharPref("qbuilder.serviceport"));
        }
    } catch (excep) {
        Components.utils.reportError("Exception in classify: " + excep);
    }
}

function upanel_selectall() {
    goDoCommand("cmd_selectAll");
    goDoCommand("cmd_copy");
    var clipboard = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
    trans.addDataFlavor("text/unicode");
    if (clipboard.supportsSelectionClipboard())
        clipboard.getData(trans, clipboard.kSelectionClipboard);
    else
        clipboard.getData(trans, clipboard.kGlobalClipboard);
    var data = {};
    var dataLen = {};
    trans.getTransferData("text/unicode", data, dataLen);
    if (data) {
        data = data.value.QueryInterface(Components.interfaces.nsISupportsString);
        return data.data.substring(0, dataLen.value / 2);
    }
    return null;
}

function upanel_log(str) {
    var date = (new Date()).getTime();
    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    //  file.initWithPath("/root/oleg/page_reports/log.txt");
    file.initWithPath("C:\\\\logs\\upanelog.txt");
    var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
    outputStream.init(file, 0x02 | 0x08 | 0x10, 420, 0);
    dstr = date + "";
    outputStream.write(dstr + ": " + str + "\n", str.length + dstr.length + 3);
    outputStream.close();
}

function upanel_checkBatch() {
    if (upanel_backgroundchecker.seq == upanel_nebuadbatch.seq) {
        if (upanel_backgroundchecker.flag != true) {
            upanel_backgroundchecker.flag = true;
            //upanel_log("Stop");
            top.window.getBrowser().stop();
            setTimeout("upanel_checkBatch();", 10000);
        } else {
            var a = Components.interfaces.nsIAppStartup;
            Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(a).quit(a.eForceQuit);
        }
    } else {
        upanel_backgroundchecker.seq = upanel_nebuadbatch.seq;
        upanel_backgroundchecker.flag = false;
        setTimeout("upanel_checkBatch();", 10000);
    }
}


var listener = {
    stopButton: null,
    handleEvent: function handleEvent(aEvent) {
        switch (aEvent.type) {
            case "load":
                break;
            case "unload":
                this.stopButton.removeEventListener('DOMAttrModified', this, false);
                break;
            case "DOMAttrModified":
                if (aEvent.attrName == "disabled" && this.stopButton.getAttribute("disabled") == "true" && upanel_nebuadbatch.flag) {
                    this.stopButton.removeEventListener('DOMAttrModified', this, false);
                    upanel_nebuadbatch.seq++;
                    addNebuadBatch();
                    this.stopButton.addEventListener("DOMAttrModified", this, false);
                    break;
                }
                if (aEvent.attrName == "disabled" && this.stopButton.getAttribute("disabled") == "true") {
                    var url = top.window.getBrowser().currentURI.spec;
                    var pos;
                    pos = url.indexOf("upanel_input_file");
                    if (pos >= 0) {
                        var input = (upanel_selectall()).split("\n");
                        setTimeout("findNebuadBatch('" + input[0] + "','" + input[1] + "','" + input[2] + "','" + input[3] + "','" + input[4] + "'," + input[5] + ");", 1000);
                        setTimeout("upanel_checkBatch();", 15000);
                        break;
                    }
                }
                if (aEvent.attrName == "disabled") {
                    if (this.stopButton.getAttribute("disabled") == "true" && prefs.getBoolPref("qbuilder.auto")) {
                        produce("ALL");
                    }
                    if (this.stopButton.getAttribute("disabled") == "true" && prefs.getBoolPref("qbuilder.track")) {
                        feed();
                        userModeler();
                    }
//          if (this.stopButton.getAttribute("disabled")=="true"&&prefs.getBoolPref("qbuilder.saveclicks"))
//              upanel_saveClick(aEvent);
                }
                break;
        }
    }
};


var cookieParser = {
    parseResponseAndUpdateCookie: function parseResponseAndUpdateCookie(str) {
        var ios = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService);
        var cookieUri = ios.newURI("http://." + cookieDomain + "/", null, null);
        var cookieSvc = Components.classes["@mozilla.org/cookieService;1"]
            .getService(Components.interfaces.nsICookieService);

        var parts = str.split(';;;');
        var i;
        for (i = 0; i < parts.length; i++) {
            if (parts[i].length == 0) {
                continue;
            }
            if (parts[i].indexOf('=') == -1) {
                continue;
            }
            // var nv = parts[i].split('=');
            // log('NAME:'+nv[0]+' - VALUE:'+nv[1]);
            // log('Setting cookie: '+parts[i]);
            cookieSvc.setCookieString(cookieUri, null, parts[i] + ";domain=."
                + cookieDomain + ";expires=Sun, 23 Sep 2010 20:00:11 UTC",
                null);
        }
    }
};


var standartParser = {
    parseResponse: function parseResponse(str, isfirst, ident) {
        var res = {};
        var result = "";
        if (str == "-")
            return null;
        var value = "";
        var name = "";
        var i;
        var last = -1;
        var val_flag = true;
        for (i = str.length - 1; i >= 0; i--) {
            if (str[i] == '\n') {
                if (last > -1) {
                    res["NAME"] = str.substring(i + 1, last);
                    if (result == "")
                        result = res["NAME"] + " (P=" + getP(res) + ")";
                    else
                        result = res["NAME"] + " (P=" + getP(res) + ")\n" + result;
                    res = {};
                    val_flag = true;
                    name = "";
                    value = "";
                }
            } else if (val_flag && str[i] != '=')
                value = str[i] + value;
            else if (str[i] == '=') {
                val_flag = false;
            } else if (!val_flag && str[i] != ' ')
                name = str[i] + name;
            else if (!val_flag && str[i] == ' ') {
                val_flag = true;
                res[name] = value;
                name = "";
                value = "";
                last = i;
            }
        }
        value = "";
        if (isfirst) {
            for (i = 0; i < last; i++)
                if (str[i] != ' ')
                    value += str[i];
                else {
                    res["ID"] = value;
                    upanel_last[ident] = value;
                    res["NAME"] = str.substring(i + 1, last);
                    break;
                }
        } else
            res["NAME"] = str.substring(0, last);
        if (result == "")
            result = res["NAME"]/*+" (P="+res["W"]+")"*/;
        else
            result = res["NAME"]/*+" (P="+res["W"]+")\n"+result*/;
        return result;
    }
};


var umParser = {
    getString: function getString(num) {
        var result = "";
        var i = 0;


        for (i = 0; i < (127 / 2); i++)
            if (i < num / 2)
                result += "|";
            else
                result += ".";
        return result + " ";

    },
    parseResponse: function parseResponse(str, isfirst) {
        var res = {};
        var result = "";
        if (str == "-")
            return null;
        var value = "";
        var name = "";
        var i;
        var last = -1;
        var val_flag = true;
        for (i = str.length - 1; i >= 0; i--) {
            if (str[i] == '\n') {
                if (last > -1) {
                    res["NAME"] = str.substring(i + 1, last);
                    if (result == "")
                        result = this.getString(res["W"]) + res["NAME"] + " (P=" + getP(res) + ")";
                    else
                        result = this.getString(res["W"]) + res["NAME"] + " (P=" + getP(res) + ")\n" + result;
                    res = {};
                    val_flag = true;
                    name = "";
                    value = "";
                }
            } else if (val_flag && str[i] != '=')
                value = str[i] + value;
            else if (str[i] == '=') {
                val_flag = false;
            } else if (!val_flag && str[i] != ' ')
                name = str[i] + name;
            else if (!val_flag && str[i] == ' ') {
                val_flag = true;
                res[name] = value;
                name = "";
                value = "";
                last = i;
            }
        }
        value = "";
        if (isfirst) {
            for (i = 0; i < last; i++)
                if (str[i] != ' ')
                    value += str[i];
                else {
                    res["ID"] = value;
                    res["NAME"] = str.substring(i + 1, last);
                    break;
                }
        } else
            res["NAME"] = str.substring(0, last);

        if (result == "") {
            result = this.getString(res["W"]) + res["NAME"] + " (P=" + getP(res) + ")";
            //result=this.getString(res["W"])+res["NAME"]+" (P="+res["W"]+")"; <<<< ORIG PROB
        }
        else {
            result = this.getString(res["W"]) + res["NAME"] + " (P=" + getP(res) + ")\n" + result;
            //result=this.getString(res["W"])+res["NAME"]+" (P="+res["W"]+")\n"+result; <<< ORIG PROB
        }
        return result;
    }
};

var nebuad_firstload_flag = true;


function upanel_absPosition(obj) {
    var x = y = 0;
    while (obj) {
        x += obj.offsetLeft;
        y += obj.offsetTop;
        obj = obj.offsetParent;
    }
    return {x: x, y: y};
}
//          var t=upanel_absPosition(it);
//          log(t.x+" "+t.y);

function upanel_loadPrefs(myevent) {
    setDummyCookie();
    try {
        if (nebuad_firstload_flag == true) {
            nebuad_firstload_flag = false;
            //window.removeEventListener("load", upanel_loadPrefs, true);
        } else {
            userModeler();
            return;
        }

        listener.stopButton = document.getElementById("stop-button");
        listener.stopButton.addEventListener("DOMAttrModified", listener, false);
        //document.getElementById("qsettings-setproxy").checked=prefs.getBoolPref("qbuilder.setproxy");
        //setCerterProxy();
        var cu = prefs.getIntPref("qbuilder.cu");
        if (cu == 0) {
            cu = Math.round(Math.random() * 1000000000);
            prefs.setIntPref("qbuilder.cu", cu);
        }
        //document.getElementById("qsettings-saveclicks").checked=prefs.getBoolPref("qbuilder.saveclicks");
        document.getElementById("qsettings-auto").checked = prefs.getBoolPref("qbuilder.auto");
        document.getElementById("qsettings-track").checked = prefs.getBoolPref("qbuilder.track");
        document.getElementById("qsettings-um").checked = prefs.getBoolPref("qbuilder.umpanel");
        if (document.getElementById("qsettings-um").checked)
            document.getElementById("user-modeling").hidden = false;
        tcbutton = document.getElementById("qualifiers-tc-button");
        tcmeter = document.getElementById("qualifiers-tc-meter");
        tcfield = document.getElementById("qualifiers-tc-field");
        //googbutton=document.getElementById("qualifiers-goog-button");     
        //googmeter=document.getElementById("qualifiers-goog-meter");       
        //googfield=document.getElementById("qualifiers-goog-field");       
        icbutton = document.getElementById("qualifiers-ic-button");
        icmeter = document.getElementById("qualifiers-ic-meter");
        icfield = document.getElementById("qualifiers-ic-field");
        //sdbutton=document.getElementById("qualifiers-sd-button");     
        //sdmeter=document.getElementById("qualifiers-sd-meter");       
        //sdfield=document.getElementById("qualifiers-sd-field");       
        //dcbutton=document.getElementById("qualifiers-dc-button");
        //dcmeter=document.getElementById("qualifiers-dc-meter");       
        //dcfield=document.getElementById("qualifiers-dc-field");       
        businessmeter = document.getElementById("qualifiers-business-meter");
        businessfield = document.getElementById("qualifiers-business-text");

        upanel_selectToolbars();
        var DIRSVC = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
        var file = DIRSVC.get("ProfD", Components.interfaces.nsIFile);
        // file.append("extensions");
        file.append("upanel@coreaudience");
        if (!file.exists()) {
            file.create("ProfD", ["upanel@coreaudience"], true);
            var msg = '[upanel@coreaudience] created in Firefox Profile folder!';
            alert(msg)

            //file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
            debug(msg);
        }
        file.append("temp");
        upanel_tempfile = file.path;
        userModeler();
    } catch (except) {
        Components.utils.reportError("Exception in loadPrefs: " + except);
    }
}

function setAutoProc() {
    prefs.setBoolPref("qbuilder.auto", document.getElementById("qsettings-auto").checked);
}

function setTrack() {
    prefs.setBoolPref("qbuilder.track", document.getElementById("qsettings-track").checked);
}


function setUMShow() {
    prefs.setBoolPref("qbuilder.umpanel", document.getElementById("qsettings-um").checked);
    if (document.getElementById("qsettings-um").checked) {
        document.getElementById("user-modeling").hidden = false;
    } else
        document.getElementById("user-modeling").hidden = true;
}


function getText(doc, excl, ret) {
    try {
        if (ret != null && ret.num == null) {
            ret.num = 0;
            ret.max = 0;
            ret.len = 0;
        }
        if (doc == null)
            return "";
        if (doc.parentNode != null && (doc.parentNode.nodeName == "SCRIPT" || doc.parentNode.nodeName == "STYLE"))
            return "";
        var i = 0, it = null, res = "", res1;
        if (doc.nodeName == "#text" && doc.data != null && doc.data != "" && doc.data != excl) {
            res = doc.data;
            if (ret != null) {
                ret.num++;
                ret.len += res.length;
                if (res.length > ret.max)
                    ret.max = res.length;
            }
        }
        if (doc.childNodes != null && doc.lastChild != null)
            while (true) {
                it = doc.childNodes.item(i);
                res1 = getText(it, excl, ret);
                if (res1 != "" && res != "")
                    res += " ";
                res += res1;
                if (doc.lastChild == it)
                    break;
                i++;
            }
        if (doc.contentDocument != null) {
            res1 = getText(doc.contentDocument, excl, ret);
            if (res1 != "" && res != "")
                res += " ";
            res += res1;
        }
        return res;
    } catch (excep) {
        return "";
        //log("Exception in getText: "+except);
    }
}


function findFrames(doc, out) {
    if (!prefs.getBoolPref("qbuilder.framew"))
        return false;
    try {
        var i = 0, it = null;
        var flag = false;
        if (doc.childNodes != null)
            while ((it = doc.childNodes.item(i)) != null) {
                if (it.nodeName == "FRAME") {
                    //log(it.src+" "+it.name+" "+it.contentDocument);
                    out[it.src + " " + it.name] = it.contentDocument;
                    flag = true;//return true;
                }
                if (findFrames(it, out) == true)
                    flag = true;
                i++;
            }
        return flag;
    } catch (except) {
        return false;
        //log("Exception in findFrames: "+except);
    }
}

function checkContent() {
    var getBrowser = top.window.getBrowser();
    var checkContent = true;
    debug('checkContent ');

    if (getBrowser.contentDocument == null){
        debug('no contentDocument');
        return false;
    }

    if (getBrowser.currentURI == null){
        debug('no currentURI');
        return false;
    }

    if (getBrowser.currentURI.spec == null){
        debug(' currentURI spec is null');
        return false;
    }

    if (getBrowser.currentURI.spec == ""){
        debug(' currentURI spec is empty');
        return false;
    }

    if (getBrowser.currentURI.spec == "about:blank") {
        debug(' currentURI spec is about:blank');
        return false;
    }
    debug('OK!');
    return true;
}


function feed() {
    var prefix = "CFsendCookieFeed\t" + getCurrentUri() + "\t" + getCookie();//prefs.getIntPref("qbuilder.cu");
    var proc = {
        start: function start() {
        },
        end: function end(str) {
            /*  HERE WE HAVE TO SEPARATE THE COOKIES AND UPDATE THEM  */
            cookieParser.parseResponseAndUpdateCookie(str);

        },
        error: function error(str) {
        }
    };
    classifyFile(prefix, null, false, proc, prefs.getCharPref("qbuilder.serviceip"), prefs.getCharPref("qbuilder.serviceport"));
}


function getCurrentUri() {
    var res = top.window.getBrowser().currentURI.spec;
    res = escape(res);
    return res;
}

function qualify() {

    debug('[qualify]');

    if (!checkContent() || icbutton.disabled){
        debug('ERROR no checkContent');
        return;
    }
    if (top.window.getBrowser().currentURI == null || top.window.getBrowser().currentURI.host == null ){
        debug('ERROR currentURI host is NULL');
        return;
    }
    debug(1);

    upanel_last["IC"] = null;
    icbutton.disabled = true;
    debug(2);
    try {
        var prefix = "ICclassifyDataSimple\t" + getCurrentUri() + "\t" + top.window.getBrowser().contentTitle + "\t" + top.window.getBrowser().currentURI.host + "\t200\t*null&\t*null&";

        debug(3);
        var proc = {
            start: function start() {
                icbutton.disabled = true;
                icfield.value = "";
                icfield.hidden = true;
                icmeter.hidden = false;
            },
            end: function end(str) {
                icfield.value = standartParser.parseResponse(str, true, "IC");
                icmeter.hidden = true;
                icfield.hidden = false;
                icbutton.disabled = false;
            },
            error: function error(str) {
                icfield.value = str;
                icmeter.hidden = true;
                icfield.hidden = false;
                icbutton.disabled = false;
            }
        };
        debug(4);
        classifyFile(prefix, null, false, proc, prefs.getCharPref("qbuilder.serviceip"), prefs.getCharPref("qbuilder.serviceport"));
    } catch (except) {
        Components.utils.reportError("Exception in qualify: " + except);
    }
}


function frames_confirm(out, doc) {
    var obj = {};
    window.openDialog("chrome://upanel/content/frames.xul", "", "chrome, dialog, modal", doc, out, obj);
    if (obj.reply == false)
        return null;
    else
        return obj.doc;
}


function megaclassify() {
//  var flag = prefs.getBoolPref("qbuilder.researchmode");
    if (!checkContent() || /*dcbutton.disabled||*/
        tcbutton.disabled || icbutton.disabled || /*sdbutton.disabled||*/
        document.getElementById("qualifiers-all-button").disabled)
        return;
    //document.getElementById("qualifiers-demolabel").value="";
    //dcbutton.disabled=true;
    tcbutton.disabled = true;
    icbutton.disabled = true;
    //sdbutton.disabled=true;
    //upanel_last["DC"]=null;
    upanel_last["TC"] = null;
    upanel_last["IC"] = null;
    //upanel_last["SD"]=null;
    try {
        var doc = top.window.getBrowser().contentDocument;
        var out = {};
        if (findFrames(doc, out) == true) {
            doc = frames_confirm(out, doc);
            if (doc == null) {
                //dcfield.value="Frameset detected. Document wasn't classified.";
                //dcbutton.disabled=false;
                tcfield.value = "Frameset detected. Document wasn't classified.";
                tcbutton.disabled = false;
                icfield.value = "Frameset detected. Document wasn't classified.";
                icbutton.disabled = false;
                //sdfield.value="Frameset detected. Document wasn't classified.";
                //sdbutton.disabled=false;
                //googbutton.disabled=false;
                return;
            }
        }
        var filename = upanel_tempfile + ".fc.tmp";
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);
        var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist);
        persist.saveDocument(doc, file, null, "text/html; charset=cp1251", 0, null);
        var prefix = "FCclassify\t" + top.window.getBrowser().currentURI.spec + "\t" + top.window.getBrowser().contentTitle + "\t" + top.window.getBrowser().currentURI.host + "\t200\t*null&\t*null&\t";
        var proc = {
            start: function start() {
                document.getElementById("qualifiers-all-button").disabled = true;
                //dcbutton.disabled=true;
                //dcfield.value="";
                //dcfield.hidden=true;
                //dcmeter.hidden=!flag;
                tcbutton.disabled = true;
                tcfield.value = "";
                tcfield.hidden = true;
                tcmeter.hidden = false;
                icbutton.disabled = true;
                icfield.value = "";
                icfield.hidden = true;
                icmeter.hidden = false;
                //sdbutton.disabled=true;
                //sdfield.value="";
                //sdfield.hidden=true;
                //sdmeter.hidden=false;
                businessfield.hidden = true;
                businessmeter.hidden = false;
            },
            end: function end(str) {
                var arr = str.split("\n\n");
                //dcfield.value=dcParser.parseResponse(arr[2],"DC");
                //dcmeter.hidden=true;
                //dcfield.hidden=!flag;
                //dcbutton.disabled=false;
                tcfield.value = standartParser.parseResponse(arr[1], true, "TC");
                tcmeter.hidden = true;
                tcfield.hidden = false;
                tcbutton.disabled = false;
                icfield.value = standartParser.parseResponse(arr[0], true, "IC");
                icmeter.hidden = true;
                icfield.hidden = false;
                icbutton.disabled = false;
                //sdfield.value=standartParser.parseResponse(arr[3],true,"SD");
                //sdmeter.hidden=true;
                //sdfield.hidden=false;
                //sdbutton.disabled=false;
                businessmeter.hidden = true;
                //while(googbutton.disabled) {}
                businessfield.value = "Text Classifier:		" + tcfield.value + "\n" + "URL Classifier:			" + icfield.value
                    /*+"\nSite-Driver Classifier:	"+sdfield.value+"\nGoogle Ads Classifier:	"+googfield.value+"\nGender Classifier:		"+dcParser.gender*/;
                businessfield.hidden = false;

                document.getElementById("qualifiers-all-button").disabled = false;
            },
            error: function error(str) {
                //dcfield.value=str;
                //dcmeter.hidden=true;
                //dcfield.hidden=!flag;
                //dcbutton.disabled=false;
                tcfield.value = str;
                tcmeter.hidden = true;
                tcfield.hidden = false;
                tcbutton.disabled = false;
                icfield.value = str;
                icmeter.hidden = true;
                icfield.hidden = false;
                icbutton.disabled = false;
                //sdfield.value=str;
                //sdmeter.hidden=true;
                //sdfield.hidden=false;
                //sdbutton.disabled=false;
                businessmeter.hidden = true;
                businessfield.hidden = false;
                businessfield.value = str;
                document.getElementById("qualifiers-all-button").disabled = false;
            }
        };
        classifyFile(prefix, filename, true, proc, prefs.getCharPref("qbuilder.serviceip"), prefs.getCharPref("qbuilder.serviceport"));
    } catch (excep) {
        Components.utils.reportError("Exception in mega classify: " + excep);
    }
}

function upanel_accept(id, state) {
    var user = prefs.getCharPref("qbuilder.uname");
    if (user == "") {
        debug("Please specify your name (Settings->User Name)");
        return;
    }
    if (upanel_last[id] != null)
        if (state == null)
            classifyFile("MSsendFeedbackSimple\t" + upanel_last[id] + "\t" + user + "\ttrue", null, false, null, prefs.getCharPref("qbuilder.serviceip"), prefs.getCharPref("qbuilder.serviceport"));
        else
            classifyFile("MSsendFeedbackSimple\t" + upanel_last[id] + "\t" + user + "\t" + state, null, false, null, prefs.getCharPref("qbuilder.serviceip"), prefs.getCharPref("qbuilder.serviceport"));
}

function upanel_reject(id) {
    upanel_accept(id, false);
}

function upanel_rejectComment(id) {
    var obj = {};
    var user = prefs.getCharPref("qbuilder.uname");
    if (user == "") {
        debug("Please specify your name (Settings->User Name)");
        return;
    }
    try {
        if (upanel_last[id] != null) {
            window.openDialog("chrome://upanel/content/category.xul", "", "chrome, dialog, modal", obj);
            if (obj.ok != null) {
                classifyFile("MSsendFeedbackFull\t" + upanel_last[id] + "\t" + user + "\tfalse\t" + obj.response, null, false, null, prefs.getCharPref("qbuilder.serviceip"), prefs.getCharPref("qbuilder.serviceport"));
            }
        }
    } catch (excep) {
    }
}

function findNebuad(doc, gres, coord) {
    var i = 0, it = null;
    if (gres.pageh == null) {
        if (doc == null || doc.body == null) {
            gres.pagew = 0;
            gres.pageh = 0;
        } else {
            gres.pagew = 0;//doc.scrollWidth;
            gres.pageh = 0;//doc.scrollHeight;
        }
        gres.nb_count = 0;
        gres.nb_ads = {};
        gres.pict_num = 0;
        gres.pict_area = 0;
        gres.picts = {};
        gres.links = 0;
        gres.maxx = doc.offsetWidth;
        gres.maxy = doc.offsetHeight;
    }
    if (coord == null) {
        coord = {x: 0, y: 0};
    }
    try {
        if (doc == null)
            return;
        if (doc.childNodes != null && doc.lastChild != null)
            while (true) {
                try {
                    it = doc.childNodes.item(i);
                } catch (exx) {
                    return;
                }
                var c;
                if (it != null) {
                    c = upanel_absPosition(it);
                    if (coord.x + c.x + it.clientWidth > gres.maxx)
                        gres.maxx = coord.x + c.x + it.clientWidth;
                    if (coord.y + c.y + it.clientHeight > gres.maxy) {
                        gres.maxy = coord.y + c.y + it.clientHeight;
                        //log(it.nodeName+" "+gres.maxy+" "+it.clientHeight);
                    }
                }
                if (it != null && it.nodeName == "IFRAME" && it.src.indexOf("http://a.faireagle.com") == 0) {
                    if (it.offsetWidth > 5) {
                        gres.nb_ads[gres.nb_count] = {x: coord.x + c.x, y: coord.y + c.y, w: it.offsetWidth, h: it.offsetHeight, url: it.src};
                        gres.nb_count++;
                    }
                    findNebuad(it, gres, coord);
                } else if (it != null && (it.nodeName == "IMG" || it.nodeName == "EMBED")) {
                    gres.picts[gres.pict_num] = {x: coord.x + c.x, y: coord.y + c.y, w: it.offsetWidth, h: it.offsetHeight, url: it.src};
                    gres.pict_num++;
                    gres.pict_area += it.offsetWidth * it.offsetHeight;
                } else if (it != null && it.nodeName == "A" && it.href != null) {
                    if (c.x > 0 || c.y > 0)
                        gres.links++;
                    findNebuad(it, gres, coord);
                }
                else
                    findNebuad(it, gres, coord);
                i++;
                if (doc.lastChild == it)
                    break;
            }
        if (doc.contentDocument != null) {
            var c1 = upanel_absPosition(doc);
            findNebuad(doc.contentDocument, gres, {x: coord.x + c1.x, y: coord.y + c1.y});
        }
        return;
    } catch (except) {
        return;
        //log("Exception in findGoogle: "+except);
    }
}

function addNebuadBatch() {
    try {
        var good = false;
        if (upanel_nebuadbatch.pixelstage < 0 && upanel_nebuadbatch.url != "about:blank") {
            var s = {};
            var date = (new Date()).getTime();
            //upanel_log("Checking: "+upanel_nebuadbatch.url);
            findNebuad(top.window.getBrowser().contentDocument, s);
            var load_time = date - upanel_nebuadbatch.time;
            var g = upanel_printNebuad(s, true);
            if (s.nb_count > 0 || upanel_nebuadbatch.cur_refr == upanel_nebuadbatch.refr) {
                upanel_nebuadbatch.num++;
                var str = upanel_nebuadbatch.num + "	" + upanel_nebuadbatch.url + "	" + upanel_nebuadbatch.cur_refr + "	" + load_time + "	" + g + "\n";
                upanel_nebuadbatch.fileout.write(str, str.length);
                //upanel_log("Logging: "+upanel_nebuadbatch.url+" "+top.window.getBrowser().currentURI.spec);
                upanel_nebuadbatch.cur_refr = 1;
                good = true;
            } else {
                upanel_nebuadbatch.cur_refr++;
                upanel_nebuadbatch.time = (new Date()).getTime();
                //upanel_log("Reload: "+upanel_nebuadbatch.url);
                top.window.getBrowser().reloadWithFlags(256);
                return;
            }
        }
        var line = {};
        line.value = null;
        if (upanel_nebuadbatch.pixelstage == 16) {
            upanel_nebuadbatch.filein.readLine(line);
            //prefs.setCharPref("general.useragent.override","Teleport");
            prefs.setIntPref("network.http.sendRefererHeader", 0);
            upanel_nebuadbatch.pixelstage = -1;
        } else if (upanel_nebuadbatch.pixelstage > 0) {
            line.value = upanel_pixels[upanel_nebuadbatch.pixelstage];
            if (upanel_nebuadbatch.pixelstage == 10)
                line.value += Math.random() * 10000000000000000 + "?";
            upanel_nebuadbatch.pixelstage++;
        } else {
            if (upanel_nebuadbatch.num % upanel_nebuadbatch.freq == 0) {
                upanel_deleteCookies();
                upanel_nebuadbatch.pixelstage = 1;
                line.value = upanel_pixels[0];
                prefs.setIntPref("network.http.sendRefererHeader", 2);
                //if (prefs.prefHasUserValue("general.useragent.override"))
                //  prefs.clearUserPref("general.useragent.override");
            } else {
                if (good)
                    line.value = "about:blank";
                else
                    upanel_nebuadbatch.filein.readLine(line);
            }
        }
        if (line.value != null && line.value != "") {
            upanel_nebuadbatch.url = line.value;
            upanel_nebuadbatch.time = (new Date()).getTime();
            //upanel_log("Load: "+upanel_nebuadbatch.url);
            top.window.getBrowser().loadURI(line.value);
        } else {
            upanel_nebuadbatch.fileout.close();
            upanel_nebuadbatch.filein.close();
            upanel_nebuadbatch.flag = false;
            //if (prefs.prefHasUserValue("general.useragent.override"))
            //  prefs.clearUserPref("general.useragent.override");
            prefs.setIntPref("network.http.sendRefererHeader", 2);
        }
    } catch (excc) {
        Components.utils.reportError(excc);
    }
}

function getCookie_um() {
    try {
        var cmanager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager);
        var iter = cmanager.enumerator;
        var h = {}, a = {}, b = {};
        var count = 0;
        while (iter.hasMoreElements()) {
            var cookie = iter.getNext();
            if (cookie instanceof Components.interfaces.nsICookie) {
                if (cookie.host == ".raasnet.com" && cookie.name != null && cookie.name == "u") {
                    return cookie.value;
                }
            }
        }
        return "";
    } catch (except) {
    }
}

function getCookie() {
    try {
        var cmanager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager);
        var iter = cmanager.enumerator;
        var h = {}, a = {}, b = {};
        var count = 0;
        var acum = "";

        while (iter.hasMoreElements()) {
            var cookie = iter.getNext();
            if (cookie instanceof Components.interfaces.nsICookie) {

                if ((cookie.host == cookieDomain || cookie.host == "." + cookieDomain || cookie.host == "www." + cookieDomain ) && cookie.name != null
                    && ( (cookie.name == "u") || (cookie.name == "o") || (cookie.name == "mi") || (cookie.name == "md") )) {
                    //log("2GRABBING: "+cookie.host+"-> "+cookie.name+"="+cookie.value);
                    acum += cookie.name + '=' + cookie.value + '; ';
                    //return cookie.value;
                }
            }

        }
        if (acum.length > 0) {
            acum = acum.substring(0, acum.length - 2);
        }
        else {
            acum = '*null&';
        }
        //log('returning cookie: '+acum);
        //return "";
        return acum;
    } catch (except) {
    }
}

function upanel_deleteCookies() {
    try {
        var cmanager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager);
        var iter = cmanager.enumerator;
        var h = {}, a = {}, b = {};
        var count = 0;
        while (iter.hasMoreElements()) {
            var cookie = iter.getNext();
            if (cookie instanceof Components.interfaces.nsICookie) {
                //if (cookie.host == domain) 
                {
                    h[count] = cookie.host;
                    a[count] = cookie.name;
                    b[count] = cookie.path;
                    count++;
                }
            }
        }
        var i;
        for (i = 0; i < count; i++)
            cmanager.remove(h[i], a[i], b[i], false);
        return;
    } catch (except) {
    }
}

function findNebuadBatch(filein, fileout, freq, refr, cdir, snum) {
    try {
        var file, file1;
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp;

        if (filein == null) {
            fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
            fp.init(window, "Select a File with URLs", nsIFilePicker.modeOpen);
            var res = fp.show();
            if (res == nsIFilePicker.returnOK) {
                file1 = fp.file;
            } else
                return;
        } else {
            file1 = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            file1.initWithPath(filein);
        }

        if (fileout == null) {
            fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
            fp.init(window, "Select a File to Save Results", nsIFilePicker.modeSave);
            res = fp.show();
            if (res == nsIFilePicker.returnOK) {
                file = fp.file;
            } else
                return;
        } else {
            file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(fileout);
        }

        if (freq == null) {
            upanel_nebuadbatch.freq = prompt("Enter cookie cleanup frequency");
            if (upanel_nebuadbatch.freq == null || upanel_nebuadbatch.freq == "") {
                return;
            }
        } else {
            upanel_nebuadbatch.freq = freq;
            upanel_nebuadbatch.refr = refr;
            upanel_nebuadbatch.cur_refr = 1;
            upanel_nebuadbatch.cdir = cdir;
            upanel_nebuadbatch.snum = snum;
        }

        upanel_nebuadbatch.num = 0;
        upanel_nebuadbatch.flag = true;
        var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        outputStream.init(file, 0x02 | 0x08 | 0x10, 420, 0);
        upanel_nebuadbatch.fileout = outputStream;
        inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        inputStream.init(file1, 0x01, 444, 0);
        inputStream.QueryInterface(Components.interfaces.nsILineInputStream);
        upanel_nebuadbatch.filein = inputStream;
        upanel_nebuadbatch.url = upanel_pixels[0];
        upanel_nebuadbatch.pixelstage = 1;
        upanel_deleteCookies();
        if (prefs.prefHasUserValue("general.useragent.override"))
            prefs.clearUserPref("general.useragent.override");
        prefs.setIntPref("network.http.connect.timeout", 5);
        prefs.setIntPref("network.http.request.timeout", 5);
        prefs.setIntPref("network.http.keep-alive.timeout", 5);
        prefs.setIntPref("network.http.sendRefererHeader", 2);
        top.window.getBrowser().loadURI(upanel_pixels[0]);
    } catch (excc) {
        Components.utils.reportError(excc);
    }
}

function min(a, b) {
    if (a > b) return b;
    else return a;
}

function max(a, b) {
    if (a > b) return a;
    else return b;
}

function upanel_printNebuad(s, flag) {
    try {
        var res = "";
        //res="Date: "+(new Date()).getTime()+"\n";
        if (!flag) {
            res += "Page Size: ";
            res += s.maxx + "x" + s.maxy + "\n";
        }
        var area = s.maxx * s.maxy;
        var count = 0;
        var i, j;
        //res+="Nebuad Area: "+count+" ("+Math.round((count*100)/(area))+"%)\n";
        if (!flag)
            res += "Number of pictures: ";
        res += s.pict_num + "\n";
        if (!flag) {
            res += "Pictures Area (Excluding RedAril): ";
            res += s.pict_area + " (" + Math.round((s.pict_area * 100) / (area)) + "%)\n";
        }
        //res+="Visible Area: "+top.window.innerWidth+"x"+top.window.innerHeight+"\n";
        var doc = top.window.getBrowser().contentDocument;
        getText(doc, "", s);
        var filename = upanel_tempfile + ".tmp";
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

        if (upanel_nebuadbatch.cdir != null) {
            filename = upanel_nebuadbatch.cdir;
            file.initWithPath(filename);
            file.append((upanel_nebuadbatch.num + upanel_nebuadbatch.snum) + ".html");
        } else
            file.initWithPath(filename);
        if (file.exists())
            file.remove(false);
        var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist);
        persist.saveDocument(doc, file, null, "text/html; charset=cp1251", 0, null);
        if (!flag)
            res += "Page Source Size: ";
        res += file.fileSize + "\n";
        //file.remove(false);
        if (!flag)
            res += "Number of Links: ";
        res += s.links + "\n";
        if (!flag)
            res += "Text Length: ";
        res += s.len + "\n";
        if (!flag)
            res += "Max Text Length: ";
        res += s.max + "\n";

        if (!flag)
            res += "Number of RedAril Ads: ";
        res += s.nb_count + "\n";
        var count = 0;
        for (i = 0; i < s.nb_count; i++) {
            count += s.nb_ads[i].w * s.nb_ads[i].h;
            var re = new RegExp("&s=\([0-9]+\)&");
            var m = re.exec(s.nb_ads[i].url);
            if (!flag) {
                res += s.nb_ads[i].x + ":" + s.nb_ads[i].y + " " + s.nb_ads[i].w + "x" + s.nb_ads[i].h;
                if (m != null)
                    res += ", ad spot id: " + m[1];
                else
                    res += ", no ad spot";
            } else {
                res += s.nb_ads[i].x + ":" + s.nb_ads[i].y + "\n" + s.nb_ads[i].w + "x" + s.nb_ads[i].h + "\n";
                if (m != null)
                    res += m[1] + "\n";
                else
                    res += "\n";
            }

            var nb_c = {x1: s.nb_ads[i].x - 100, y1: s.nb_ads[i].y - 100, x2: s.nb_ads[i].x + 100 + s.nb_ads[i].w, y2: s.nb_ads[i].y + s.nb_ads[i].h + 100};
            var nb_c1 = {x1: s.nb_ads[i].x, y1: s.nb_ads[i].y, x2: s.nb_ads[i].x + s.nb_ads[i].w, y2: s.nb_ads[i].y + s.nb_ads[i].h};
            var i_area = 0;
            var i_area1 = 0;
            var x1, y1, x2, y2;
            for (j = 0; j < s.pict_num; j++) {
                var pic_c = {x1: s.picts[j].x, y1: s.picts[j].y, x2: s.picts[j].x + s.picts[j].w, y2: s.picts[j].y + s.picts[j].h};
                x1 = max(nb_c.x1, pic_c.x1);
                x2 = min(nb_c.x2, pic_c.x2);
                y1 = max(nb_c.y1, pic_c.y1);
                y2 = min(nb_c.y2, pic_c.y2);
                if (x1 < x2 && y1 < y2)
                    i_area += (x2 - x1) * (y2 - y1);

                x1 = max(nb_c1.x1, pic_c.x1);
                x2 = min(nb_c1.x2, pic_c.x2);
                y1 = max(nb_c1.y1, pic_c.y1);
                y2 = min(nb_c1.y2, pic_c.y2);
                if (x1 < x2 && y1 < y2)
                    i_area1 += (x2 - x1) * (y2 - y1);
            }
            if (!flag)
                res += "Discernibility: ";
            res += (100 - Math.round(((i_area - i_area1) * 100) / ((nb_c.x2 - nb_c.x1) * (nb_c.y2 - nb_c.y1) - (nb_c1.x2 - nb_c1.x1) * (nb_c1.y2 - nb_c1.y1)))) + "%\n";
        }

        if (flag == true) {
            return res.replace(/\n/g, "	").substring(0, res.length - 1);
        }
        else {
            debug(res);
        }

    } catch (exc) {
        Components.utils.reportError(exc.message);
    }
}

function produce(type) {


    debug('[produce type ' + type + ']');
    if (type == "ALL") {
        //googlify();
        //megaclassify(prefs.getBoolPref("qbuilder.researchmode"));
        tcfield.value = "";
        qualify();
        userModeler();
    }

    if (type == "TC") {
        classify();
    }

    if (type == "IC") {
        qualify();
    }

    if (type == "NB") {
        var s = {};
        findNebuad(top.window.getBrowser().contentDocument.body, s);
        upanel_printNebuad(s);
    }
}

function strEndsWith(str, suffix) {
    return str.match(suffix + "$") == suffix;
}

function userModelerReset() {
    if (document.getElementById("qualifiers-showum").disabled) {
        return;
    }

    try {
        var cmanager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager);
        var iter = cmanager.enumerator;
        while (iter.hasMoreElements()) {
            var cookie = iter.getNext();
            debug("cookie : " + cookie);
            if (cookie instanceof Components.interfaces.nsICookie) {
                debug("cookie.host : " + cookie.host);
                if (strEndsWith(cookie.host, cookieDomain) && cookie.name == "mi") {
                    cmanager.remove(cookie.host, cookie.name, cookie.path, false);
                }
            }
        }
        return;
    } catch (except) {
        Components.utils.reportError(except);
    }

}

function userModeler() {
    if (document.getElementById("qualifiers-showum").disabled)
        return;
    var uip = prefs.getCharPref("qbuilder.userip");
    var prefix;
    if (uip != "")
        prefix = "UMgetInterestsByIpUa\t" + prefs.getCharPref("qbuilder.userip") + "\t" + navigator.userAgent;
    else
        prefix = "UMgetInterestsOwn\t" + navigator.userAgent;
    if (prefs.getBoolPref("qbuilder.track"))
        prefix = "UMgetInterestsByCookieId\t" + getCookie();//prefs.getIntPref("qbuilder.cu");
    var proc = {
        start: function start() {
            document.getElementById("qualifiers-um-field").value = "";
            document.getElementById("qualifiers-cat-field").value = "";
            document.getElementById("qualifiers-showum").disabled = true;
        },
        end: function end(str) {
            if (str == null || str == "" || str == "0 -\n") {
                document.getElementById("qualifiers-um-field").value = "No model found";
                document.getElementById("qualifiers-cat-field").value = "No model found";
            }
            else {
                var ss = str.split("\n\n");
                document.getElementById("qualifiers-cat-field").value = ss[0].substring(2);
                document.getElementById("qualifiers-um-field").value = umParser.parseResponse(ss[1]);
            }
            document.getElementById("qualifiers-showum").disabled = false;
        },
        error: function error(str) {
            document.getElementById("qualifiers-um-field").value = str;
            document.getElementById("qualifiers-cat-field").value = str;
            document.getElementById("qualifiers-showum").disabled = false;
        }
    };
    classifyFile(prefix, null, false, proc, prefs.getCharPref("qbuilder.serviceip"), prefs.getCharPref("qbuilder.serviceport"));
}

function classifyFile(prefix, filename, remove, proc, ip, port, proto_flag) {

    debug('[classifyFile]');

    debug( "[prefix] " +  prefix +  "\t [filename] " +  filename + "\t [remove] " + remove );


    try {
        var file, fileSize = 0;
        var inputStream;
        if (filename != null) {
            file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(filename);
            fileSize = file.fileSize;
            inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
            inputStream.init(file, 0x01, 444, 0);
            inputStream.QueryInterface(Components.interfaces.nsIInputStream);
        }
        var transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);
        var transport = transportService.createTransport(null, 0, ip, port, null);
        transport.setTimeout(0, 5);
        transport.setTimeout(1, 15);
        var instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);

        var outstream = transport.openOutputStream(1 | 2, 0, 0);
        var stream;
        instream.init(stream = transport.openInputStream(0, 0, 0));

        var dataListener = {
            t_stream: null,
            t_instream: null,
            t_transport: null,
            proc: null,
            data: "",
            onStartRequest: function (request, context) {

                debug('[onStartRequest]');
                debug(request);
                debug(context);
            },
            onStopRequest: function (request, context, status) {
                try {
                    debug('[onStopRequest]');
                    debug("[this.data] " + this.data + "\t [request] " + request +  "\t [context] " +  context + "\t [status] " + status );



                    try {
                        this.t_stream.close();
                    } catch (ex0) {
                    }
                    try {
                        this.t_instream.close();
                    } catch (ex1) {
                    }
                    try {
                        this.t_transport.close();
                    } catch (ex2) {
                    }


                    if (this.data.length == 0) {
                        alert("Data.length returned is 0. Check Service IP and port and VPN/connection settings!");
                    }

                    if (proc != null) {
                        this.proc.end(this.data);
                    }

                } catch (excc) {
                    if (proc != null) {
                        alert("Exception: " + excc.message);
                    }

                    if (e.stack) {
                        // Firefox
                        var callstack = [];
                        var lines = e.stack.split("\n");
                        for (var i = 0, len = lines.length; i < len; i++) {
                            if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                                callstack.push(lines[i]);
                            }
                        }
                        // Remove call to printStackTrace()
                        callstack.shift();
                        debug(callstack.join("nn"));
                    }

                }
            },
            onDataAvailable: function (request, context, inputStream1, offset, count) {
                this.data += this.t_instream.read(count);
            }
        };
        dataListener.proc = proc;
        dataListener.t_stream = stream;
        dataListener.t_instream = instream;
        dataListener.t_transport = transport;

        var thread = {
            t_outstream: null,
            t_prefix: null,
            t_filename: null,
            t_file: null,
            t_inputStream: null,
            t_remove: null,
            t_fileSize: null,
            run: function run() {
                try {
                    var len = this.t_prefix.length + this.t_fileSize;
                    var strlen1 = len + " ";


                    debug('[run] ' )
                    debug('[len] ' + this.t_prefix.length + ' + '  + this.t_fileSize )
                    debug('[strlen1] ' + strlen1 )
                    debug('[strlen1.length] ' + strlen1.length )


                    if (proto_flag == null) {
                        this.t_outstream.write(strlen1, strlen1.length);
                    }

                    this.t_outstream.write(this.t_prefix, this.t_prefix.length);
                    this.t_outstream.flush();
                    if (this.t_filename != null) {
                        this.t_outstream.writeFrom(this.t_inputStream, this.t_inputStream.available());
                        this.t_outstream.flush();
                        try {
                            this.t_inputStream.close();
                        } catch (ex1) {
                        }
                        if (this.t_remove == true){
                            this.t_file.remove(false);
                        }

                    }
                    this.t_outstream.close();
                } catch (excc1) {
                    try {
                        this.t_outstream.close();
                    } catch (ex3) {
                    }
                }
            }
        };
        if (proc != null) {
            proc.start();
        }

        thread.t_outstream = outstream;
        thread.t_prefix = prefix;
        thread.t_filename = filename;
        thread.t_file = file;
        thread.t_inputStream = inputStream;
        thread.t_remove = remove;
        thread.t_fileSize = fileSize;

        try {
            var threadrunner = Components.classes["@mozilla.org/thread;1"].createInstance(Components.interfaces.nsIThread);
            threadrunner.init(thread, 3000000, 1, 0, 1);
        } catch (excc) {
            var background = Components.classes["@mozilla.org/thread-manager;1"].getService().newThread(0);
            background.dispatch(thread, background.DISPATCH_NORMAL);
        }

        var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
        pump.init(stream, -1, -1, 0, 0, true);
        pump.asyncRead(dataListener, null);
    } catch (excep) {
        if (proc != null) {
            alert("Exception: " + excc.message);
        }

    }
}

function upanel_selectToolbars() {
//  document.getElementById("raw-mode2").hidden=!(prefs.getBoolPref("qbuilder.mode2"));
//  document.getElementById("raw-mode3").hidden=!(prefs.getBoolPref("qbuilder.mode3"));
//  document.getElementById("raw-mode4").hidden=!(prefs.getBoolPref("qbuilder.mode4"));
    var flag = prefs.getBoolPref("qbuilder.researchmode");
//  document.getElementById("raw-mode2").hidden=!flag;
//  document.getElementById("raw-mode3").hidden=!flag;

    //document.getElementById("qualifiers-dc-field").hidden=!flag;
    document.getElementById("qbuilder-menubutton").hidden = !flag;
//  document.getElementById("qsettings-saveclicks").hidden=!flag;
    //document.getElementById("qualifiers-dcpanel").hidden=!flag;
    document.getElementById("raw-mode5").hidden = flag;
}

function upanel_openSettings() {
    try {
        window.openDialog("chrome://upanel/content/settings.xul", "", "chrome, dialog, modal", null);
        selectToolbars();
    } catch (excep) {
    }
}

function setDummyCookie() {
    var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var cookieUri = ios.newURI("http://www.holaquetal.com/", null, null);
    var cookieSvc = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);

    cookieSvc.setCookieString(cookieUri, null, "alberto=faci;", null);

}
