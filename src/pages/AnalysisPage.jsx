import { useState, useEffect } from "react"
import {
  FiUsers,
  FiBriefcase,
  FiRefreshCw,
  FiTrendingDown,
  FiBarChart2,
  FiPieChart,
  FiMaximize2,
  FiMinimize2
} from "react-icons/fi"

import TopJobPositions from "../components/AnalysisComponents/TopJobPositions"
import InternalVsExternalHires from "../components/AnalysisComponents/InternalVsExternalHires"
import CandidateDropOffRate from "../components/AnalysisComponents/CandidateDropOffRate"
import ApplicationReceived from "../components/AnalysisComponents/ApplicationReceived"
import ApplicantStatusChart from "../components/AnalysisComponents/RequisitionAnalysisGraph"
import SourceOfApplication from "../components/AnalysisComponents/SourceOfApplication"

const AnalysisPage = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const jobPositions = [
    { title: "Software Engineer", percentage: 25 },
    { title: "Product Manager", percentage: 20 },
    { title: "Data Analyst", percentage: 15 },
  ];

  const internalHires = 30;
  const externalHires = 70;

  const overallRate = 10;
  const monthlyRates = {
    January: 5,
    February: 10,
    March: 15,
  };

  const totalApplications = 100;
  const months = [
    { name: "January", count: 30 },
    { name: "February", count: 40 },
    { name: "March", count: 30 },
  ];

  const requisitionData = [
    { month: "January", closed: 12, passed: 3, onProgress: 0 },
    { month: "February", closed: 4, passed: 2, onProgress: 0 },
    { month: "March", closed: 3, passed: 1, onProgress: 0 },
    { month: "April", closed: 4, passed: 2, onProgress: 0 },
    { month: "May", closed: 27, passed: 4, onProgress: 0 },
    { month: "June", closed: 14, passed: 2, onProgress: 0 },
    { month: "July", closed: 5, passed: 4, onProgress: 0 },
    { month: "August", closed: 0, passed: 0, onProgress: 11 },
    { month: "September", closed: 0, passed: 2, onProgress: 0 },
    { month: "October", closed: 0, passed: 0, onProgress: 21 },
    { month: "November", closed: 4, passed: 0, onProgress: 4 },
    { month: "December", closed: 0, passed: 0, onProgress: 1 },
  ];

  const sourceData = [
    { name: "Referral", value: 50 },
    { name: "Website", value: 30 },
    { name: "Caravan", value: 20 },
  ];

  // Function to handle card expansion
  const toggleCardExpand = (id) => {
    const newExpandedState = expandedCard === id ? null : id;
    setExpandedCard(newExpandedState);

    // Toggle body scroll lock when card is expanded
    document.body.style.overflow = newExpandedState ? 'hidden' : 'auto';
  };

  // Card component with expansion functionality
  const Card = ({ id, title, icon, children }) => {
    const isExpanded = expandedCard === id;
    const isAnyCardExpanded = expandedCard !== null;
    const shouldHide = isAnyCardExpanded && !isExpanded;

    return (
      <div
        className={`
        rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300
        ${isExpanded ?
            'fixed top-[10%] left-[10%] right-[10%] bottom-[10%] max-w-5xl mx-auto z-50' :
            'h-auto min-h-[12rem] xs:min-h-[13rem] sm:min-h-[15rem]'}
        ${shouldHide ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
        style={{
          boxShadow: isExpanded ?
            '0 10px 25px rgba(0, 0, 0, 0.1)' :
            '0 4px 12px rgba(0, 0, 0, 0.03)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          transform: shouldHide ? 'scale(0.95)' : 'scale(1)'
        }}
      >
        <div className="flex items-center justify-between p-2 xs:p-3 sm:p-4 border-b border-opacity-10 border-gray-200">
          <div className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm sm:text-base font-medium text-gray-700">
            <span className="text-primary">{icon}</span>
            {title}
          </div>
          <button
            onClick={() => toggleCardExpand(id)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ?
              <FiMinimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> :
              <FiMaximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            }
          </button>
        </div>
        <div
          className={`p-2 xs:p-3 sm:p-4 ${isExpanded ? 'h-[calc(100%-60px)] overflow-y-auto' :
            'h-[calc(100%-40px)] xs:h-[calc(100%-44px)] sm:h-[calc(100%-56px)] custom-scrollbar'
            }`}
          style={{ overflowY: 'auto' }}
        >
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 xs:space-y-6 sm:space-y-8 p-2 xs:p-4 sm:p-6 min-h-screen">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
          transition: background 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
        }
      `}</style>

      {/* Overlay for expanded card */}
      {expandedCard && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center min-h-screen"
          onClick={() => {
            setExpandedCard(null);
            document.body.style.overflow = 'auto';
          }}
        />
      )}

      {/* Top row with 4 equal cards */}
      <div className={`grid grid-cols-1 gap-3 xs:gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 ${expandedCard ? 'z-0' : ''}`}>
        <Card id="applications" title="Applications Received" icon={<FiUsers className="h-4 w-4 sm:h-5 sm:w-5" />}>
          <ApplicationReceived isExpanded={expandedCard === "applications"} />
        </Card>

        <Card id="positions" title="Top Job Positions" icon={<FiBriefcase className="h-4 w-4 sm:h-5 sm:w-5" />}>
          <TopJobPositions jobPositions={jobPositions} />
        </Card>

        <Card id="hires" title="Internal vs External Hires" icon={<FiRefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />}>
          <InternalVsExternalHires internalHires={internalHires} externalHires={externalHires} />
        </Card>

        <Card id="dropoff" title="Candidate Drop-off Rate" icon={<FiTrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />}>
          <CandidateDropOffRate overallRate={overallRate} monthlyRates={monthlyRates} />
        </Card>
      </div>

      {/* Bottom row with 2 cards */}
      <div className={`grid grid-cols-1 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:grid-cols-3 ${expandedCard ? 'z-0' : ''}`}>
        <div className="lg:col-span-2">
          <Card
            id="requisition"
            title="Requisition Analysis"
            icon={<FiBarChart2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          >
            <ApplicantStatusChart data={requisitionData} />
          </Card>
        </div>
        <div>
          <Card
            id="source"
            title="Source of Applications"
            icon={<FiPieChart className="h-4 w-4 sm:h-5 sm:w-5" />}
          >
            <SourceOfApplication data={sourceData} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;