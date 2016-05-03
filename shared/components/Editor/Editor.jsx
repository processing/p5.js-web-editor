import React from 'react';
import CSSModules from 'react-css-modules';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';

import '../../..//node_modules/codemirror/lib/codemirror.css';
import './p5-widget-codemirror-theme.css';

export default React.createClass({
	_cm: CodeMirror.Editor,
	componentDidMount: function() {
		this._cm = CodeMirror(this.refs.container, {
      theme: 'p5-widget',
      // value: this.props.content,
      value: 'var a = "Hello World!"',
      lineNumbers: true,
      mode: 'javascript'
    });
	},
	componentWillUnmount: function() {
		this._cm = null;
	},
	render: function() {
		return <div ref="container" className="editor-holder"></div>;
	}
});