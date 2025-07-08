import React from 'react'

import './App.css';

import {Routes,Route} from 'react-router-dom';

import Home from './Pages/Home';
import Navigation from './Components/Navigation';
import SignUpOptions from './Components/SignUpOptions';




import OrganizerHome from './Pages/Organizer/OrganizerHome';
import OrganizerTournament from './Pages/Organizer/OrganizerTournament';
import CreateTournament from './Pages/Organizer/CreateTournament';
import Tournament from './Pages/Organizer/Tournament';
import Events from './Pages/Organizer/Events';
import Fixtures from './Pages/Organizer/Fixtures';

import { ToastContainer, Bounce } from 'react-toastify';




import PlayerLogin from './Components/Auth/Player/PlayerLogin';
import PlayerSignUp from './Components/Auth/Player/PlayerSignUp';
import OtpPlayer from './Pages/Player/OtpPlayer';
import OrganizerLogin from './Components/Auth/Organizer/OrganizerLogin';
import OrganizerSignUp from './Components/Auth/Organizer/OrganizerSignUp';
import OTP from './Pages/Organizer/OTP';




import AdminLogin from "./Components/Auth/Admin/AdminLogin";

import DashboardPage from "./Pages/Admin/pages/dashboard/index";
import Layout from "./Pages/Admin/components/layout/Layout";
import TournamentManagement from "./Pages/Admin/pages/dashboard/components/TournamentMangement";
import TournamentForm from "./Pages/Admin/pages/dashboard/components/TournamentForm";
import PlayersTable from "./Pages/Admin/pages/dashboard/components/PlayersTable";
import OrganizationsTable from "./Pages/Admin/pages/dashboard/components/OrganizationsTable";






import { OrganizerContext } from './Contexts/OrganizerContext/OrganizerContext'
import { useContext, useEffect } from 'react';

import { PlayerContext } from './Contexts/PlayerContext/PlayerContext';










const App = () => {


  const { getAuthStatusOrganizer } = useContext(OrganizerContext);

  const { getAuthStatusPlayer } = useContext(PlayerContext);

  useEffect(()=>{ 
    getAuthStatusOrganizer();
    getAuthStatusPlayer();
  },[]);


  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path='/roleSelection' element={<SignUpOptions/>}/>


        {/* Organizer Routes */}

        <Route path='/organizer/home' element={<OrganizerHome/>}/>
        <Route path='/organizer/tournaments' element={<OrganizerTournament/>}/>
        <Route path='/organizer/createTournament' element={<CreateTournament/>}/>
        <Route path='/organizer/tournament/:id' element={<Tournament/>}/>
        <Route path='/organizer/tournament/:id/fixtures' element={<Fixtures/>}/>


        {/* Auth Routes */}

        {/* Player Routes */}
        <Route path='/login/player' element={<PlayerLogin/>}/>
        <Route path='/signup/player' element={<PlayerSignUp/>}/>
        <Route path='/otp/player' element={<OtpPlayer/>}/>

        {/* Organizer Routes */}
        <Route path='/login/organizer' element={<OrganizerLogin/>}/>
        <Route path='/signup/organizer' element={<OrganizerSignUp/>}/>
        <Route path='/otp/organizer' element={<OTP/>}/>

        {/* Admin Routes */}
        {/* <Route path='/login/admin' element={<AdminLogin/>}/>
          <Route path="admin/dashboard" element={<DashboardPage />} /> */}
        <Route path="/login/admin" element={<AdminLogin />} />

        <Route path="/admin" element={<Layout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tournaments" element={<TournamentManagement />} />
          <Route path="add-tournament" element={<TournamentForm />} />
          <Route path="players" element={<PlayersTable />} />
          <Route path="organizations" element={<OrganizationsTable />} />
          </Route>
      </Routes>

      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick={false} rtl={false}pauseOnFocusLoss draggable pauseOnHover theme="light" transition={Bounce} />
      
    </div>
  )
}

export default App