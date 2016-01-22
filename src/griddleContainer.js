import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

//import { GriddleActions } from 'griddle-core';
import PropertyHelper from './utils/propertyHelper';

function areVisibleColumnsSame(original, next, columns) {
  //use some to return immediately if there is one that doesn't match
  return !columns.some(col => next[col] !== original[col]);
}

function areArraysSame(original, next, columns) {
  return !original.some((item, index) => !areVisibleColumnsSame(item, next[index], columns));
}

export var GriddleContainer = (Actions) => ComposedComponent => {
  class Container extends Component {
    static defaultProps = {
      dataKey: 'visibleData'
    }

    constructor(props, context) {
      super(props, context);

      this.state = {};
      this.state.actionCreators = bindActionCreators(Actions, props.dispatch);

      this.loadData(props);
    }

    loadData = (props) => {
      const properties = PropertyHelper.propertiesToJS({
        rowProperties: props.children,
        defaultColumns: props.columns,
        ignoredColumns: props.ignoredColumns,
        allColumns: props.data.length > 0 ?
          Object.keys(props.data[0]) :
          []
      });

      this.state.actionCreators.loadData(props.data, properties);
    }

    componentWillReceiveProps(nextProps) {
      //figure out if the columns are the same
      const columns = Object.keys(nextProps.state.renderProperties.columnProperties)

      if(nextProps.data && !areArraysSame(nextProps.state.data, nextProps.data, columns)) {
        this.loadData(nextProps);
      }
    }

    render() {
      const { state, dispatch, dataKey } = this.props;
      return (
        <ComposedComponent
          {...state}
          {...this.state.actionCreators}
          {...this.props}
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


