import React from 'react';
import vegaEmbed from 'vega-embed';
import './index.css';

const DEFAULT_WIDTH = 840;
const DEFAULT_HEIGHT = DEFAULT_WIDTH / 1.5;

export default class Vega extends React.Component {
  static defaultProps = {
    renderedCallback: () => ({}),
    embedMode: 'vega-lite'
  };

  componentDidMount() {
    this.embed();
  }

  componentDidUpdate() {
    this.embed();
  }

  render() {
    return <div ref={el => this.el = el} />;
  }

  embed = () => {
    const {
      data: spec,
      embedMode: mode,
      renderedCallback: cb,
      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT
    } = this.props;
    const embedSpec = {
      mode,
      spec: {
        ...spec,
        width: width - 50,
        height: height - 100
      }
    };
    vegaEmbed(this.el, embedSpec, cb);
  };
}
