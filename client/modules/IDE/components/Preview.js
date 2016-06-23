import React from 'react';

class Preview extends React.Component {
  componentDidMount() {

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
