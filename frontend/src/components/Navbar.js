import React from 'react';

function Navbar({ onNewTask, activeView, setActiveView }) {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <div className="navbar__brand">
          <div className="navbar__brand-icon">⚡</div>
          <span className="navbar__brand-text">TaskFlow</span>
        </div>

        <div className="navbar__actions">
          {/* View Toggle */}
          <div className="navbar__view-toggle">
            <button
              className={`navbar__view-btn ${activeView === 'board' ? 'active' : ''}`}
              onClick={() => setActiveView('board')}
              title="Board View"
            >
              ▦ Board
            </button>
            <button
              className={`navbar__view-btn ${activeView === 'list' ? 'active' : ''}`}
              onClick={() => setActiveView('list')}
              title="List View"
            >
              ≡ List
            </button>
          </div>

          {/* New Task Button */}
          <button className="btn btn-primary" onClick={onNewTask}>
            + New Task
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
