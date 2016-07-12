import React, { PropTypes } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line';

class Editor extends React.Component {

  componentDidMount() {
    this._cm = CodeMirror(this.refs.container, { // eslint-disable-line
      theme: 'p5-widget',
      value: this.props.file.content,
      lineNumbers: true,
      styleActiveLine: true,
      mode: 'javascript'
    });
    this._cm.on('change', () => { // eslint-disable-line
      // this.props.updateFileContent('sketch.js', this._cm.getValue());
      this.props.updateFileContent(this.props.file.name, this._cm.getValue());
    });
    this._cm.getWrapperElement().style['font-size'] = `${this.props.fontSize}px`;
    this._cm.setOption('indentWithTabs', this.props.isTabIndent);
    this._cm.setOption('tabSize', this.props.indentationAmount);
  }

  componentDidUpdate(prevProps) {
    if (this.props.file.content !== prevProps.file.content &&
        this.props.file.content !== this._cm.getValue()) {
      this._cm.setValue(this.props.file.content); // eslint-disable-line no-underscore-dangle
    }
    if (this.props.fontSize !== prevProps.fontSize) {
      this._cm.getWrapperElement().style['font-size'] = `${this.props.fontSize}px`;
    }
    if (this.props.indentationAmount !== prevProps.indentationAmount) {
      this._cm.setOption('tabSize', this.props.indentationAmount);
    }
    if (this.props.isTabIndent !== prevProps.isTabIndent) {
      this._cm.setOption('indentWithTabs', this.props.isTabIndent);
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
  indentationAmount: PropTypes.number.isRequired,
  isTabIndent: PropTypes.bool.isRequired,
  updateFileContent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  })
};

export default Editor;
