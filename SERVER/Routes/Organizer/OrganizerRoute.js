import express from 'express';

const router = express.Router();

import { signUp,verifyEmailWithOTP,login,createTournament,getAllTournaments,getParticularTournament, getCurrentOrganizer, checkOrganizerAuthorization, logOut, createNewEvent, getAllEvents, createIndividual, createGroupTeam, getIndividualTeam, getGroupTeam, getPaymentDetails } from '../../Controllers/Organizers/OrganizerController.js';
import fixturesRoutes from './fixturesRoutes.js';

import { organizerAuthMidlleware } from '../../Middlewares/jwtAuth.js';


router.post('/signup',signUp);
router.post('/verifyEmailWithOTP',verifyEmailWithOTP);
router.post('/login',login);
router.post('/logout', organizerAuthMidlleware,logOut);
router.get('/checkAuth',organizerAuthMidlleware,checkOrganizerAuthorization);
router.get('/getOrganizerDetails',organizerAuthMidlleware, getCurrentOrganizer);
router.post('/createTournament',organizerAuthMidlleware,createTournament);
router.get('/getAllTournaments',organizerAuthMidlleware,getAllTournaments);
router.get('/getParticularTournament/:id',organizerAuthMidlleware,getParticularTournament);
router.post('/createEvent/:id',organizerAuthMidlleware,createNewEvent);
router.get('/allEvents/:TournamentId',organizerAuthMidlleware,getAllEvents);
router.post('/createIndividualTeam/:TournamentId/:eventId',organizerAuthMidlleware, createIndividual);
router.post('/createGroupTeam/:TournamentId/:eventId',organizerAuthMidlleware, createGroupTeam);
router.get('/getIndividualTeam/:TournamentId/:eventId',organizerAuthMidlleware, getIndividualTeam);
router.get('/getGroupTeam/:TournamentId/:eventId',organizerAuthMidlleware, getGroupTeam);
router.get('/getPaymentDetails/:TournamentId',organizerAuthMidlleware, getPaymentDetails);

// Fixtures sub-route
router.use('/fixtures', fixturesRoutes);



export default router;