import React, { Component } from 'react';
import { GriddleContainer } from './griddleContainer';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import {Reducers, States, GriddleReducer} from 'griddle-core';
import { GriddleActions } from 'griddle-core';
import { GriddleHelpers as Helpers } from 'griddle-core'
import compose from 'lodash.compose';

export const previousOrCombined = (previous, newValue) => {
  return newValue ? [...previous, newValue] : previous;
}

export function combinePlugins(plugins) {
  return plugins.reduce((previous, current) => (
    {
      actions: Object.assign(previous.actions, current.actions),
      reducers: previousOrCombined(previous.reducers, current.reducers),
      states: previousOrCombined(previous.states, current.states),
      helpers: previousOrCombined(previous.helpers, current.helpers),
      components: previousOrCombined(previous.components, current.components),
    }
  ), { actions: GriddleActions, reducers: [], states: [], helpers: [], components: []})
}

export function composer(functions) {
  return compose.apply(this, functions.reverse())
}

export const combineComponents = ({ plugins = null, components = null }) => {
  if(!plugins || !components) { return; }

  const composedComponents = {}
  //for every plugin in griddleComponents compose the the matching plugins with the griddle component at the end
  //TODO: This is going to be really slow -- we need to clean this up
  for(var key in components) {
    if(plugins.some(p => p.components.hasOwnProperty(key))) {
      composedComponents[key] = composer(
        plugins
          .filter(p => p.components.hasOwnProperty(key))
          .map(p => p.components[key])
      )(components[key]);
    }
  }

  return composedComponents;
}

//Should return GriddleReducer and the new components
export const processPlugins = (plugins, originalComponents) => {
  if(!plugins) {
    return {
      actions: GriddleActions,
      reducer : GriddleReducer(
        [States.data, States.local],
        [Reducers.data, Reducers.local],
        [Helpers.data, Helpers.local]
      )};
  }

  const combinedPlugin = combinePlugins(plugins);
  const reducer = GriddleReducer(
    [States.data, States.local, ...combinedPlugin.states],
    [Reducers.data, Reducers.local, ...combinedPlugin.reducers],
    [Helpers.data, Helpers.local, ...combinedPlugin.helpers]
  );

  const components = combineComponents({ plugins, components: originalComponents });
  if(components) {
    return { actions: combinedPlugin.actions, components, reducer }
  }

  return({ actions: combinedPlugin.actions, reducer });
}

export const bindStoreToActions = (actions, actionsToBind, store) => {
  return Object.keys(actions).reduce((actions, actionKey) => {
    if (actionsToBind.indexOf(actions[actionKey]) > -1) {
      // Bind the store to the action if it's in the array.
      actions[actionKey] = actions[actionKey].bind(null, store)
    }
    return actions;
  }, actions);
}

export const processPluginActions = (actions, plugins, store) => {
  if (!plugins) {
    return actions;
  }

  // Bind store to necessary actions.
  return plugins.reduce((previous, current) => {
    const processActions = current.storeBoundActions && current.storeBoundActions.length > 0;
    return processActions ? bindStoreToActions(previous, current.storeBoundActions, store) : actions;
  }, actions);
}

export var GriddleRedux = ({Griddle, Components, Plugins}) => class GriddleRedux extends Component {
  constructor(props, context) {
    super(props, context);
    //TODO: Switch this around so that the states and the reducers come in as props.
    //      if nothing is specified, it should default to the local one maybe

    let { actions, reducer, components } =  processPlugins(Plugins, Components);

    // Use the thunk middleware to allow for multiple dispatches in a single action.
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

    /* set up the redux store */
    const combinedReducer = combineReducers(reducer);
    this.store = createStoreWithMiddleware(reducer);

    // Update the actions with the newly created store.
    actions = processPluginActions(actions, Plugins, this.store);

    this.components = components;
    this.component = GriddleContainer(actions)(Griddle);
  }

  render() {
    return (
      <Provider store={this.store}>
        <this.component {...this.props} components={this.components}>
          {this.props.children}
        </this.component>
      </Provider>
    )
  }

  static PropTypes = {
    data: React.PropTypes.array.isRequired
  }
}
