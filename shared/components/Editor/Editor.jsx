import React from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line'

class Editor extends React.Component {
  _cm: CodeMirror.Editor

	componentDidMount() {
		this._cm = CodeMirror(this.refs.container, {
      theme: 'p5-widget',
      value: this.props.content,
      lineNumbers: true,
      styleActiveLine: true,
      mode: 'javascript'
    });
    this._cm.on('change', () => {
      this.props.updateFile("sketch.js", this._cm.getValue());
    });
		this._cm.getWrapperElement().style['font-size'] = this.props.fontSize+'px';
	}

	componentDidUpdate(prevProps) {
		if (this.props.content !== prevProps.content &&
        this.props.content !== this._cm.getValue()) {
      this._cm.setValue(this.props.content);
    }
		if (this.props.fontSize !== prevProps.fontSize) {
			this._cm.getWrapperElement().style['font-size'] = this.props.fontSize+'px';
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
