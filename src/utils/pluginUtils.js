import compose from 'lodash.compose';
import { createSelector, createStructuredSelector } from 'reselect';

import { Reducers, States, GriddleReducer, Selectors, Utils, GriddleActions } from 'griddle-core';
import { GriddleHelpers as Helpers } from 'griddle-core'

//This gets the previous and newValue if newValue exists
//other wise just the previous value
export const previousOrCombined = (previous, newValue) => {
  return newValue ? [...previous, newValue] : previous;
}

//Sets up a new plugin object for each plugin
export function combinePlugins(plugins) {
  return plugins.reduce((previous, current) => (
    {
      actions: Object.assign(previous.actions, current.actions),
      reducers: previousOrCombined(previous.reducers, current.reducers),
      states: previousOrCombined(previous.states, current.states),
      helpers: previousOrCombined(previous.helpers, current.helpers),
      components: previousOrCombined(previous.components, current.components),
      selectors: previousOrCombined(previous.selectors, current.selectors)
    }
  ), { actions: GriddleActions, reducers: [], states: [], helpers: [], components: [], selectors: []})
}

let combinedPlugins = null;

export function getCombinedPlugins(plugins) {
  if (combinedPlugins === null) {
    combinedPlugins = combinePlugins(plugins);
  }

  return combinedPlugins;
}

//composes functions left to right
export function composer(functions) {
  return compose.apply(this, functions.reverse())
}

//combines and wraps the components -- not a big fan of how this is implemented
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

export const processSelectors = (plugins) => {
  Selectors.localSelectors.registerUtils(Utils.sortUtils);
  if(!plugins) {
    return Selectors.localSelectors.griddleStateSelector
  }

  const combinedPlugin = getCombinedPlugins(plugins);

  var qqq = createSelector();
debugger;
  return Object.assign(Selectors.localSelectors, ...combinedPlugin.selectors);
}

//Should return GriddleReducer and the new components
export const processPlugins = (plugins, originalComponents) => {
  //TODO: This needs to go in favor of passing the sort props to the selectors

  if(!plugins) {
    return {
      actions: GriddleActions,
      reducer : GriddleReducer(
        [States.data, States.local],
        [Reducers.data, Reducers.local],
        [Helpers.data, Helpers.local]
      )};
  }

  const combinedPlugin = getCombinedPlugins(plugins);
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

//TODO: Can this go away and just be part of connect?
export const bindStoreToActions = (actions, actionsToBind, store) => {
  return Object.keys(actions).reduce((actions, actionKey) => {
    if (actionsToBind.indexOf(actions[actionKey]) > -1) {
      // Bind the store to the action if it's in the array.
      actions[actionKey] = actions[actionKey].bind(null, store)
    }
    return actions;
  }, actions);

}
