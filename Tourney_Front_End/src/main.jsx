// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )



import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


import { BrowserRouter } from 'react-router-dom';

import OrganizerContextProvider from './Contexts/OrganizerContext/OrganizerContext';
import AdminContextProvider from './Contexts/AdminContext/AdminContext';
import PlayerContextProvider from './Contexts/PlayerContext/PlayerContext';





createRoot(document.getElementById('root')).render(
  <BrowserRouter> 
   <AdminContextProvider>
    <OrganizerContextProvider>
     <PlayerContextProvider>
      <App />
     </PlayerContextProvider>
    </OrganizerContextProvider>
   </AdminContextProvider>
  </BrowserRouter>
)
