import React, { useState } from 'react';
import './CSS/Notification.css';
import { IoChevronBack, IoAdd, IoSend, IoEyeOutline, IoCreateOutline, IoTrashOutline, IoMailOutline, IoNotificationsOutline, IoCalendarOutline, IoMegaphoneOutline, IoClose, IoCheckmarkCircle, IoAlertCircle } from 'react-icons/io5';


import { toast } from 'react-toastify';

import { useNavigate } from 'react-router-dom';

import { OrganizerContext } from '../../Contexts/OrganizerContext/OrganizerContext';
import { useContext } from 'react';


import { marked } from 'marked';
import DOMPurify from 'dompurify';





const Notification = () => {

  const { tournament } = useContext(OrganizerContext);
  // const navigate = useNavigate();

  // console.log(tournament);

  const [activeSection, setActiveSection] = useState('main');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [currentNotificationType, setCurrentNotificationType] = useState('');
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    content: ''
  });

  // Mock data for different notification types
  const notificationSections = [
    {
      id: 'tournament-promotion',
      title: 'TOURNAMENT PROMOTION',
      description: 'Send notification to the players about this tournament. This will help to increase the booking.',
      subDescription: 'We pick all the email address of the players participated in your previous tournaments.',
      icon: <IoMegaphoneOutline />,
      color: '#f97316',
      bgColor: '#fff7ed'
    },
    {
      id: 'fixtures',
      title: 'FIXTURES',
      description: 'Send notification to the players once fixtures are generated for each events.',
      subDescription: 'Automated notifications will be sent when match schedules are ready.',
      icon: <IoCalendarOutline />,
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    {
      id: 'generic-notification',
      title: 'GENERIC NOTIFICATION',
      description: 'Send notifications like announcement / postpone / cancellation / instructions.',
      subDescription: 'Custom notifications for important tournament updates and communications.',
      icon: <IoNotificationsOutline />,
      color: '#8b5cf6',
      bgColor: '#f3e8ff'
    }
  ];

  // Mock sent notifications data
  const [sentNotifications] = useState([
    {
      id: 1,
      type: 'Tournament Promotion',
      subject: 'YONEX KARNATAKA STATE OPEN JUNIOR BADMINTON CHAMPIONSHIP',
      recipients: 156,
      sentDate: '2024-07-15',
      status: 'Delivered'
    },
    {
      id: 2,
      type: 'Fixtures',
      subject: 'U11 BS - Match Schedule Released',
      recipients: 32,
      sentDate: '2024-07-14',
      status: 'Delivered'
    },
    {
      id: 3,
      type: 'Generic',
      subject: 'Tournament Venue Change Notice',
      recipients: 89,
      sentDate: '2024-07-13',
      status: 'Delivered'
    }
  ]);

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    setCurrentNotificationType(sectionId);
  };

  const handleBackToMain = () => {
    setActiveSection('main');
  };

  const handleComposeEmail = () => {
    setShowComposeModal(true);
    // Pre-populate email data based on notification type
    if (currentNotificationType === 'tournament-promotion') {
      const rawHtml = marked(tournament?.description || '');
    const safeHtml = DOMPurify.sanitize(rawHtml);

    // Create a complete HTML wrapper div
    const div = `<div>${safeHtml}</div>`;
    
      setEmailData(prev => ({
        ...prev,
        subject: `${tournament.name} - Tournament Promotion`,
        content: div,
      }));

    } else if (currentNotificationType === 'fixtures') {
      setEmailData(prev => ({
        ...prev,
        subject: 'Match Fixtures Released - Tournament Name',
        content: getDefaultContent('fixtures')
      }));
    }
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case 'tournament-promotion':
        return `YONEX KARNATAKA STATE OPEN JUNIOR BADMINTON CHAMPIONSHIP

Start Date: Sunday, 20th Apr 2025 9:00 am
End Date: Sunday, 20th Apr 2025 4:30 pm

Address: Nagarbhavi Sports Arena, Kuvempu Road, Sir M Visvesvaraya nagara 6th block, Annapurneshwari Nagar, Bengaluru, Karnataka, India

Details:
KARNATAKA STATE OPEN JUNIOR BADMINTON CHAMPIONSHIP

Timings:
BOYS AND GIRLS Singles
U9 - 9:00 am
U11 - 9:30 am
U13 - 10:15 am`;
      case 'fixtures':
        return `U9 BS
https://playmatches.com/bengaluru/tournaments/detail/yonex-karnataka-state-open-junior-badminton-championship/20a4f543-5503-4d4c-b26f-beb04233af5d/fixture/5a07a04-fba9-4f5d-9893-3aef1251dcad

U9 GS
https://playmatches.com/bengaluru/tournaments/detail/yonex-karnataka-state-open-junior-badminton-championship/20a4f543-5503-4d4c-b26f-beb04233af5d/fixture/a942e0a0-56ef-4405-5ee1-e16832fd3046

U11 BS
https://playmatches.com/bengaluru/tournaments/detail/yonex-karnataka-state-open-junior-badminton-championship/20a4f543-5503-4d4c-b26f-beb04233af5d/fixture/64c8cce-db7-4b4b-b484-c7bcd900f7d5`;
      default:
        return '';
    }
  };

  const handleCloseModal = () => {
    setShowComposeModal(false);
    setEmailData({
      to: '',
      subject: '',
      content: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    console.log('Sending email:', emailData);
    // Here you would integrate with your email service
    handleCloseModal();
  };

  const getSectionTitle = () => {
    const section = notificationSections.find(s => s.id === activeSection);
    return section ? section.title : '';
  };

  const renderMainView = () => (
    <div className="notification-main-view">
      <div className="notification-header">
        <div className="notification-title-section">
          <h2 className="notification-main-title">Notification Center</h2>
          <p className="notification-subtitle">Manage tournament communications and notifications</p>
        </div>
      </div>

      <div className="notification-sections-grid">
        {notificationSections.map((section) => (
          <div
            key={section.id}
            className="notification-section-card"
            onClick={() => handleSectionClick(section.id)}
            style={{ backgroundColor: section.bgColor }}
          >
            <div className="notification-section-content">
              <div className="notification-section-icon" style={{ color: section.color }}>
                {section.icon}
              </div>
              <div className="notification-section-text">
                <h3 className="notification-section-title">{section.title}</h3>
                <p className="notification-section-description">{section.description}</p>
                <p className="notification-section-sub-description">{section.subDescription}</p>
              </div>
              <div className="notification-section-arrow">
                <IoChevronBack style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Notifications */}
      {/* <div className="notification-recent-section">
        <h3 className="notification-recent-title">Recent Notifications</h3>
        <div className="notification-recent-list">
          {sentNotifications.map((notification) => (
            <div key={notification.id} className="notification-recent-item">
              <div className="notification-recent-content">
                <div className="notification-recent-info">
                  <span className="notification-recent-type">{notification.type}</span>
                  <h4 className="notification-recent-subject">{notification.subject}</h4>
                  <p className="notification-recent-meta">
                    {notification.recipients} recipients • {notification.sentDate}
                  </p>
                </div>
                <div className="notification-recent-status">
                  <span className="notification-status-badge notification-status-delivered">
                    <IoCheckmarkCircle />
                    {notification.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );

  const renderSectionView = () => (
    <div className="notification-section-view">
      <div className="notification-section-header">
        <button className="notification-back-btn" onClick={handleBackToMain}>
          <IoChevronBack />
          Back to Notifications
        </button>
        <h2 className="notification-section-view-title">{getSectionTitle()}</h2>
        
      </div>

      <div className="notification-section-content-area">
        {/* <div className="notification-section-info">
          <div className="notification-info-card">
            <h3>Email Recipients</h3>
            <p>All registered participants for this tournament will receive the notification.</p>
            <div className="notification-recipient-stats">
              <div className="notification-stat-item">
                <span className="notification-stat-number">156</span>
                <span className="notification-stat-label">Total Recipients</span>
              </div>
              <div className="notification-stat-item">
                <span className="notification-stat-number">142</span>
                <span className="notification-stat-label">Valid Emails</span>
              </div>
            </div>
          </div>
        </div> */}
        <button className="notification-compose-btn" onClick={handleComposeEmail}>
          <IoAdd />
          Compose Email
        </button>

        {/* <div className="notification-history">
          <h3>Notification History</h3>
          <div className="notification-history-list">
            {sentNotifications
              .filter(notif => notif.type.toLowerCase().includes(currentNotificationType.split('-')[0]))
              .map((notification) => (
                <div key={notification.id} className="notification-history-item">
                  <div className="notification-history-content">
                    <h4>{notification.subject}</h4>
                    <p>{notification.recipients} recipients • {notification.sentDate}</p>
                  </div>
                  <div className="notification-history-actions">
                    <button className="notification-action-btn notification-view-btn">
                      <IoEyeOutline />
                    </button>
                    <button className="notification-action-btn notification-edit-btn">
                      <IoCreateOutline />
                    </button>
                    <button className="notification-action-btn notification-delete-btn">
                      <IoTrashOutline />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div> */}
      </div>
    </div>
  );

  return (
    <div className="notification-container">
      {activeSection === 'main' ? renderMainView() : renderSectionView()}

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="notification-modal-overlay" onClick={handleCloseModal}>
          <div className="notification-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="notification-modal-header">
              <div className="notification-modal-title-section">
                <h2 className="notification-modal-title">NEW EMAIL</h2>
                <p className="notification-modal-subtitle">{getSectionTitle()}</p>
              </div>
              <button className="notification-modal-close-btn" onClick={handleCloseModal}>
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="notification-modal-form">
              <div className="notification-email-fields">
                <div className="notification-field-group">
                  <label className="notification-field-label">To</label>
                  <input
                    type="text"
                    name="to"
                    value={emailData.to}
                    onChange={handleInputChange}
                    className="notification-field-input"
                    placeholder="Enter Emails (comma separated)"
                    readOnly
                  />
                </div>

                {/* <div className="notification-field-group">
                  <label className="notification-field-label">Cc</label>
                  <input
                    type="text"
                    name="cc"
                    value={emailData.cc}
                    onChange={handleInputChange}
                    className="notification-field-input"
                    placeholder="Add CC recipients"
                  />
                </div>

                <div className="notification-field-group">
                  <label className="notification-field-label">Bcc</label>
                  <input
                    type="text"
                    name="bcc"
                    value={emailData.bcc}
                    onChange={handleInputChange}
                    className="notification-field-input"
                    placeholder="Add BCC recipients"
                  />
                </div> */}

                <div className="notification-field-group">
                  <label className="notification-field-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={emailData.subject}
                    onChange={handleInputChange}
                    className="notification-field-input"
                    placeholder="Enter email subject"
                    required
                  />
                </div>

                <div className="notification-field-group">
                  <label className="notification-field-label">Content</label>
                  {/* <div className="notification-editor-toolbar">
                    <button type="button" className="notification-toolbar-btn">B</button>
                    <button type="button" className="notification-toolbar-btn">I</button>
                    <button type="button" className="notification-toolbar-btn">U</button>
                    <button type="button" className="notification-toolbar-btn">≡</button>
                    <button type="button" className="notification-toolbar-btn">🔗</button>
                  </div> */}
                  <textarea
                    name="content"
                    value={emailData.content}
                    onChange={handleInputChange}
                    className="notification-field-textarea"
                    placeholder="Enter email content"
                    rows="12"
                    required
                  />
                </div>
              </div>

              <div className="notification-modal-actions">
                <button type="button" className="notification-modal-btn notification-preview-btn">
                  Preview
                </button>
                <button type="submit" className="notification-modal-btn notification-send-btn">
                  <IoSend />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
