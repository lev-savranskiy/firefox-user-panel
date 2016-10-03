del *.xpi
copy install.rdf_template install.rdf
jar cf FFUserPanel.xpi chrome defaults categories.txt chrome.manifest install.rdf
del install.rdf