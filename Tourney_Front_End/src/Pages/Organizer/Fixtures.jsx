// Tournament Fixtures Page – Knock-out Bracket UI that integrates with backend fixtures API
// This file is largely as provided by the user, with only minimal tweaks (backend URL helpers removed
// because we now rely on lib/api.js), plus PropTypes cleanup.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  fetchTeams,
  fetchFixtures,
  generateFixtures,
  updateFixture,
} from '../../lib/api.js';
import { Plus, Trash2, RotateCcw, Trophy, Users, User } from 'lucide-react';

const TournamentBracket = () => {
  // ---------------------------- STATE -----------------------------
  const [competitionType, setCompetitionType] = useState('teams');
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [bracket, setBracket] = useState([]);
  const [fixtureMap, setFixtureMap] = useState({});
  // Maps for quick id<->name lookup when persisting winners
  const idNameMap = useMemo(() => Object.fromEntries(participants.map(p => [p._id.toString(), p.name || p.teamName])), [participants]);
  const nameIdMap = useMemo(() => Object.fromEntries(participants.map(p => [(p.name || p.teamName), p._id.toString()])), [participants]);
  const [winners, setWinners] = useState({});
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayer1, setNewPlayer1] = useState('');
  const [newPlayer2, setNewPlayer2] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [playerPairs, setPlayerPairs] = useState([
    { player1: 'John Smith', player2: 'Jane Doe' },
    { player1: 'Mike Johnson', player2: 'Sarah Wilson' },
    { player1: 'David Brown', player2: 'Lisa Davis' },
    { player1: 'Tom Anderson', player2: 'Emma Taylor' },
  ]);

  const { tournamentId, id } = useParams();
  const [searchParams] = useSearchParams();
  const tid = tournamentId || id;
  const eventId = searchParams.get('eventId');

  // simple 24-char hex check for Mongo ObjectId
  const isValidObjectId = (val) => /^[a-f\d]{24}$/i.test(val);

  // Trigger backend bracket generation explicitly
  const handleGenerateFixtures = async () => {
    if (!tid) return;
    try {
      await generateFixtures(tid, eventId);
      // Reload fixtures after generation
      const fxs = await fetchFixtures(tid, eventId);
      // simple way: reload page state
      window.location.reload();
    } catch (err) {
      console.error('Failed to generate fixtures', err);
    }
  };

  // Fetch teams
  useEffect(() => {
    if (!tid || !isValidObjectId(tid)) return;
    (async () => {
      try {
        const t = await fetchTeams(tid, eventId);
        setParticipants(t);
        setTeams(t.map((x) => x.teamName || x.name));
      } catch (err) {
        console.error('Failed to load teams', err);
        setLoadError(true);
      }
    })();
  }, [tid, eventId]);

  // Fetch fixtures and build bracket structure (runs after participants are loaded)
  useEffect(() => {
    if (!tid || !isValidObjectId(tid) || participants.length === 0) return;
    (async () => {
      try {
        let fixtures = await fetchFixtures(tid, eventId);
        if (!Array.isArray(fixtures) || !fixtures.length) {
          fixtures = await generateFixtures(tid, eventId);
        }
        if (!fixtures.length) return;

        const map = {};
        const roundsObj = {};
        const initialWinners = {};

        fixtures.forEach((fx) => {
          const matchId = `round${fx.round}_match${fx.matchIndex}`;
          map[matchId] = fx;
          const getName = (teamField) => {
            if (!teamField) return null;
             if (typeof teamField === 'string') return idNameMap[teamField] || null;
            if (typeof teamField === 'object') {
              if (teamField.name) return teamField.name;
              if (teamField.teamName) return teamField.teamName;
              if (teamField._id) return idNameMap[teamField._id.toString()] || null;
              if (teamField.$oid) return idNameMap[teamField.$oid.toString()] || null;
            }
            // Handle raw ObjectId or unmatched cases
            try {
              const strId = teamField.toString();
              if (idNameMap[strId]) return idNameMap[strId];
            } catch {}
            return null;
          };
          const p1 = getName(fx.teamA);
          const p2 = getName(fx.teamB);
          if (!roundsObj[fx.round]) roundsObj[fx.round] = [];
          roundsObj[fx.round].push({
            id: matchId,
            participant1: p1,
            participant2: p2,
            round: fx.round,
            matchIndex: fx.matchIndex,
          });
          if (fx.winner) {
            const wName = idNameMap[fx.winner.toString()] || null;
            if (wName) initialWinners[matchId] = wName;
          }
        });

        const totalRounds = Object.keys(roundsObj).length;
        const arr = Object.keys(roundsObj)
          .sort((a, b) => a - b)
          .map((roundNum) => ({
            roundNumber: Number(roundNum),
            roundName: getRoundName(Number(roundNum), totalRounds),
            matches: roundsObj[roundNum].sort((a, b) => a.matchIndex - b.matchIndex),
          }));

        setBracket(arr);
        setFixtureMap(map);
        setWinners((prev) => ({ ...prev, ...initialWinners }));
      } catch (err) {
        console.error('Failed to load fixtures', err);
      }
    })();
  }, [tid, participants, eventId]);

  // Helpers
  const getRoundName = (roundNum, totalRounds) => {
    const roundsFromEnd = totalRounds - 1 - roundNum;
    if (roundsFromEnd === 0) return 'Final';
    if (roundsFromEnd === 1) return 'Semi-Final';
    if (roundsFromEnd === 2) return 'Quarter-Final';
    if (roundsFromEnd === 3) return 'Round of 16';
    return `Round ${roundNum + 1}`;
  };

  // Generate bracket client-side (used when backend fixtures missing / local scenario)
  const generateBracket = useCallback((participants) => {
    if (participants.length < 2) return [];
    const nextPower = Math.pow(2, Math.ceil(Math.log2(participants.length)));
    const padded = [...participants];
    while (padded.length < nextPower) padded.push(null);
    const rounds = [];
    let current = padded;
    let roundNum = 0;
    while (current.length > 1) {
      const matches = [];
      for (let i = 0; i < current.length; i += 2) {
        matches.push({
          id: `round${roundNum}_match${i / 2}`,
          participant1: current[i],
          participant2: current[i + 1],
          round: roundNum,
          matchIndex: i / 2,
        });
      }
      rounds.push({
        roundNumber: roundNum,
        roundName: getRoundName(roundNum, Math.log2(nextPower)),
        matches,
      });
      current = new Array(current.length / 2).fill(null);
      roundNum += 1;
    }
    return rounds;
  }, []);

  // current participants: memoized
  const currentParticipants = useMemo(() => {
    return competitionType === 'teams'
      ? teams
      : playerPairs.map((p) => (p.player2 ? `${p.player1} & ${p.player2}` : `${p.player1} (Solo)`));
  }, [competitionType, teams, playerPairs]);

  // Generate bracket locally when fixtureMap empty
  useEffect(() => {
    if (Object.keys(fixtureMap).length) return;
    setBracket(generateBracket(currentParticipants));
    setWinners({});
  }, [currentParticipants, generateBracket, fixtureMap]);

  // ------- Winner selection & persistence --------
  const selectWinner = useCallback(
    async (matchId, winnerName, match) => {
      const newWinners = { ...winners };
      if (newWinners[matchId] === winnerName) {
        delete newWinners[matchId];
        clearSubsequentWinners(match, newWinners);
      } else {
        if (newWinners[matchId]) clearSubsequentWinners(match, newWinners);
        newWinners[matchId] = winnerName;
      }
      setWinners(newWinners);
      updateNextRound(match, newWinners[matchId] || null);

      // Persist to backend
      try {
        const fx = fixtureMap[matchId];
        if (fx) {
          const winnerId = nameIdMap[winnerName]; // already string
          if (winnerId) {
            await updateFixture(fx._id, { winner: winnerId, status: 'completed' });
          }
        }
      } catch (err) {
        console.error('Failed to update fixture', err);
      }
    },
    [winners, fixtureMap, nameIdMap]
  );

  const clearSubsequentWinners = (match, winnersObj) => {
    const { round, matchIndex } = match;
    for (let r = round + 1; r < bracket.length; r++) {
      const nextMatchId = `round${r}_match${Math.floor(matchIndex / Math.pow(2, r - round))}`;
      if (winnersObj[nextMatchId]) {
        delete winnersObj[nextMatchId];
        const nextMatch = bracket[r]?.matches.find((m) => m.id === nextMatchId);
        if (nextMatch) clearSubsequentWinners(nextMatch, winnersObj);
      }
    }
  };

  const updateNextRound = (match, winner) => {
    if (match.round >= bracket.length - 1) return;
    setBracket((prev) => {
      const next = [...prev];
      const nextRoundIdx = match.round + 1;
      const nextMatchIdx = Math.floor(match.matchIndex / 2);
      const isFirst = match.matchIndex % 2 === 0;
      if (next[nextRoundIdx]?.matches[nextMatchIdx]) {
        const nm = next[nextRoundIdx].matches[nextMatchIdx];
        if (isFirst) nm.participant1 = winner;
        else nm.participant2 = winner;
      }
      return next;
    });
  };

  // ------- CRUD helpers for participants UI (local only) --------
  const addTeam = () => {
    if (newTeamName.trim()) {
      setTeams((prev) => [...prev, newTeamName.trim()]);
      setNewTeamName('');
      setShowAddForm(false);
    }
  };
  const addPlayerPair = () => {
    if (newPlayer1.trim()) {
      setPlayerPairs((prev) => [...prev, { player1: newPlayer1.trim(), player2: newPlayer2.trim() || null }]);
      setNewPlayer1('');
      setNewPlayer2('');
      setShowAddForm(false);
    }
  };
  const removeTeam = (i) => setTeams((prev) => prev.filter((_, idx) => idx !== i));
  const removePlayerPair = (i) => setPlayerPairs((prev) => prev.filter((_, idx) => idx !== i));
  const resetTournament = () => {
    setWinners({});
    setBracket(generateBracket(currentParticipants));
  };
  const switchCompetitionType = (type) => {
    setCompetitionType(type);
    setWinners({});
    setShowAddForm(false);
  };

  const truncateName = (n, max = 15) => (n ? (n.length > max ? n.slice(0, max) + '…' : n) : 'TBD');

  // UI helpers for player pairs
  const parsePlayerDisplay = (name) => {
    if (competitionType !== 'players' || !name) return null;
    if (name.includes(' & ')) {
      const [p1, p2] = name.split(' & ');
      return { player1: p1.trim(), player2: p2.trim() };
    }
    if (name.includes(' (Solo)')) return { player1: name.replace(' (Solo)', ''), player2: null };
    return null;
  };

  const ParticipantDisplay = ({ name, isWinner, onClick, className = '' }) => {
    const playerInfo = parsePlayerDisplay(name);
    if (competitionType === 'players' && playerInfo) {
      return (
        <div
          className={`${className} cursor-pointer transition-all duration-200 p-3 rounded-lg border-2 ${
            isWinner
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg transform scale-105'
              : 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-md'
          }`}
          onClick={onClick}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-500">{isWinner ? '🏆 WINNER' : 'PAIR'}</div>
              {isWinner && <Trophy size={16} className="text-yellow-300" />}
            </div>
            <div className="space-y-1">
              <div className="bg-blue-50 px-2 py-1 rounded text-sm font-medium">
                {truncateName(playerInfo.player1, 12)}
              </div>
              {playerInfo.player2 && (
                <div className="bg-blue-50 px-2 py-1 rounded text-sm font-medium">
                  {truncateName(playerInfo.player2, 12)}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div
        className={`${className} cursor-pointer transition-all duration-200 p-3 rounded-lg border-2 flex items-center justify-between ${
          isWinner
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg transform scale-105'
            : 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-md'
        }`}
        onClick={onClick}
      >
        <span className="font-medium" title={name}>
          {truncateName(name)}
        </span>
        {isWinner && <Trophy size={16} className="text-yellow-300" />}
      </div>
    );
  };

  const MatchComponent = ({ match }) => {
    const { id, participant1, participant2 } = match;
    const winner = winners[id];
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4 mb-6 transition-all duration-300 hover:shadow-xl">
        <div className="text-center mb-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            Match {match.matchIndex + 1}
          </span>
        </div>
        {participant1 ? (
          <ParticipantDisplay
            name={participant1}
            isWinner={winner === participant1}
            onClick={() => selectWinner(id, participant1, match)}
            className="mb-3"
          />
        ) : (
          <div className="p-3 mb-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <span className="text-gray-400">Waiting…</span>
          </div>
        )}
        <div className="text-center py-2">
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">VS</span>
        </div>
        {participant2 ? (
          <ParticipantDisplay
            name={participant2}
            isWinner={winner === participant2}
            onClick={() => selectWinner(id, participant2, match)}
          />
        ) : participant1 ? (
          <div
            className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg text-center cursor-pointer hover:from-yellow-500 hover:to-orange-500 transition-all"
            onClick={() => selectWinner(id, participant1, match)}
          >
            <span className="font-bold">AUTO ADVANCE</span>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <span className="text-gray-400">Waiting…</span>
          </div>
        )}
      </div>
    );
  };

  const finalWinner = bracket.length ? winners[`round${bracket.length - 1}_match0`] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Tournament Bracket</h1>
          <p className="text-gray-600">Manage your tournament with ease</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => switchCompetitionType('teams')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                competitionType === 'teams'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users size={20} />
              Teams ({teams.length})
            </button>
            <button
              onClick={() => switchCompetitionType('players')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                competitionType === 'players'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User size={20} />
              Players ({playerPairs.length} pairs)
            </button>
          </div>

          {/* Participants list */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Current {competitionType === 'teams' ? 'Teams' : 'Player Pairs'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
              {competitionType === 'teams'
                ? teams.map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <span className="font-medium">{t}</span>
                      <button
                        onClick={() => removeTeam(i)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                : playerPairs.map((pair, i) => (
                    <div key={i} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <span className="font-medium">
                        {pair.player2 ? `${pair.player1} & ${pair.player2}` : `${pair.player1} (Solo)`}
                      </span>
                      <button
                        onClick={() => removePlayerPair(i)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
            </div>
          </div>

          {/* Add form */}
          {showAddForm ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              {competitionType === 'teams' ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter team name…"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTeam()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={addTeam}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Add Team
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Player 1 name…"
                      value={newPlayer1}
                      onChange={(e) => setNewPlayer1(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Player 2 name (optional)…"
                      value={newPlayer2}
                      onChange={(e) => setNewPlayer2(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addPlayerPair()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={addPlayerPair}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Add Players
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Plus size={20} />
                Add {competitionType === 'teams' ? 'Team' : 'Players'}
              </button>
              <button
                onClick={handleGenerateFixtures}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Trophy size={20} />
                Generate Fixtures
              </button>
              <button
                onClick={resetTournament}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <RotateCcw size={20} />
                Reset Bracket
              </button>
            </div>
          )}
        </div>

        {/* Bracket */}
        {bracket.length ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="overflow-x-auto">
              <div className="flex gap-12 min-w-max py-4">
                {bracket.map((round) => (
                  <div key={round.roundNumber} className="min-w-[300px]">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-blue-600 mb-2">{round.roundName}</h3>
                      <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      {round.matches.map((m) => (
                        <MatchComponent key={m.id} match={m} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">Ready to Start?</h3>
            <p className="text-gray-600">Add at least 2 {competitionType} to generate the tournament bracket</p>
          </div>
        )}

        {finalWinner && (
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white px-8 py-6 rounded-2xl inline-block shadow-2xl transform hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-2xl font-bold mb-2">TOURNAMENT CHAMPION</h2>
              <p className="text-xl font-semibold">{finalWinner}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentBracket;
