var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var obj_tmp;

function upanel_categoryDialogOnLoad(dialog) {
    obj_tmp=window.arguments[0];
    dialog.centerWindowOnScreen();
    var DIRSVC = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
    var file = DIRSVC.get("ProfD", Components.interfaces.nsIFile);
    //file.append("extensions");
    file.append("upanel@coreaudience");
    file.append("categories.txt");
    if (!file.exists()) {
      Components.utils.reportError("Error, no categories in plugin bundle!");
    }
    var line={}, res;
    var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
    inputStream.init(file, 1, 444, 0);
    inputStream.QueryInterface(Components.interfaces.nsILineInputStream);
    var categories=document.getElementById("qbuilder-rejectcategory");
    do {
      res=inputStream.readLine(line);
      var tmp=line.value;
      while (tmp[tmp.length-1]==';')
         tmp=tmp.substring(0,tmp.length-1);
      tmp=tmp.replace(";",": ");
      while (tmp.indexOf(";")!=-1)
       tmp=tmp.replace(";","->");
      categories.appendItem(tmp, line.value);
    } while (res);
    inputStream.close();
    document.getElementById("qbuilder-rejectcategory").value=prefs.getCharPref("qbuilder.rejectcategory");
}

function upanel_categoryDialogOnAccept() {
    prefs.setCharPref("qbuilder.rejectcategory",document.getElementById("qbuilder-rejectcategory").value);
    obj_tmp.ok=true;
    if (document.getElementById("qsettings-customcomment").value=="")
      obj_tmp.response=document.getElementById("qbuilder-rejectcategory").value;
    else
      obj_tmp.response=document.getElementById("qsettings-customcomment").value;
}

function upanel_filter() {
  var keywords=document.getElementById("qsettings-filter").value.toLowerCase().split(" ");
  document.getElementById("qbuilder-rejectcategory").selectedIndex=-1;
  document.getElementById("qbuilder-rejectcategory").value="";
  document.getElementById("qbuilder-rejectcategory").removeAllItems();
  var DIRSVC = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
  var file = DIRSVC.get("ProfD", Components.interfaces.nsIFile);
  //file.append("extensions");
  file.append("upanel@coreaudience");
  file.append("categories.txt");
  if (!file.exists()) {
    Components.utils.reportError("Error, no categories in plugin bundle!");
  }
  var line={}, res;
  var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
  inputStream.init(file, 1, 444, 0);
  inputStream.QueryInterface(Components.interfaces.nsILineInputStream);
  var categories=document.getElementById("qbuilder-rejectcategory");
  var count=0;
  do {
    res=inputStream.readLine(line);
    var tmp=line.value;
    var flag=false;
    var i;
    for (i=0;i<keywords.length;i++)
      if (tmp.toLowerCase().indexOf(keywords[i])>-1) {
        flag=true;
        break;
      }
    if (flag) {
      count++;
      while (tmp[tmp.length-1]==';')
        tmp=tmp.substring(0,tmp.length-1);
      tmp=tmp.replace(";",": ");
      while (tmp.indexOf(";")!=-1)
        tmp=tmp.replace(";","->");
      categories.appendItem(tmp, line.value);
    }
  } while (res);
  inputStream.close();
  if (count>0)
    document.getElementById("qbuilder-rejectcategory").selectedIndex=0;
  else {
    document.getElementById("qbuilder-rejectcategory").selectedIndex=-1;
    document.getElementById("qbuilder-rejectcategory").value="";
  }
}

function upanel_categoryDialogOnCancel() {
}