import React from 'react';
import ReactDOM from 'react-dom';

class Preview extends React.Component {
	
	componentDidMount() {
		this.renderFrameContents();
	}

	renderFrameContents() {
		let doc = ReactDOM.findDOMNode(this).contentDocument;
    if(doc.readyState === 'complete') {
       ReactDOM.render(this.props.children, doc.body);
    } else {
       setTimeout(this.renderFrameContents, 0);
    }
	}

	componentDidUpdate() {
		this.renderFrameContents();
	}

	componentWillUnmount() {
		React.unmountComponentAtNode(this.getDOMNode().contentDocument.body);
	}

	render() {
    return <iframe sandbox="allow-same-origin"></iframe>;
  }
}

export default Preview;