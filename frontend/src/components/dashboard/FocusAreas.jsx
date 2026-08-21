import React from 'react';
import { Target, TrendingUp, Lightbulb } from 'lucide-react';

export const FocusAreas = ({ metrics }) => {
  const { focusAreas, totalInterviews } = metrics;

  // Determine strengths vs areas to improve
  const sorted = [...focusAreas].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const needsWork = sorted[sorted.length - 1];

  return (
    <div className="dash-panel-card">
      <div className="dash-panel-header">
        <div className="dash-panel-title-wrap">
          <Target size={18} className="dash-panel-icon" />
          <h3 className="dash-panel-title">Focus Areas</h3>
        </div>
        <span className="dash-panel-meta-text">Competency Breakdown</span>
      </div>

      {totalInterviews > 0 && focusAreas.length > 0 ? (
        <div className="focus-areas-content">
          <div className="focus-bars-list">
            {focusAreas.map((area) => {
              let barColor = 'bar-indigo';
              if (area.score >= 80) barColor = 'bar-emerald';
              else if (area.score < 65) barColor = 'bar-amber';

              return (
                <div key={area.name} className="focus-bar-item">
                  <div className="focus-bar-label-row">
                    <span className="focus-bar-name">{area.name}</span>
                    <span className="focus-bar-score">{area.score}%</span>
                  </div>
                  <div className="focus-bar-track">
                    <div
                      className={`focus-bar-fill ${barColor}`}
                      style={{ width: `${Math.min(100, area.score)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {strongest && needsWork && (
            <div className="focus-recommendation-box">
              <Lightbulb size={16} className="focus-rec-icon" />
              <p className="focus-rec-text">
                <strong>Placement Tip:</strong> Strongest in{' '}
                <span className="rec-highlight">{strongest.name}</span> ({strongest.score}%). Focus next on{' '}
                <span className="rec-highlight">{needsWork.name}</span> ({needsWork.score}%) to round out your evaluation.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="focus-empty-state">
          <p className="focus-empty-text">
            No competency evaluations recorded yet. Complete mock interviews to view your strengths and trade-off analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default FocusAreas;
