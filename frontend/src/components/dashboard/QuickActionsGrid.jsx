import React from 'react';
import { Link } from 'react-router-dom';
import { Play, FileSearch, Terminal, User, ArrowUpRight } from 'lucide-react';

export const QuickActionsGrid = () => {
  const actions = [
    {
      title: 'Mock Interview',
      desc: '5-stage adaptive technical simulation',
      path: '/interview/setup',
      icon: <Play size={20} className="action-icon" fill="currentColor" />,
      tag: 'Core Practice',
    },
    {
      title: 'Resume ATS Scanner',
      desc: 'Audit keyword match & formatting',
      path: '/resume/upload',
      icon: <FileSearch size={20} className="action-icon" />,
      tag: 'Preparation',
    },
    {
      title: 'Coding Dojo',
      desc: 'Algorithm & data structures arena',
      path: '/coding/dojo',
      icon: <Terminal size={20} className="action-icon" />,
      tag: 'Problem Solving',
    },
    {
      title: 'Profile & Target Role',
      desc: 'Update experience & claimed skills',
      path: '/profile',
      icon: <User size={20} className="action-icon" />,
      tag: 'Account',
    },
  ];

  return (
    <div className="dash-panel-card quick-actions-panel">
      <div className="dash-panel-header">
        <h3 className="dash-panel-title">Quick Actions</h3>
        <span className="dash-panel-meta-text">Modules</span>
      </div>

      <div className="quick-actions-grid">
        {actions.map((action) => (
          <Link key={action.title} to={action.path} className="quick-action-tile">
            <div className="action-tile-top">
              <div className="action-icon-box">{action.icon}</div>
              <span className="action-tag">{action.tag}</span>
            </div>

            <div className="action-tile-body">
              <h4 className="action-tile-title">{action.title}</h4>
              <p className="action-tile-desc">{action.desc}</p>
            </div>

            <div className="action-tile-footer">
              <span className="action-launch-text">Launch</span>
              <ArrowUpRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;
