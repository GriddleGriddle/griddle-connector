import React, { Component } from 'react';
import { GriddleContainer } from './griddleContainer';

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import {Reducers, States, GriddleReducer} from 'griddle-core';
import { GriddleActions } from 'griddle-core';
import { GriddleHelpers as Helpers } from 'griddle-core'
import compose from 'lodash.compose';

export const previousOrCombined = (previous, newValue) => {
  return newValue ? [...previous, ...newValue] : previous;
}

export function combinePlugins(...plugins) {
  return plugins.reduce((previous, current) => (
    {
      reducers: previousOrCombined(previous.reducers, current.reducers),
      states: previousOrCombined(previous.states, current.states),
      helpers: previousOrCombined(previous.helpers, current.helpers),
      components: previousOrCombined(previous.components, current.components),
    }
  ), { reducers: [], states: [], helpers: [], components: []})
}

export function composer(...functions) {
  return compose.apply(this, functions.reverse())
}

export const combineComponents = ({ plugins = null, components = null }) => {

  if(!plugins || !components) { return; }

  const composedComponents = {}

  //for every plugin in griddleComponents compose the the matching plugins with the griddle component at the end
  for(var key in components) {
    if(plugins[key]) {
      composedComponents[key] = composer(...plugins[key])(components[key]);
    }
  }

  return composedComponents;
}

//Should return GriddleReducer and the new components
export const processPlugins = (plugins, originalComponents) => {
  if(!plugins) {
    return {
      reducer : GriddleReducer(
        [States.data, States.local],
        [Reducers.data, Reducers.local],
        [Helpers.data, Helpers.local]
      )};
  }

  const combinedPlugin = combinePlugins(plugins);
  const reducer = GriddleReducer(
    [...combinedPlugin.states],
    [...combinedPlugin.reducers],
    [...combinedPlugin.helpers]
  );

  const components = combineComponents({ plugins, originalComponents });

  if(components) {
    return { components, reducer }
  }

  return(reducer);
}

export var GriddleRedux = ({Griddle, GriddleComponents, Plugins}) => class GriddleRedux extends Component {
  constructor(props, context) {
    super(props, context);
    //TODO: Switch this around so that the states and the reducers come in as props.
    //      if nothing is specified, it should default to the local one maybe

    const { pluginReducers, pluginComponents } =  processPlugins(Plugins);
    if(!Plugins) {

    }
    const griddleReducer = GriddleReducer(
      /* griddle default states for local data */
      [States.data, States.local, States.position, States.selectionState],
      /* griddle default reducers */
      [Reducers.data, Reducers.local, Reducers.position, Reducers.selection],
      /* helper methods */
      [Helpers.data, Helpers.local, Helpers.position]
    );

    /* set up the redux store */
    const combinedReducer = combineReducers(griddleReducer);
    this.store = createStore(griddleReducer);
    this.component = GriddleContainer(Griddle);
  }

  render() {
    return (
      <Provider store={this.store}>
        <this.component {...this.props}>
          {this.props.children}
        </this.component>
      </Provider>
    )
  }

  static PropTypes = {
    data: React.PropTypes.array.isRequired
  }
}
