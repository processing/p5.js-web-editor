import React from 'react';
import CSSModules from 'react-css-modules';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';

import '../../../node_modules/codemirror/lib/codemirror.css';
import './p5-widget-codemirror-theme.css';

class Editor extends React.Component {
	_cm: CodeMirror.Editor

	componentDidMount() {
		this._cm = CodeMirror(this.refs.container, {
      theme: 'p5-widget',
      value: this.props.content,
      // value: "var a = 'Hello World!';",
      lineNumbers: true,
      mode: 'javascript'
    });
    this._cm.on('change', () => {
      this.props.updateFile("sketch.js", this._cm.getValue());
    });
	}

	componentDidUpdate(prevProps) {
		if (this.props.content !== prevProps.content &&
        this.props.content !== this._cm.getValue()) {
      this._cm.setValue(this.props.content);
    }
	}

	componentWillUnmount() {
		this._cm = null;
	}

	render() {
		return <div ref="container" className="editor-holder"></div>;
	}
}

export default Editor;