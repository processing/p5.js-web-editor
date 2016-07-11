(function(root, factory) {
	// `root` does not resolve to the global window object in a Browserified
	// bundle, so a direct reference to that object is used instead.
	var _srcDoc = window.srcDoc;

	if (typeof define === "function" && define.amd) {
		define(['exports'], function(exports) {
			factory(exports, _srcDoc);
			root.srcDoc = exports;
		});
	} else if (typeof exports === "object") {
		factory(exports, _srcDoc);
	} else {
		root.srcDoc = {};
		factory(root.srcDoc, _srcDoc);
	}
})(this, function(exports, _srcDoc) {
	var idx, iframes;
	var isCompliant = !!("srcdoc" in document.createElement("iframe"));
	var implementations = {
		compliant: function( iframe, content ) {

			if (content) {
				iframe.setAttribute("srcdoc", content);
			}
		},
		legacy: function( iframe, content ) {

			var jsUrl;

			if (!iframe || !iframe.getAttribute) {
				return;
			}

			if (!content) {
				content = iframe.getAttribute("srcdoc");
			} else {
				iframe.setAttribute("srcdoc", content);
			}

			if (content) {
				// The value returned by a script-targeted URL will be used as
				// the iFrame's content. Create such a URL which returns the
				// iFrame element's `srcdoc` attribute.
				jsUrl = "javascript: window.frameElement.getAttribute('srcdoc');";

				iframe.setAttribute("src", jsUrl);

				// Explicitly set the iFrame's window.location for
				// compatability with IE9, which does not react to changes in
				// the `src` attribute when it is a `javascript:` URL, for
				// some reason
				if (iframe.contentWindow) {
					iframe.contentWindow.location = jsUrl;
				}
			}
		}
	};
	var srcDoc = exports;
	// Assume the best
	srcDoc.set = implementations.compliant;
	srcDoc.noConflict = function() {
		window.srcDoc = _srcDoc;
		return srcDoc;
	};

	// If the browser supports srcdoc, no shimming is necessary
	if (isCompliant) {
		return;
	}

	srcDoc.set = implementations.legacy;

	// Automatically shim any iframes already present in the document
	iframes = document.getElementsByTagName("iframe");
	idx = iframes.length;

	while (idx--) {
		srcDoc.set( iframes[idx] );
	}

});
