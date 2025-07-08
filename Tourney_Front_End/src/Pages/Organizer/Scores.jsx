import React, { useState } from 'react';
import './CSS/Scores.css';
import { IoAdd, IoSearchOutline, IoFilterOutline, IoEyeOutline, IoCreateOutline, IoTrashOutline, IoTrophyOutline, IoStatsChartOutline, IoCalendarOutline, IoClose, IoCheckmarkCircle, IoTimeOutline, IoRefreshOutline, IoSaveOutline } from 'react-icons/io5';

const Scores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showLiveScoringModal, setShowLiveScoringModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Mock events data
  const events = ['U9 BS', 'U9 GS', 'U11 BS', 'U11 GS', 'U13 BS', 'U13 GS', 'U15 BS', 'U15 GS', 'U17 BS', 'U17 GS'];

  // Mock matches data for live scoring
  const [matches, setMatches] = useState([
    { 
      id: 1, 
      event: 'U9 BS', 
      player1: 'John Doe', 
      player2: 'Jane Smith', 
      status: 'Live',
      currentSet: 3,
      currentScore: { player1: 15, player2: 12 },
      sets: [
        { player1: 21, player2: 18, completed: true },
        { player1: 19, player2: 21, completed: true },
        { player1: 15, player2: 12, completed: false }
      ],
      matchDate: '2024-07-15',
      matchTime: '09:30 AM'
    },
    { 
      id: 2, 
      event: 'U11 GS', 
      player1: 'Mike Johnson', 
      player2: 'Sarah Wilson', 
      status: 'Upcoming',
      currentSet: 1,
      currentScore: { player1: 0, player2: 0 },
      sets: [
        { player1: 0, player2: 0, completed: false }
      ],
      matchDate: '2024-07-15',
      matchTime: '10:00 AM'
    },
    { 
      id: 3, 
      event: 'U13 BS', 
      player1: 'Alex Brown', 
      player2: 'Chris Davis', 
      status: 'Completed',
      currentSet: 2,
      currentScore: { player1: 21, player2: 16 },
      sets: [
        { player1: 21, player2: 19, completed: true },
        { player1: 21, player2: 16, completed: true }
      ],
      matchDate: '2024-07-15',
      matchTime: '11:30 AM'
    }
  ]);

  const filteredMatches = matches.filter(match => {
    const matchesSearch = 
      match.player1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.player2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent === 'all' || match.event === filterEvent;
    const matchesStatus = filterStatus === 'all' || match.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  const handleStartLiveScoring = (match) => {
    setSelectedMatch(match);
    setShowLiveScoringModal(true);
  };

  const handleCloseLiveScoring = () => {
    setShowLiveScoringModal(false);
    setSelectedMatch(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'scores-status-completed';
      case 'live':
        return 'scores-status-live';
      case 'upcoming':
        return 'scores-status-upcoming';
      default:
        return 'scores-status-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <IoCheckmarkCircle />;
      case 'live':
        return <IoTimeOutline />;
      case 'upcoming':
        return <IoCalendarOutline />;
      default:
        return null;
    }
  };

  return (
    <div className="scores-container">
      {/* Scores Header */}
      <div className="scores-header">
        <div className="scores-title-section">
          <h2 className="scores-main-title">Live Scoring</h2>
          <p className="scores-subtitle">Real-time match scoring and management</p>
        </div>
      </div>

      {/* Score Statistics */}
      <div className="scores-stats-grid">
        <div className="scores-stat-card">
          <div className="scores-stat-content">
            <div className="scores-stat-text">
              <span className="scores-stat-label">Total Matches</span>
              <span className="scores-stat-value">{matches.length}</span>
            </div>
            <div className="scores-stat-icon">
              <IoStatsChartOutline />
            </div>
          </div>
        </div>
        <div className="scores-stat-card">
          <div className="scores-stat-content">
            <div className="scores-stat-text">
              <span className="scores-stat-label">Live Matches</span>
              <span className="scores-stat-value">{matches.filter(m => m.status === 'Live').length}</span>
            </div>
            <div className="scores-stat-icon">
              <IoTimeOutline />
            </div>
          </div>
        </div>
        <div className="scores-stat-card">
          <div className="scores-stat-content">
            <div className="scores-stat-text">
              <span className="scores-stat-label">Completed</span>
              <span className="scores-stat-value">{matches.filter(m => m.status === 'Completed').length}</span>
            </div>
            <div className="scores-stat-icon">
              <IoCheckmarkCircle />
            </div>
          </div>
        </div>
        <div className="scores-stat-card">
          <div className="scores-stat-content">
            <div className="scores-stat-text">
              <span className="scores-stat-label">Upcoming</span>
              <span className="scores-stat-value">{matches.filter(m => m.status === 'Upcoming').length}</span>
            </div>
            <div className="scores-stat-icon">
              <IoCalendarOutline />
            </div>
          </div>
        </div>
      </div>

      {/* Scores Controls */}
      <div className="scores-controls">
        <div className="scores-search-wrapper">
          <IoSearchOutline className="scores-search-icon" />
          <input
            type="text"
            placeholder="Search matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="scores-search-input"
          />
        </div>

        <div className="scores-filters">
          <div className="scores-filter-group">
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="scores-filter-select"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>

          <div className="scores-filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="scores-filter-select"
            >
              <option value="all">All Status</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="scores-matches-container">
        <h3 className="scores-matches-title">Matches</h3>
        <div className="scores-matches-list">
          {filteredMatches.map((match) => (
            <div key={match.id} className="scores-match-card">
              <div className="scores-match-header">
                <div className="scores-match-info">
                  <span className="scores-match-event">{match.event}</span>
                  <span className={`scores-match-status ${getStatusBadgeClass(match.status)}`}>
                    {getStatusIcon(match.status)}
                    {match.status}
                  </span>
                </div>
                <div className="scores-match-time">
                  {match.matchDate} • {match.matchTime}
                </div>
              </div>
              
              <div className="scores-match-players">
                <span className="scores-player-name">{match.player1}</span>
                <span className="scores-vs">vs</span>
                <span className="scores-player-name">{match.player2}</span>
              </div>
              
              <div className="scores-match-score">
                <span className="scores-current-score">
                  Score: {match.currentScore.player1} - {match.currentScore.player2}
                </span>
              </div>
              
              <div className="scores-match-actions">
                <button 
                  className="scores-live-scoring-btn"
                  onClick={() => handleStartLiveScoring(match)}
                >
                  {match.status === 'Live' ? 'Continue Scoring' : 'Start Live Scoring'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Scoring Modal */}
      {showLiveScoringModal && selectedMatch && (
        <LiveScoringModal 
          match={selectedMatch}
          onClose={handleCloseLiveScoring}
          onUpdateMatch={(updatedMatch) => {
            setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
          }}
        />
      )}
    </div>
  );
};

// Live Scoring Modal Component
const LiveScoringModal = ({ match, onClose, onUpdateMatch }) => {
  const [currentMatch, setCurrentMatch] = useState({ ...match });
  const [isMatchComplete, setIsMatchComplete] = useState(false);

  const updateScore = (player, increment) => {
    const newMatch = { ...currentMatch };
    const currentSetIndex = newMatch.currentSet - 1;
    
    if (increment) {
      if (player === 'player1') {
        newMatch.currentScore.player1++;
        newMatch.sets[currentSetIndex].player1++;
      } else {
        newMatch.currentScore.player2++;
        newMatch.sets[currentSetIndex].player2++;
      }
    } else {
      if (player === 'player1' && newMatch.currentScore.player1 > 0) {
        newMatch.currentScore.player1--;
        newMatch.sets[currentSetIndex].player1--;
      } else if (player === 'player2' && newMatch.currentScore.player2 > 0) {
        newMatch.currentScore.player2--;
        newMatch.sets[currentSetIndex].player2--;
      }
    }

    // Check if set is complete (21 points with 2-point lead or first to 30)
    const p1Score = newMatch.currentScore.player1;
    const p2Score = newMatch.currentScore.player2;
    
    if ((p1Score >= 21 && p1Score - p2Score >= 2) || p1Score >= 30) {
      // Player 1 wins the set
      newMatch.sets[currentSetIndex].completed = true;
      checkMatchCompletion(newMatch, 'player1');
    } else if ((p2Score >= 21 && p2Score - p1Score >= 2) || p2Score >= 30) {
      // Player 2 wins the set
      newMatch.sets[currentSetIndex].completed = true;
      checkMatchCompletion(newMatch, 'player2');
    }

    setCurrentMatch(newMatch);
  };

  const checkMatchCompletion = (match, setWinner) => {
    const completedSets = match.sets.filter(set => set.completed);
    let player1Sets = 0;
    let player2Sets = 0;

    completedSets.forEach(set => {
      if (set.player1 > set.player2) player1Sets++;
      else player2Sets++;
    });

    // Check if match is won (best of 3)
    if (player1Sets === 2 || player2Sets === 2) {
      match.status = 'Completed';
      setIsMatchComplete(true);
    } else {
      // Start new set
      match.currentSet++;
      match.sets.push({ player1: 0, player2: 0, completed: false });
      match.currentScore = { player1: 0, player2: 0 };
    }
  };

  const resetScore = () => {
    const resetMatch = {
      ...currentMatch,
      currentScore: { player1: 0, player2: 0 },
      sets: currentMatch.sets.map((set, index) => 
        index === currentMatch.currentSet - 1 
          ? { player1: 0, player2: 0, completed: false }
          : set
      )
    };
    setCurrentMatch(resetMatch);
  };

  const saveMatch = () => {
    onUpdateMatch(currentMatch);
    onClose();
  };

  return (
    <div className="live-scoring-overlay" onClick={onClose}>
      <div className="live-scoring-container" onClick={(e) => e.stopPropagation()}>
        <div className="live-scoring-header">
          <div className="live-scoring-title-section">
            <h2 className="live-scoring-title">Live Scoring</h2>
            <p className="live-scoring-subtitle">Event: {currentMatch.event}</p>
          </div>
          <button className="live-scoring-close-btn" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="live-scoring-content">
          {/* Match Title */}
          <div className="live-scoring-match-title">
            <h3>{currentMatch.player1} vs {currentMatch.player2}</h3>
          </div>

          {/* Current Score Display */}
          <div className="live-scoring-display">
            <div className="live-scoring-player">
              <div className="live-scoring-player-name">{currentMatch.player1}</div>
              <div className="live-scoring-score player1-score">
                {currentMatch.currentScore.player1}
              </div>
              <div className="live-scoring-controls">
                <button 
                  className="live-scoring-btn minus-btn"
                  onClick={() => updateScore('player1', false)}
                >
                  -
                </button>
                <button 
                  className="live-scoring-btn plus-btn player1-plus"
                  onClick={() => updateScore('player1', true)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="live-scoring-player">
              <div className="live-scoring-player-name">{currentMatch.player2}</div>
              <div className="live-scoring-score player2-score">
                {currentMatch.currentScore.player2}
              </div>
              <div className="live-scoring-controls">
                <button 
                  className="live-scoring-btn minus-btn"
                  onClick={() => updateScore('player2', false)}
                >
                  -
                </button>
                <button 
                  className="live-scoring-btn plus-btn player2-plus"
                  onClick={() => updateScore('player2', true)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Sets Display */}
          <div className="live-scoring-sets">
            <h4 className="live-scoring-sets-title">Sets</h4>
            {currentMatch.sets.map((set, index) => (
              <div key={index} className="live-scoring-set">
                <span className="live-scoring-set-label">Set {index + 1}</span>
                <span className="live-scoring-set-score">
                  {set.player1} - {set.player2}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="live-scoring-actions">
            <button 
              className="live-scoring-action-btn reset-btn"
              onClick={resetScore}
            >
              <IoRefreshOutline />
              Reset Score
            </button>
            <button 
              className="live-scoring-action-btn save-btn"
              onClick={saveMatch}
            >
              <IoSaveOutline />
              Save Match
            </button>
          </div>

          {isMatchComplete && (
            <div className="live-scoring-match-complete">
              <h3>Match Complete!</h3>
              <p>The match has been completed. Please save the results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scores;
