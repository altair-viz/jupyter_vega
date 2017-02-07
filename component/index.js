import React from 'react';
import vegaEmbed from 'vega-embed';
import './index.css';

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = DEFAULT_WIDTH / 1.5;

export default class Vega extends React.Component {
  
  static defaultProps = {
    renderedCallback: () => ({}),
    embedMode: 'vega-lite'
  };

  componentDidMount() {
    this.embed(
      this.el,
      this.props.data,
      this.props.embedMode,
      this.props.renderedCallback
    );
  }

  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    this.embed(
      this.el,
      this.props.data,
      this.props.embedMode,
      this.props.renderedCallback
    );
  }

  render() {
    return <div ref={el => this.el = el} />;
  }
  
  embed = (el, spec, mode, cb) => {
    const embedSpec = { mode, spec };
    const width = DEFAULT_WIDTH;
    const height = DEFAULT_HEIGHT;
    if (mode === 'vega-lite') {
      embedSpec.spec.config = {
        ...embedSpec.spec.config,
        cell: { width, height }
      };
    }
    vegaEmbed(el, embedSpec, cb);
  }
  
}
