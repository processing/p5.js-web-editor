import React from 'react';
import ReactDOM from 'react-dom';

class PreviewFrame extends React.Component {

	componentDidMount() {
		if (this.props.isPlaying) {
			this.renderFrameContents();
		}
	}

	renderFrameContents() {
		let doc = ReactDOM.findDOMNode(this).contentDocument;
    if(doc.readyState === 'complete') {
    	renderSketch();
    } else {
       setTimeout(this.renderFrameContents, 0);
    }
	}

	renderSketch() {
		let doc = ReactDOM.findDOMNode(this).contentDocument;
		this.clearPreview();
		ReactDOM.render(this.props.head, doc.head);
		let p5Script = doc.createElement('script');
		p5Script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.0/p5.min.js');
		doc.body.appendChild(p5Script);

		let sketchScript = doc.createElement('script');
		sketchScript.textContent = this.props.content;
		doc.body.appendChild(sketchScript);
	}

	clearPreview() {
		let doc = ReactDOM.findDOMNode(this).contentDocument;
		doc.write('');
		doc.close();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.isPlaying != prevProps.isPlaying) {
			if (this.props.isPlaying) {
				this.renderSketch();
			}
			else {
				this.clearPreview();
			}
		}

		if (this.props.isPlaying && this.props.content != prevProps.content) {
			this.renderSketch();
		}
	}

	componentWillUnmount() {
		React.unmountComponentAtNode(this.getDOMNode().contentDocument.body);
	}

	render() {
    return <iframe className="preview-frame" frameBorder="0" sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-modals allow-forms" title="sketch output"></iframe>;
  }
}

export default PreviewFrame;
