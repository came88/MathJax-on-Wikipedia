// ==UserScript==
// @name        MathJax on Wikipedias
// @namespace   https://github.com/came88
// @version     0.1.5
// @description Replace PNG math images with MathJax HTML+CSS rendering on all wikipedias
// @author      Lorenzo Cameroni
// @license     GPLv2; https://www.gnu.org/licenses/gpl-2.0.html
// @homepage    https://github.com/came88/MathJax-on-Wikipedia
// @downloadURL https://github.com/came88/MathJax-on-Wikipedia/raw/master/MathJax-on-Wikipedia.user.js
// @match       https://*.wikipedia.org/wiki/*
// @require     http://code.jquery.com/jquery-1.11.3.min.js
// @grant       unsafeWindow
// ==/UserScript==

/*
 *
 * MathJax on Wikipedias
 * 
 * This user script replace math PNG images in wikipedia with MathJax rendering of original formulas,
 * while keeping original PNG as preview until MathJax has finished rendering.
 * 
 * Copyright (C) 2015  Lorenzo Cameroni
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 */

var commonConfig = {
	jax: [],
	preRemoveClass: "MathJax_hide_me",
	/*
	tex2jax : {
		inlineMath : [],
		displayMath : [],
		processRefs : false,
		processEnvironments : false
	},
	*/
	extensions: ["Safe.js"],
	TeX: {
		// Macros not defined in the TeX extension "mediawiki-texvc.js", see https://github.com/mathjax/MathJax/blob/master/unpacked/extensions/TeX/mediawiki-texvc.js
		Macros: {
			sen: "\\operatorname{sen}",	// alternative symbol of the sinus function used in some countries, recognised by wikipedia server software
			sgn: "\\operatorname{sgn}",	// signum function, recognised by wikipedia server software
			pagecolor: ["", 1],			// MathJax does not support background color
			P: "\\unicode{xB6}"			// ¶ symbol
		},
		// Uncomment to easily find missing TeX and LaTeX macros
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
 
function wikipediaPNG(images) {
	console.log("Replacing PNG images with MathJax...");
	var script;
	for (var i = 0; i < images.length; i++) {
		var img = images.get(i);
		var tex = img.alt;
		var span = document.createElement("span");
		span.className = "MathJax_hide_me";
		$(img).before(span);
		$(img).detach().appendTo(span);
		script = document.createElement("script");
		if (img.className.indexOf("mwe-math-fallback-image-display") > -1) {
			script.type = "math/tex; mode=display";
		} else {
			script.type = "math/tex";
		}
		script[(window.opera ? "innerHTML" : "text")] = "\\displaystyle " + tex;
		$(span).after(script);
	}

	// Load MathJax
	script = document.createElement("script");
	script.type = "text/x-mathjax-config";
	var config = commonConfig;
	// Disable fast Common-HTML preview (we already have PNG previews...)
	config.preview = "none";
	config."CHTML-preview" = {
		disabled: true
	};
	script[(window.opera ? "innerHTML" : "text")] = "MathJax.Hub.Config(" + JSON.stringify(config) + ");";
    // console.log(script[(window.opera ? "innerHTML" : "text")]);
	$("head").append(script);
	script = document.createElement("script");
	script.type = "text/javascript";
	script.src = "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML,Safe";
	$("head").append(script);
}

function wikipediaTextual(spans) {
	console.log("Replacing LaTeX with MathJax...");

	var script;
	for (var i = 0; i < spans.length; i++) {
		var span = spans.get(i);
		var tex = span.innerHTML;
		tex = tex.substring(1, tex.length - 2);
		script = document.createElement("script");
		if (span.className.indexOf("mwe-math-fallback-source-display") > -1) {
			script.type = "math/tex; mode=display";
		} else {
			script.type = "math/tex";
		}
		span.className = "MathJax_hide_me";
		script[(window.opera ? "innerHTML" : "text")] = "\\displaystyle " + tex;
		$(span).after(script);
	}

	// Load MathJax
	script = document.createElement("script");
	script.type = "text/x-mathjax-config";
	var config = commonConfig;
	script[(window.opera ? "innerHTML" : "text")] = "MathJax.Hub.Config(" + JSON.stringify(config) + ");";
    console.log(script[(window.opera ? "innerHTML" : "text")]);
	$("head").append(script);
	script = document.createElement("script");
	script.type = "text/javascript";
	script.src = "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML,Safe";
	$("head").append(script);
}

function wikipediaMathML() {
	console.log("Replacing MathML with MathJax...");
	
	// Load MathJax
	script = document.createElement("script");
	script.type = "text/x-mathjax-config";
	var config = {
		extensions: ["Safe.js"],
		preview: "none",
		"CHTML-preview": {
			disabled: true
		}/*,
		"HTML-CSS": {
			EqnChunk: 1,
			EqnChunkFactor: 1,
			EqnChunkDelay: 10
		}*/
	};
	script[(window.opera ? "innerHTML" : "text")] = "MathJax.Hub.Config(" + JSON.stringify(config) + ");";
    // console.log(script[(window.opera ? "innerHTML" : "text")]);
	$("head").append(script);
	$("meta.mwe-math-fallback-image-inline").remove();
	$("meta.mwe-math-fallback-image-display").remove();
	$(".mwe-math-mathml-a11y").removeClass("mwe-math-mathml-a11y");
	script = document.createElement("script");
	script.type = "text/javascript";
	script.src = "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=MML_HTMLorMML,Safe";
	$("head").append(script);
}

// Load MathJax only if no one else (the webpage, another browser extension...) has already loaded it
if (window.MathJax === undefined && (window.unsafeWindow === undefined || window.unsafeWindow.MathJax === undefined)) {
	console.log("Loading MathJax in Wikipedia...");
	var images = $("img.tex");
	if (images.length > 0) {
		wikipediaPNG(images);
	} else {
		var mathML = $("math");
		if (mathML.length > 0) {
			wikipediaMathML();
		} else {
			var spans = $("span.tex");
			if (spans.length > 0) {
				wikipediaTextual(spans);
			} else {
				console.log("Math seems unused on this page. MathJax will not be loaded.");
			}
		}
	}
} else {
	console.log("MathJax seems to be already loaded, doing nothing.");
}
