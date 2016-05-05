import React from 'react';

class Preview extends React.Component {
	_iframe: HTMLIFrameElement

	render() {
    return <div ref="container" className="preview-holder"></div>;
  }
}

export default Preview;