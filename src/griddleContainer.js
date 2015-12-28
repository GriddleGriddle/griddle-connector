import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

//import { GriddleActions } from 'griddle-core';
import PropertyHelper from './utils/propertyHelper';

export var GriddleContainer = (Actions) => ComposedComponent => {
  class Container extends Component {
    static defaultProps = {
      dataKey: 'visibleData'
    }

    constructor(props, context) {
      super(props, context);
      this.state = {};
      this.state.actionCreators = bindActionCreators(Actions, props.dispatch);

      const properties = PropertyHelper.propertiesToJS({
        rowProperties: props.children,
        defaultColumns: props.columns,
        ignoredColumns: props.ignoredColumns,
        allColumns: props.data && props.data.length > 0 ?
          Object.keys(props.data[0]) :
          []
      });

      // Initialize the grid.
      this.state.actionCreators.initializeGrid();

      if(props.data) {
        this.state.actionCreators.loadData(props.data, properties);
      }
    }

    render() {
      const { state, dispatch, dataKey } = this.props;
      return (
        <ComposedComponent
          {...state}
          components={this.props.components}
          style={this.props.style}
          settings={this.props.settings}
          {...this.state.actionCreators}
          data={state[dataKey]} />
      );
    }
  }

  function select(state) {
    return {
      state: state.toJSON()
    };
  }

  return connect(select)(Container);
}


