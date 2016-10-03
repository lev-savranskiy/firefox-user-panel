var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var upanel_oMain = null;


function upanel_dialogOnLoad(dialog) {
try {
  upanel_oMain=opener.parent.opener;
  if (upanel_oMain==null)
    upanel_oMain=opener;
  dialog.centerWindowOnScreen();
//  document.getElementById("qsettings-demotr").value=prefs.getCharPref("qbuilder.demotr");
//  document.getElementById("qsettings-saveclickspath").value=prefs.getCharPref("qbuilder.saveclickspath");
  document.getElementById("qsettings-serviceip").value=prefs.getCharPref("qbuilder.serviceip");
  document.getElementById("qsettings-serviceport").value=prefs.getCharPref("qbuilder.serviceport");
  document.getElementById("qsettings-userip").value=prefs.getCharPref("qbuilder.userip");
//  document.getElementById("qsettings-mode2").checked=prefs.getBoolPref("qbuilder.mode2");
//  document.getElementById("qsettings-mode3").checked=prefs.getBoolPref("qbuilder.mode3");
//  document.getElementById("qsettings-mode4").checked=prefs.getBoolPref("qbuilder.mode4");
//  document.getElementById("qsettings-proxyip").value=prefs.getCharPref("qbuilder.proxyip");
//  document.getElementById("qsettings-proxyport").value=prefs.getCharPref("qbuilder.proxyport");
  document.getElementById("qsettings-stc").checked=prefs.getBoolPref("qbuilder.stc");
  document.getElementById("qsettings-stcip").value=prefs.getCharPref("qbuilder.stcip");
  document.getElementById("qsettings-stcport").value=prefs.getCharPref("qbuilder.stcport");
//  document.getElementById("qsettings-sdc").checked=prefs.getBoolPref("qbuilder.sdc");
//  document.getElementById("qsettings-sdcip").value=prefs.getCharPref("qbuilder.sdcip");
//  document.getElementById("qsettings-sdcport").value=prefs.getCharPref("qbuilder.sdcport");
  document.getElementById("qsettings-uname").value=prefs.getCharPref("qbuilder.uname");
  document.getElementById("qsettings-framew").checked=prefs.getBoolPref("qbuilder.framew");
  document.getElementById("qsettings-research").checked=prefs.getBoolPref("qbuilder.researchmode");
  checkSpecificSettings();
} catch (excep) {
	//window.dump(excep);

}
}

function upanel_dialogOnAccept() {
try {
//  prefs.setCharPref("qbuilder.demotr",document.getElementById("qsettings-demotr").value);
//  prefs.setCharPref("qbuilder.saveclickspath",document.getElementById("qsettings-saveclickspath").value);
  prefs.setCharPref("qbuilder.serviceip",document.getElementById("qsettings-serviceip").value);
  prefs.setCharPref("qbuilder.serviceport",document.getElementById("qsettings-serviceport").value);
  prefs.setCharPref("qbuilder.userip",document.getElementById("qsettings-userip").value);
//  prefs.setBoolPref("qbuilder.mode2",document.getElementById("qsettings-mode2").checked);
//  prefs.setBoolPref("qbuilder.mode3",document.getElementById("qsettings-mode3").checked);
//  prefs.setBoolPref("qbuilder.mode4",document.getElementById("qsettings-mode4").checked);
//  prefs.setCharPref("qbuilder.proxyip",document.getElementById("qsettings-proxyip").value);
//  prefs.setCharPref("qbuilder.proxyport",document.getElementById("qsettings-proxyport").value);
  prefs.setBoolPref("qbuilder.stc",document.getElementById("qsettings-stc").checked);
  prefs.setCharPref("qbuilder.stcip",document.getElementById("qsettings-stcip").value);
  prefs.setCharPref("qbuilder.stcport",document.getElementById("qsettings-stcport").value);
//  prefs.setBoolPref("qbuilder.sdc",document.getElementById("qsettings-sdc").checked);
//  prefs.setCharPref("qbuilder.sdcip",document.getElementById("qsettings-sdcip").value);
//  prefs.setCharPref("qbuilder.sdcport",document.getElementById("qsettings-sdcport").value);
  prefs.setCharPref("qbuilder.uname",document.getElementById("qsettings-uname").value.replace(/^\s+|\s+$/g, ""));
  prefs.setBoolPref("qbuilder.framew",document.getElementById("qsettings-framew").checked);
  prefs.setBoolPref("qbuilder.researchmode",document.getElementById("qsettings-research").checked);
  upanel_oMain.upanel_selectToolbars();
} catch (excep) {}
}

function checkSpecificSettings() {
  var stc_state=!document.getElementById("qsettings-stc").checked;
  document.getElementById("qsettings-stcip").disabled=stc_state;
  document.getElementById("qsettings-stcport").disabled=stc_state;

//  var sdc_state=!document.getElementById("qsettings-sdc").checked;
//  document.getElementById("qsettings-sdcip").disabled=sdc_state;
//  document.getElementById("qsettings-sdcport").disabled=sdc_state;
} 

function upanel_dialogOnCancel() {
}

//function upanel_check(elem,i) {
//  if (elem.checked==true) {
//    upanel_oMain.document.getElementById("raw-mode"+i).hidden=false;
//  } else {
//    upanel_oMain.document.getElementById("raw-mode"+i).hidden=true;
//  }
//}
