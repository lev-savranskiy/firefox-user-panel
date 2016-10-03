var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var obj_tmp;
var upanel_frames;

function upanel_framesDialogOnLoad(dialog) {
    dialog.centerWindowOnScreen();
    var doc=window.arguments[0];
    upanel_frames=window.arguments[1];
    obj_tmp=window.arguments[2];
    upanel_frames["Main Page"]=doc;
    var categories=document.getElementById("qbuilder-frames");
    for (var yy in upanel_frames)
      categories.appendItem(yy, yy);
    document.getElementById("qbuilder-frames").value="Main Page";
}

function upanel_framesDialogOnAccept() {
    obj_tmp.reply=true;
    obj_tmp.doc=upanel_frames[document.getElementById("qbuilder-frames").value];
}

function upanel_framesDialogOnCancel() {
  obj_tmp.reply=false;
}