import React from 'react';
import ReactDOM from 'react-dom';

class Preview extends React.Component {
	componentDidMount() {
		console.log(ReactDOM.findDOMNode(this));
	}

	render() {
		return (
			<div>
				<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.0/p5.min.js"></script>
				<script type="text/javascript">
					{this.props.content}
				</script>
			</div>
		);
	}
}

export default Preview;