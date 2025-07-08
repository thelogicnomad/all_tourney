import React, { useState } from 'react';
import './CSS/OrganizerDashboard.css';


import { IoPersonCircleOutline, IoEllipsisVertical, IoCheckmarkCircle, IoClose, IoChevronForward, IoAdd, IoBusinessOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';




import { OrganizerContext } from '../../Contexts/OrganizerContext/OrganizerContext';

import { useContext } from 'react';






// SVG Icon Components (existing)
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V22h4v-7.34"/><path d="M12 9.5L14.5 2H9.5L12 9.5z"/><path d="M7 14h10"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

// NEW: Icons for organization tabs
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const SwitchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const BillingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

const OrganizerDashboard = ({ toggleSidebar }) => {
  

  
  
  // NEW: State to manage the active organization tab
  const [activeOrgTab, setActiveOrgTab] = useState('My organization');

  const navigate = useNavigate();


  
  // NEW: Data for the organization tabs
  const orgTabs = [
    { name: 'My organization', icon: <HomeIcon /> },
    { name: 'Members access', icon: <LockIcon /> },
    { name: 'Switch organization', icon: <SwitchIcon /> },
    { name: 'Billings', icon: <BillingsIcon /> },
  ];


  






  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <button className="sidebar-toggle-open" onClick={toggleSidebar}>
          <MenuIcon />
        </button>
        <div className="header-content">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your tournaments.</p>
        </div>
        <button className="create-tournament-btn" onClick={()=>{navigate('/organizer/createTournament')}}>
          <PlusIcon /> Create New Tournament
        </button>
      </header>

      <section className="overview-cards">
        <StatCard title="Total Organizations" value="2" icon={<TrophyIcon />} iconClass="trophy" />
        <StatCard title="Active Tournaments" value="5" icon={<CalendarIcon />} iconClass="calendar" />
        <StatCard title="Total Participants" value="650" icon={<UsersIcon />} iconClass="users" />
        <StatCard title="Completed Events" value="18" icon={<ChartIcon />} iconClass="chart" />
      </section>

      <section className="organizations-section">
        {/* MODIFIED: Header updated with horizontal tabs */}
        <header className="organizations-header">
          <div className="organizations-title-group">
            <nav className="org-tabs">
              <ul>
                {orgTabs.map(tab => (
                  <li key={tab.name}>
                    <button
                      className={activeOrgTab === tab.name ? 'active' : ''}
                      onClick={() => setActiveOrgTab(tab.name)}
                    >
                      {tab.icon}
                      <span>{tab.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
        </header>


        <div className="organizations-list">
          
         {
          activeOrgTab == 'My organization' && <OrganizationHome/>
         }
         {
          activeOrgTab == 'Members access' && <MembersList/>
         }
         {
          activeOrgTab == 'Switch organization' && <SwitchOrganization/>
         }
         {
          activeOrgTab == 'Billings' && <Billings/>
         }

        </div>


      </section>
    </main>
  );
};

const StatCard = ({ title, value, icon, iconClass }) => (
  <div className="stat-card">
    <div className="stat-info">
      <p className="title">{title}</p>
      <p className="value">{value}</p>
    </div>
    <div className={`stat-icon ${iconClass}`}>{icon}</div>
  </div>
);












const OrganizationHome = ()=>{

  
  const { organizerData } = useContext(OrganizerContext);
  
  // console.log(organizerData);
  
  

  const [formData, setFormData] = useState({
    organizationName: 'BIGSHOW SPORTS',
    email: 'organizer@bigsports.com',
    mobile: '8095263150',
    country: 'IN'
  });

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
  // };



    return(
      <>
          
    <div className="organization-form-container">
      <div className="form-header">
        <h2 className="greeting">HELLO, TOURNAMENT ORGANIZER    {organizerData?.fullName} </h2>
        <h1 className="form-title">ORGANIZATION DETAILS</h1>
      </div>
      
      <form className="organization-form">
        <div className="form-group">
          <label htmlFor="organizationName" className="form-label">
            ORGANIZATION NAME <span className="required">*</span>
          </label>
          {/* <input
            type="text"
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter organization name"
          /> */}
          <div className='form-input'>
            {organizerData? organizerData.organizationName : "Mohammed Khalander"}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            EMAIL <span className="required">*</span>
          </label>
          {/* <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter email address"
          /> */}
          <div className='form-input'>
            {organizerData? organizerData.email: "khalandermohmmed734@gmail.com" }
          </div>          
        </div>

        <div className="form-group">
          <label htmlFor="mobile" className="form-label">
            MOBILE <span className="required">*</span>
            <span className="helper-text">(without country code)</span>
          </label>
          {/* <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter mobile number"
          /> */}
          <div className='form-input'>
            {organizerData? organizerData.phone: "7349696566" }
          </div>           
        </div>

        <div className="form-group">
          <label htmlFor="country" className="form-label">
            COUNTRY
          </label>
          {/* <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="IN">India (IN)</option>
            <option value="US">United States (US)</option>
            <option value="UK">United Kingdom (UK)</option>
            <option value="AU">Australia (AU)</option>
            <option value="CA">Canada (CA)</option>
          </select> */}
          <div className='form-input'>
            India (IN)
          </div>           

        </div>

        {/* <div className="form-actions">
          <button type="button" className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Organization Details
          </button>
        </div> */}
      </form>
    </div>
      </>
    )
}


const MembersList = () => {
  const [members, setMembers] = useState([
    {
      id: 1,
      email: 'chiraaag8@gmail.com',
      role: 'Owner',
      status: 'Active',
      isDefault: true
    },
    {
      id: 2,
      email: '1mp22is049@gmail.com',
      role: 'Member',
      status: 'Active',
      isDefault: false
    },
    {
      id: 3,
      email: 'khalandermohammed734@gmail.com',
      role: 'Member',
      status: 'Active',
      isDefault: false
    },
    {
      id: 4,
      email: 'mcjniraj@gmail.com',
      role: 'Member',
      status: 'Active',
      isDefault: false
    },
    {
      id: 5,
      email: 'prabhuaneeshr@gmail.com',
      role: 'Member',
      status: 'Active',
      isDefault: false
    },
    {
      id: 6,
      email: 'bengalurubigshow635@gmail.com',
      role: 'Member',
      status: 'Active',
      isDefault: false
    },
    {
      id: 7,
      email: 'vivikthmukunda@gmail.com',
      role: 'Member',
      status: 'Active',
      isDefault: false
    },
    {
      id: 8,
      email: 'shravanmukunda3@gmail.com',
      role: 'Member',
      status: 'Active',
      isDefault: false
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMember = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewMemberEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newMember = {
        id: members.length + 1,
        email: newMemberEmail.trim(),
        role: 'Member',
        status: 'Active',
        isDefault: false
      };
      
      setMembers(prev => [...prev, newMember]);
      setIsSubmitting(false);
      handleCloseModal();
    }, 1000);
  };

  return (
    <div className="members-list-container">
      <div className="members-header">
        <h2>Organization Members</h2>
        <button className="add-member-btn" onClick={handleAddMember}>
          + Add Member
        </button>
      </div>

      <div className="members-table">
        <div className="table-header">
          <div className="header-cell email-header">Email Address</div>
          <div className="header-cell role-header">Role</div>
          <div className="header-cell status-header">Status</div>
          <div className="header-cell actions-header">Actions</div>
        </div>

        <div className="table-body">
          {members.map((member) => (
            <div key={member.id} className="member-row">
              <div className="member-email">
                <IoPersonCircleOutline className="member-avatar" />
                <span className="email-text">{member.email}</span>
              </div>
              
              <div className="member-role">
                <span className={`role-badge ${member.role.toLowerCase()}`}>
                  {member.role}
                </span>
              </div>
              
              <div className="member-status">
                <span className="status-indicator">
                  <IoCheckmarkCircle className="status-icon active" />
                  {member.status}
                </span>
              </div>
              
              <div className="member-actions">
                {member.isDefault && (
                  <span className="default-badge">Default</span>
                )}
                <button className="action-menu-btn">
                  <IoEllipsisVertical />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Member</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoClose />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="memberEmail" className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="memberEmail"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter member's email address"
                  required
                  autoFocus
                />
                <label htmlFor="memberEmail" className="form-label">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="memberPass"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter member's Password"
                  required
                  autoFocus
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isSubmitting || !newMemberEmail.trim()}
                >
                  {isSubmitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


const SwitchOrganization = () => {

  const navigate = useNavigate();


  const [organizations] = useState([
    {
      id: 1,
      name: 'Badminton Spot',
      role: 'Member',
      isActive: false
    },
    {
      id: 2,
      name: 'BIGSHOW SPORTS',
      role: 'Member',
      isActive: true
    }
  ]);

  const [showSwitcher, setShowSwitcher] = useState(false);

  const handleSwitchOrganization = (orgId) => {
    console.log('Switching to organization:', orgId);
    setShowSwitcher(false);
  };

  const currentOrg = organizations.find(org => org.isActive);

  return (
    <div className="org-switcher-container">
      <button 
        className="org-switcher-trigger"
        onClick={() => setShowSwitcher(!showSwitcher)}
      >
        <div className="org-switcher-current">
          <IoBusinessOutline className="org-switcher-icon" />
          <span className="org-switcher-name">{currentOrg?.name}</span>
        </div>
        <IoChevronForward className={`org-switcher-chevron ${showSwitcher ? 'org-switcher-rotated' : ''}`} />
      </button>

      {showSwitcher && (
        <div className="org-switcher-dropdown">
          <div className="org-switcher-header">
            <h3>Switch Organization</h3>
          </div>
          
          <div className="org-switcher-list">
            {organizations.map((org) => (
              <div 
                key={org.id} 
                className={`org-switcher-item ${org.isActive ? 'org-switcher-active' : ''}`}
                onClick={() => handleSwitchOrganization(org.id)}
              >
                <div className="org-switcher-details">
                  <div className="org-switcher-info">
                    <IoBusinessOutline className="org-switcher-avatar" />
                    <div className="org-switcher-text">
                      <span className="org-switcher-title">{org.name}</span>
                      <span className="org-switcher-role">{org.role}</span>
                    </div>
                  </div>
                  
                  <div className="org-switcher-status">
                    {org.isActive && (
                      <IoCheckmarkCircle className="org-switcher-check" />
                    )}
                    <IoChevronForward className="org-switcher-arrow" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="org-switcher-actions">
            <button className="org-switcher-create" onClick={()=>{navigate('/signup/organizer')}}>
              <IoAdd className="org-switcher-plus" />
              Create New Organization
            </button>
          </div>
        </div>
      )}

      {showSwitcher && (
        <div 
          className="org-switcher-overlay" 
          onClick={() => setShowSwitcher(false)}
        />
      )}
    </div>
  );
};


const Billings = ()=>{
  return (
    <>
    <h1>Billings Will Appear Here</h1>
    <h2> Comming Soon... </h2>
    </>
  )
}




export default OrganizerDashboard;
