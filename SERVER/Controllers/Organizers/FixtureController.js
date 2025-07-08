import mongoose from 'mongoose';
import Tournament from '../../Models/Organizer/Tournament.js';
import Team from '../../Models/Organizer/Teams.js';
import Events from '../../Models/Organizer/Event.js';
import TeamIndividual from '../../Models/Organizer/TeamIndividual.js';
import TeamGroup from '../../Models/Organizer/TeamGroup.js';

// Lazy import to avoid circular deps
const getFixtureModel = async () => {
  const module = await import('../../Models/Fixture/FixtureModel.js');
  return module.default;
};

// Validate ObjectId helper
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to map round index to readable name
const getRoundName = (roundNum, totalRounds) => {
  const roundsFromEnd = totalRounds - 1 - roundNum;
  if (roundsFromEnd === 0) return 'Final';
  if (roundsFromEnd === 1) return 'Semi-Final';
  if (roundsFromEnd === 2) return 'Quarter-Final';
  if (roundsFromEnd === 3) return 'Round of 16';
  return `Round ${roundNum + 1}`;
};

// ----------------- Controllers -----------------

// GET  /api/organizer/fixtures/:tournamentId/teams   (optionally ?eventId=)
export const getTeams = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { eventId } = req.query || {};

    if (!isValidId(tournamentId)) {
      return res.json({ success: false, message: 'Invalid tournament id' });
    }

    // If eventId present, fetch participants based on event type
    if (eventId && isValidId(eventId)) {
      const event = await Events.findById(eventId);
      if (!event) return res.json({ success: false, message: 'Event not found' });

      let participants = [];
      if (event.eventType2 === 'individual') {
        participants = await TeamIndividual.find({ tournamentId, eventId });
        participants = participants.map((p) => ({ _id: p._id, name: p.name }));
      } else if (event.eventType2 === 'group') {
        participants = await TeamGroup.find({ tournamentId, eventId });
        participants = participants.map((t) => ({ _id: t._id, name: t.teamName }));
      }

      return res.json({ success: true, teams: participants });
    }

    // Fallback – classic teams attached to tournament
    const tournament = await Tournament.findById(tournamentId).populate('teams');
    if (!tournament) {
      return res.json({ success: false, message: 'Tournament not found' });
    }

    const teams = tournament.teams.map((t) => ({ _id: t._id, name: t.teamName }));
    return res.json({ success: true, teams });
  } catch (error) {
    console.log('Error in getTeams:', error);
    return res.json({ success: false, message: 'Error fetching teams' });
  }
};

// GET  /api/organizer/fixtures/:tournamentId
export const getFixtures = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { eventId } = req.query || {};

    if (!isValidId(tournamentId)) {
      return res.json({ success: false, message: 'Invalid tournament id' });
    }

    const Fixture = await getFixtureModel();
    const filter = { tournament: tournamentId };
    if (eventId && isValidId(eventId)) {
      filter.event = eventId;
    }

    const fixtures = await Fixture.find(filter);

    return res.json({ success: true, fixtures });
  } catch (error) {
    console.log('Error in getFixtures:', error);
    return res.json({ success: false, message: 'Error fetching fixtures' });
  }
};

// POST /api/organizer/fixtures/:tournamentId/generate
export const generateFixtures = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { eventId } = req.body || {};

    if (!isValidId(tournamentId)) {
      return res.json({ success: false, message: 'Invalid tournament id' });
    }

    const tournament = await Tournament.findById(tournamentId).populate('teams');
    if (!tournament) {
      return res.json({ success: false, message: 'Tournament not found' });
    }

    let participants = [];

    if (eventId && isValidId(eventId)) {
      const event = await Events.findById(eventId);
      if (!event) return res.json({ success: false, message: 'Event not found' });

      if (event.eventType2 === 'individual') {
        const inds = await TeamIndividual.find({ tournamentId, eventId });
        participants = inds.map((p) => p._id.toString());
      } else if (event.eventType2 === 'group') {
        const grps = await TeamGroup.find({ tournamentId, eventId });
        participants = grps.map((g) => g._id.toString());
      }
    }

    if (!participants.length) {
      // fallback to tournament teams
      participants = tournament.teams.map((t) => t._id.toString());
    }

    if (participants.length < 2) {
      return res.json({ success: false, message: 'Need at least 2 participants to generate fixtures' });
    }

    // Shuffle participants
    participants = participants.sort(() => 0.5 - Math.random());

    // Pad to next power of 2 (knockout bracket)
    const nextPower = Math.pow(2, Math.ceil(Math.log2(participants.length)));
    while (participants.length < nextPower) participants.push(null);

    const Fixture = await getFixtureModel();

    // Remove previous fixtures for this tournament/event
    await Fixture.deleteMany({ tournament: tournamentId, ...(eventId ? { event: eventId } : {}) });

    const totalRounds = Math.log2(nextPower);
    const docs = [];
    let current = participants;
    let round = 0;

    while (current.length > 1) {
      for (let i = 0; i < current.length; i += 2) {
        docs.push({
          tournament: tournamentId,
          event: eventId,
          round,
          roundName: getRoundName(round, totalRounds),
          matchIndex: i / 2,
          teamA: current[i],
          teamB: current[i + 1],
          status: 'scheduled',
        });
      }
      current = new Array(current.length / 2).fill(null);
      round += 1;
    }

    const created = await Fixture.insertMany(docs);
    return res.json({ success: true, fixtures: created });
  } catch (error) {
    console.log('Error in generateFixtures:', error);
    return res.json({ success: false, message: 'Error generating fixtures' });
  }
};

// PUT /api/organizer/fixtures/fixture/:fixtureId
export const updateFixture = async (req, res) => {
  try {
    const { fixtureId } = req.params;
    if (!isValidId(fixtureId)) {
      return res.json({ success: false, message: 'Invalid fixture id' });
    }

    const Fixture = await getFixtureModel();

    const allowed = ['status', 'scoreA', 'scoreB', 'winner', 'scheduledAt', 'notes'];
    const updateData = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    const updated = await Fixture.findByIdAndUpdate(fixtureId, updateData, { new: true }).populate(
      'teamA teamB winner'
    );
    if (!updated) return res.json({ success: false, message: 'Fixture not found' });

    // propagate winner to next round
    if (updateData.winner) {
      try {
        const nextFilter = {
          tournament: updated.tournament,
          event: updated.event,
          round: updated.round + 1,
          matchIndex: Math.floor(updated.matchIndex / 2),
        };
        const nextFix = await Fixture.findOne(nextFilter);
        if (nextFix) {
          if (updated.matchIndex % 2 === 0) {
            nextFix.teamA = updateData.winner;
          } else {
            nextFix.teamB = updateData.winner;
          }
          await nextFix.save();
        }
      } catch (err) {
        console.log('Error propagating winner:', err);
      }
    }

    return res.json({ success: true, fixture: updated });
  } catch (error) {
    console.log('Error in updateFixture:', error);
    return res.json({ success: false, message: 'Error updating fixture' });
  }
};
