// ==UserScript==
// @name        MathJax on Wikipedias
// @namespace   https://github.com/came88
// @version     0.2.2
// @description Replace PNG math images with MathJax HTML+CSS rendering on all wikipedias
// @author      Lorenzo Cameroni
// @license     GPLv2; https://www.gnu.org/licenses/gpl-2.0.html
// @homepage    https://github.com/came88/MathJax-on-Wikipedia
// @downloadURL https://github.com/came88/MathJax-on-Wikipedia/raw/master/MathJax-on-Wikipedia.user.js
// @match       https://*.wikipedia.org/wiki/*
// @match       https://*.wikibooks.org/wiki/*
// @match       http://www.wikiwand.com/*
// @match       https://www.wikiwand.com/*
// @require     https://code.jquery.com/jquery-1.12.4.min.js
// @grant       unsafeWindow
// ==/UserScript==

/*
 *
 * MathJax on Wikipedias
 *
 * This user script replace math PNG images in wikipedia with MathJax rendering of original formulas,
 * while keeping original PNG as preview until MathJax has finished rendering.
 *
 * Copyright (C) 2015-2016  Lorenzo Cameroni
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
	tex2jax : {
		inlineMath : [],
		displayMath : [],
		processRefs : false,
		processEnvironments : false
	},
	extensions: ["Safe.js"],
	TeX: {
		// Macros not defined in the TeX extension "mediawiki-texvc.js", see https://github.com/mathjax/MathJax/blob/master/unpacked/extensions/TeX/mediawiki-texvc.js
		Macros: {
			sen: "\\operatorname{sen}",		// alternative symbol of the sinus function used in some countries, recognised by wikipedia server software
			sgn: "\\operatorname{sgn}",		// signum function, recognised by wikipedia server software
			AA: "\\unicode[.8,0]{x212B}",	// angstrom symbol, see https://github.com/mathjax/MathJax/issues/795#issuecomment-41437894
			Digamma: "F",
			euro: "\\unicode{0x20AC}",
			geneuro: "\\unicode{0x20AC}",
			geneuronarrow: "\\unicode{0x20AC}",
			geneurowide: "\\unicode{0x20AC}",
			officialeuro: "\\unicode{0x20AC}",
			textvisiblespace: "\\unicode{x2423}",
			pagecolor: ["", 1],				// MathJax does not support background color
			P: "\\unicode{xB6}",			// ¶ symbol
			emph: "",						// emph does nothing on wikipedia but it's sometimes used
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

function loadMathjax (config) {
	var url = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS_HTML,Safe";
	var configScript = document.createElement("script");
	configScript.type = "text/x-mathjax-config";
	$(configScript).text(config);
	$("head").append(configScript);
	var loadScript = document.createElement("script");
	loadScript.type = "text/javascript";
	loadScript.src = url;
	$("head").append(loadScript);
}

function compareRight(s1, s2) {
	var ln = Math.min(s1.length, s2.length);
	return s1.slice(-ln) === s2.slice(-ln);
}

var isWikiwand = compareRight(document.location.hostname, 'wikiwand.com');

function replaceUnbalancedBraces(text) {
	var stack = [];
	var ret = text.split('');

	for (var i = 0; i < text.length; ++i) {
		if (text[i] == '\\') {
			// handle special cases such as \left( \right)
			if (text.substring(i, Math.min(text.length, i + 5)) == '\\left') {
				i += 5;
				continue;
			}
			if (text.substring(i, Math.min(text.length, i + 6)) == '\\right') {
				i += 6;
				continue;
			}
		} else if (text[i] == '(') {
			stack.push(i);
		} else if (text[i] == ')') {
			if (stack.length) {
				stack.pop();
			} else {
				ret[i] = '}';
				// console.log('Found unbalanced brace');
			}
		}
	}
	return ret.join('');
}

function wikipediaPNG(images) {
	console.log("Replacing PNG images with MathJax...");
	images.each(function() {
		var tex = this.alt;
		var script = document.createElement("script");
		if ($(this).hasClass("mwe-math-fallback-image-display")) {
			script.type = "math/tex; mode=display";
		} else {
			script.type = "math/tex";
		}
		tex = (isWikiwand) ? replaceUnbalancedBraces(tex) : tex;
		$(script).text("\\displaystyle " + tex);
		$(this).after(script);
		var span = document.createElement("span");
		span.className = "MathJax_hide_me";
		$(this).wrap(span);
	});
	var config = commonConfig;
	// Disable fast Common-HTML preview (we already have PNG previews...)
	config.preview = "none";
	config["CHTML-preview"] = {
		disabled: true
	};
	loadMathjax("MathJax.Hub.Config(" + JSON.stringify(config) + ");");
}

function wikipediaTextual(spans) {
	console.log("Replacing LaTeX with MathJax...");

	spans.each(function(){
		var tex = $(this).text();
		tex = tex.substring(1, tex.length - 2);
		tex = (isWikiwand) ? replaceUnbalancedBraces(tex) : tex;
		script = document.createElement("script");
		if ($(this).hasClass("mwe-math-fallback-source-display")) {
			script.type = "math/tex; mode=display";
		} else {
			script.type = "math/tex";
		}
		this.className = "MathJax_hide_me";
		$(script).text("\\displaystyle " + tex);
		$(this).after(script);
	});
	loadMathjax("MathJax.Hub.Config(" + JSON.stringify(commonConfig) + ");");
}

function wikipediaMathML(mathML) {
	console.log("Replacing MathML/SVG/PNG with MathJax...");
	// get LaTeX source annotated inside MathML
	mathML.each(function(){
		var img = $(this).parent().parent().find("img,meta");
		var span = document.createElement("span");
		span.className = "MathJax_hide_me";
		$(img).wrap(span);
		var tex = $(this).find("annotation").text();
		tex = (isWikiwand) ? replaceUnbalancedBraces(tex) : tex;
		script = document.createElement("script");
		if ($(this).parent().hasClass("mwe-math-fallback-source-display")) {
			script.type = "math/tex; mode=display";
		} else {
			script.type = "math/tex";
		}
		$(script).text(tex);
		$(this).parent().parent().append(script);
	});
	var config = commonConfig;
	// Disable fast Common-HTML preview (now there are SVG/PNG previews...)
	config.preview = "none";
	config["CHTML-preview"] = {
		disabled: true
	};
	loadMathjax("MathJax.Hub.Config(" + JSON.stringify(config) + ");");
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
			wikipediaMathML(mathML);
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
