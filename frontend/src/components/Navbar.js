import React from 'react';

export default function Navbar({ activeTab, setActiveTab, onNewTask }) {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <div className="navbar__brand">
          <div className="navbar__brand-icon">☑</div>
          <span className="navbar__brand-text">TO-DO-TRACKER</span>
        </div>

        {/* Tab Navigation */}
        <div className="navbar__tabs">
          <button
            className={`navbar__tab ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            📊 Habit Tracker
          </button>
          <button
            className={`navbar__tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            📋 Task Board
          </button>
        </div>

        {/* Action */}
        <div className="navbar__actions">
          {activeTab === 'tasks' && (
            <button className="btn btn-primary" onClick={onNewTask}>
              + New Task
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
