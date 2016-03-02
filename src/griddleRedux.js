import React, { Component } from 'react';
import { createSelector, createStructuredSelector } from 'reselect';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';

import thunk from 'redux-thunk';

import { Reducers, States, GriddleReducer, Selectors, Utils } from 'griddle-core';
import { GriddleActions } from 'griddle-core';
import { GriddleHelpers as Helpers } from 'griddle-core'
import { doOnReceiveProps, compose } from 'recompose';

import { processPlugins } from './utils/pluginUtils';
import PropertyHelper from './utils/propertyHelper';

class GriddleLoader extends Component {
  constructor(props) {
    super(props);
    this.loadData(props);
  }

  loadData = (props) => {
    const properties = PropertyHelper.propertiesToJS({
      rowProperties: props.children,
      defaultColumns: props.columns,
      ignoredColumns: props.ignoredColumns,
      allColumns: props.data && props.data.length > 0 ?
        Object.keys(props.data[0]) :
        []
    });

    // Initialize the grid.
    props.initializeGrid(properties);

    if(props.data) {
      props.loadData(props.data);
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.data !== this.props.data) {
      this.loadData(nextProps);
    }
  }

  render() {
    return <this.props.composedComponent
      store={this.props.store}
    />
  }
}


export var GriddleRedux = ({Griddle, Components, Plugins}) => {
  const GriddleContainer = (props) => { debugger; return (
    <Griddle {...props} />
  )}
  const { actions, reducer, components } =  processPlugins(Plugins, Components);

  Selectors.localSelectors.registerUtils(Utils.sortUtils);

  //this gets the initial settings for Griddle, wires up plugins and hooks in the other components.
  return class GriddleInitializer extends Component {
    constructor(props, context) {
      super(props, context);

      //TODO: Switch this around so that the states and the reducers come in as props.
      //      if nothing is specified, it should default to the local one maybe

      // Use the thunk middleware to allow for multiple dispatches in a single action.
      const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

      /* set up the redux store */
      const combinedReducer = combineReducers(reducer);
      this.store = createStoreWithMiddleware(reducer);

      this.components = Object.assign({}, components, props.components);

      this.component = connect(
        () => ({one: ''}),
        {
          loadData: actions.loadData,
          initializeGrid: actions.initializeGrid
        }
      )(GriddleLoader);

      const a = { ...actions }
      this.connectedComponent = connect(
        createSelector(
          Selectors.localSelectors.gridStateSelector,
          (gridState) => (
            {
              data: gridState.visibleData.toJSON()
            }
          )
        ),
        { ...actions }
      )(GriddleContainer)
    }

    render() {
      return (
        <this.component
          {...this.props}
          components={this.components}
          actions={actions}
          store={this.store}
          composedComponent={this.connectedComponent}
        >
          {this.props.children}
        </this.component>
      )
    }

    static PropTypes = {
      data: React.PropTypes.array.isRequired
    }
  }
}
