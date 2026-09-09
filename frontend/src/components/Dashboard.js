import React from 'react';

const statItems = [
  {
    key: 'total',
    label: 'Total Tasks',
    icon: '📋',
    bg: '#ede9fe',
    getValue: (s) => s?.total ?? 0,
  },
  {
    key: 'todo',
    label: 'To Do',
    icon: '🔵',
    bg: '#f1f5f9',
    getValue: (s) => s?.byStatus?.todo ?? 0,
  },
  {
    key: 'inprogress',
    label: 'In Progress',
    icon: '🟡',
    bg: '#e0f2fe',
    getValue: (s) => s?.byStatus?.['in-progress'] ?? 0,
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: '🟢',
    bg: '#dcfce7',
    getValue: (s) => s?.byStatus?.completed ?? 0,
  },
  {
    key: 'high',
    label: 'High Priority',
    icon: '🔴',
    bg: '#fef2f2',
    getValue: (s) => s?.byPriority?.high ?? 0,
  },
  {
    key: 'overdue',
    label: 'Overdue',
    icon: '⚠️',
    bg: '#fff7ed',
    getValue: (s) => s?.overdue ?? 0,
  },
];

function Dashboard({ stats }) {
  const completionRate = stats?.completionRate ?? '0.0';

  return (
    <div className="dashboard">
      <div className="dashboard__grid">
        {statItems.map((item) => (
          <div className="stat-card" key={item.key}>
            <div className="stat-card__icon" style={{ background: item.bg }}>
              {item.icon}
            </div>
            <div className="stat-card__info">
              <div className="stat-card__value">{item.getValue(stats)}</div>
              <div className="stat-card__label">{item.label}</div>
            </div>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#fdf4ff' }}>
            📊
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{completionRate}%</div>
            <div className="stat-card__label">Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
