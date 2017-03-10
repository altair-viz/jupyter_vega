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
    this.embed();
  }

  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    this.embed();
  }

  render() {
    return <div ref={el => this.el = el} />;
  }

  embed = () => {
    const { data: spec, embedMode: mode, renderedCallback: cb } = this.props;
    const embedSpec = {
      mode,
      spec,
      actions: true,
      config: mode === 'vega-lite'
        ? {
            cell: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }
          }
        : {}
    };
    vegaEmbed(this.el, embedSpec, cb);
  };
}
