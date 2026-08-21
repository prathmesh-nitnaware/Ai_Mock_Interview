import React from 'react';
import { Calendar, Flame } from 'lucide-react';

export const ActivityStreak = ({ metrics }) => {
  const { weeklyActivity, streakDays, totalInterviews } = metrics;

  return (
    <div className="dash-panel-card">
      <div className="dash-panel-header">
        <div className="dash-panel-title-wrap">
          <Calendar size={18} className="dash-panel-icon" />
          <h3 className="dash-panel-title">Preparation Activity</h3>
        </div>
        <span className="activity-streak-tag">
          <Flame size={14} className="activity-flame-icon" />
          <span>{streakDays} Day{streakDays !== 1 ? 's' : ''} Active</span>
        </span>
      </div>

      <div className="weekly-activity-strip">
        {weeklyActivity.map((dayItem) => (
          <div
            key={dayItem.day}
            className={`activity-day-col ${dayItem.isToday ? 'is-today' : ''}`}
          >
            <span className="activity-day-name">{dayItem.day}</span>
            <div
              className={`activity-day-dot ${
                dayItem.active ? 'dot-active' : 'dot-empty'
              }`}
              title={`${dayItem.day}: ${dayItem.count} interview${dayItem.count !== 1 ? 's' : ''}`}
            >
              {dayItem.active ? dayItem.count : ''}
            </div>
          </div>
        ))}
      </div>

      <div className="activity-footer-meta">
        <span className="activity-note">
          {totalInterviews > 0
            ? 'Practice at least 3 days a week to build interview muscle memory.'
            : 'Start an interview session today to light up your activity track.'}
        </span>
      </div>
    </div>
  );
};

export default ActivityStreak;
