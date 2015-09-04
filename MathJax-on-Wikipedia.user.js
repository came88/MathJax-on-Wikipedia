// ==UserScript==
// @name         MathJax on Wikipedias
// @namespace    https://github.com/came88
// @version      0.1.1
// @description  Replace PNG math images with MathJax HTML+CSS rendering on all wikipedias
// @author       Lorenzo Cameroni
// @homepage     https://github.com/came88/MathJax-on-Wikipedia
// @downloadURL  https://github.com/came88/MathJax-on-Wikipedia/raw/master/MathJax-on-Wikipedia.user.js
// @match        https://*.wikipedia.org/wiki/*
// @require      http://code.jquery.com/jquery-1.11.3.min.js
// @grant        none
// ==/UserScript==

// Load MathJax only if no one else (the webpage, another browser extension...) has already loaded it
if (window.MathJax === undefined && (window.unsafeWindow === undefined || window.unsafeWindow.MathJax === undefined)) {
	console.log("Loading MathJax in Wikipedia...");
	var images = $("img.tex");
	if (images.length === 0) {
		return;
	}

	for (var i = 0; i < images.length; i++) {
		var img = images.get(i);
		var tex = img.alt;
		var span = document.createElement("span");
		span.className = "MathJax_hide_me";
		$(img).before(span);
		$(img).detach().appendTo(span);
		var script = document.createElement("script");
		if (img.className.indexOf("mwe-math-fallback-image-display") > -1) {
			script.type = "math/tex; mode=display";
		} else {
			script.type = "math/tex";
		}
		// script[(window.opera ? "innerHTML" : "text")] = "\\class{" + img.className + "}{\\displaystyle " + tex + "}";
		script[(window.opera ? "innerHTML" : "text")] = "\\displaystyle " + tex;
		$(span).after(script);
	}

	//  Load MathJax
	var script;
	script = document.createElement("script");
	script.type = "text/x-mathjax-config";
	var config = {
		jax: [],
		preRemoveClass: "MathJax_hide_me",
		/*
		tex2jax : {
			inlineMath : [],
			displayMath : [],
			processEnvironments : false
		},
		*/
		preview: "none",
		"CHTML-preview": {
			disabled: true
		},
		extensions: ["Safe.js"],
		TeX: {
			// Macros not defined in the TeX extension "mediawiki-texvc.js", see https://github.com/mathjax/MathJax/blob/master/unpacked/extensions/TeX/mediawiki-texvc.js
			Macros: {
				sen: "\\operatorname{sen}",	// alternative symbol of the sinus function used in some countries, recognised by wikipedia server software
				sgn: "\\operatorname{sgn}",	// signum function, recognised by wikipedia server software
				pagecolor: ["", 1],			// MathJax does not support background color
				P: "\\unicode{xB6}"			// ¶ symbol
			},
			// Uncomment the next section for debug
			/*
			noUndefined: {
				disabled: true
			},
			noErrors: {
				disabled: true
			},
			*/
			extensions: ["autoload-all.js", "mediawiki-texvc.js"]
		}
	};
	script[(window.opera ? "innerHTML" : "text")] = "MathJax.Hub.Config(" + JSON.stringify(config) + ");";
    // console.log(script[(window.opera ? "innerHTML" : "text")]);
	$("head").append(script);
	script = document.createElement("script");
	script.type = "text/javascript";
	script.src = "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML,Safe";
	$("head").append(script);
} else {
	console.log("MathJax seems to be already loaded, doing nothing.");
}