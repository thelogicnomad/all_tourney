import express from 'express';
import {
  getTeams,
  getFixtures,
  generateFixtures,
  updateFixture,
} from '../../Controllers/Organizers/FixtureController.js';
import { organizerAuthMidlleware } from '../../Middlewares/jwtAuth.js';

const router = express.Router();

// GET list of teams for a tournament (for fixtures page)
router.get('/:tournamentId/teams', organizerAuthMidlleware, getTeams);

// GET all fixtures for a tournament
router.get('/:tournamentId', organizerAuthMidlleware, getFixtures);

// POST generate fixtures
router.post('/:tournamentId/generate', organizerAuthMidlleware, generateFixtures);

// PUT update a particular fixture
router.put('/fixture/:fixtureId', organizerAuthMidlleware, updateFixture);

export default router;
