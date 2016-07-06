import React, { PropTypes } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line';

class Editor extends React.Component {

  componentDidMount() {
    this._cm = CodeMirror(this.refs.container, { // eslint-disable-line
      theme: 'p5-widget',
      value: this.props.content,
      lineNumbers: true,
      styleActiveLine: true,
      mode: 'javascript'
    });
    this._cm.on('change', () => { // eslint-disable-line
      this.props.updateFile('sketch.js', this._cm.getValue());
    });
    this._cm.getWrapperElement().style['font-size'] = `${this.props.fontSize}px`;
    this._cm.setOption('tabSize', this.props.indentationAmount);
  }

  componentDidUpdate(prevProps) {
    if (this.props.content !== prevProps.content &&
        this.props.content !== this._cm.getValue()) {
      this._cm.setValue(this.props.content); // eslint-disable-line no-underscore-dangle
    }
    if (this.props.fontSize !== prevProps.fontSize) {
      this._cm.getWrapperElement().style['font-size'] = `${this.props.fontSize}px`;
    }
    if (this.props.indentationAmount !== prevProps.indentationAmount) {
      this._cm.setOption('tabSize', this.props.indentationAmount);
    }
  }

  componentWillUnmount() {
    this._cm = null;
  }

  _cm: CodeMirror.Editor

  render() {
    return <div ref="container" className="editor-holder"></div>;
  }
}

Editor.propTypes = {
  content: PropTypes.string.isRequired,
  updateFile: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  indentationAmount: PropTypes.number.isRequired
};

export default Editor;
