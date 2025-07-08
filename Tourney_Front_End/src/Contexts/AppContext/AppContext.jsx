import React from 'react';

import { useState, createContext } from 'react';


import { useNavigate } from'react-router-dom';

const AppContext = createContext();


import { toast } from 'react-toastify';



const AppContextProvider = (props)=>{




    const value = {
        
    };


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )



}


export { AppContext };
export default AppContextProvider;