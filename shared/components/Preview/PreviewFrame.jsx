import React from 'react';
import ReactDOM from 'react-dom';

class PreviewFrame extends React.Component {
	
	componentDidMount() {
		this.renderFrameContents();
	}

	renderFrameContents() {
		let doc = ReactDOM.findDOMNode(this).contentDocument;
    if(doc.readyState === 'complete') {
    	// ReactDOM.render(this.props.children, doc.body);
    	this.renderSketch();
    } else {
       setTimeout(this.renderFrameContents, 0);
    }
	}

	renderSketch() {
		let doc = ReactDOM.findDOMNode(this).contentDocument;
		doc.write('');
		doc.close();
		let p5Script = doc.createElement('script');
		p5Script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.0/p5.min.js');
		doc.body.appendChild(p5Script);

		let sketchScript = doc.createElement('script');
		sketchScript.textContent = this.props.content;
		doc.body.appendChild(sketchScript);
	}

	componentDidUpdate() {
		this.renderFrameContents();
	}

	componentWillUnmount() {
		React.unmountComponentAtNode(this.getDOMNode().contentDocument.body);
	}

	render() {
    return <iframe sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-modals allow-forms"></iframe>;
  }
}

export default PreviewFrame;