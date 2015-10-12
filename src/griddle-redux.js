import React, { Component } from 'react';
import { GriddleContainer } from './griddleContainer';

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import {Reducers, States, GriddleReducer} from 'griddle-core';
import { GriddleActions } from 'griddle-core';
import { GriddleHelpers as Helpers } from 'griddle-core'

export var GriddleRedux = ComposedComponent => class GriddleRedux extends Component {
  constructor(props, context) {
    super(props, context);
    //TODO: Switch this around so that the states and the reducers come in as props.
    //      if nothing is specified, it should default to the local one maybe

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
    this.component = GriddleContainer(ComposedComponent);
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
