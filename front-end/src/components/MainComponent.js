import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Header from './control/Header';
import ControlPanel from './control/ControlComponent';

import { GUIContext } from '../context/GUIContext';

const initial_state = { // initial state object that will be used in our reducer
    expert_mode: false,
    night_mode: false,
  };

const reducer = (state, action) => {

    return {
        ...state,
        expert_mode: action.expert_mode,
        night_mode: action.night_mode
    };

};

function Main() {

    const [state, dispatch] = React.useReducer(reducer, initial_state);
    return(
        <GUIContext.Provider value={{state, dispatch }}>
            <div>
                <Header />
                <ControlPanel />
            </div>
        </GUIContext.Provider>
    );

}

export default Main;
