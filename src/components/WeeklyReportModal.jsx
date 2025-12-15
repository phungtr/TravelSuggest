import React from 'react';
import ReactMarkdown from 'react-markdown';
import DynamicChart from './DynamicChart';
import { FaTimes, FaChartLine } from 'react-icons/fa';
import './WeeklyReportModal.css';

const WeeklyReportModal = ({ isOpen, onClose, insight }) => {
  if (!isOpen || !insight) {
    return null;
  }

  return (
    <div className="report-modal-overlay">
      <div className="report-modal-container">
        <header className="report-modal-header">
          <div className="report-modal-header-icon">
            <FaChartLine />
          </div>
          <h2 className="report-modal-title">{insight.title}</h2>
          <button className="report-modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </header>

        <main className="report-modal-content">
          <div className="report-modal-summary">
            <ReactMarkdown children={insight.summary} />
          </div>
          <div className="report-modal-chart">
            {insight.details && (
              <DynamicChart chartConfig={insight.details} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WeeklyReportModal;