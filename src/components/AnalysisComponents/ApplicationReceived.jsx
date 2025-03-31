import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaInfoCircle } from "react-icons/fa";

const ApplicationReceived = ({ isExpanded }) => {
  const [totalApplications, setTotalApplications] = useState(0);
  const [months, setMonths] = useState([]);
  const [allMonths, setAllMonths] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await api.get("/analytic/metrics");
        const data = response.data.applicationsReceived;

        setTotalApplications(data.total);
        
        // Set regular breakdown data (formatted with month names)
        setMonths(data.breakdown.map((item) => {
          // Convert YYYY-MM format to month name
          const [year, month] = item.month.split('-');
          const date = new Date(year, month - 1);
          const monthName = date.toLocaleString('default', { month: 'long' });
          
          return { 
            name: monthName, 
            count: item.count 
          };
        }));
        
        // Set all months data for expanded view
        setAllMonths(data.allCountPerMonth.map((item) => {
          // Convert month number to month name
          const monthNum = parseInt(item.month) - 1; // JS months are 0-indexed
          const date = new Date();
          date.setMonth(monthNum);
          const monthName = date.toLocaleString('default', { month: 'long' });
          
          return { 
            name: monthName, 
            count: item.count 
          };
        }));
      } catch (error) {
        console.error("Error fetching application metrics:", error);
      }
    };

    fetchApplicationData();
  }, []);

  // Determine which data to display based on expansion state
  const displayData = isExpanded ? allMonths : months;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="">Applications Received</h3>
        <div className="relative flex-col flex items-end gap-1">
          <FaInfoCircle
            className="cursor-pointer"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <span className="absolute mt-5 w-48 p-2 body-tiny text-teal bg-teal-soft rounded shadow-lg text-justify z-10">
              This card shows the number of applications received{isExpanded ? " across all months" : ""}.
            </span>
          )}
        </div>
      </div>

      <p className="mb-6 text-center text-4xl font-semibold">
        {totalApplications}
      </p>

      {isExpanded ? (
        <div>
          <p className="mb-4 text-sm text-gray-600">Complete monthly breakdown:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayData.sort((a, b) => {
              // Sort months in calendar order
              const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              return months.indexOf(a.name) - months.indexOf(b.name);
            }).map((month, index) => (
              <div key={index} className="flex justify-between border-b pb-2">
                <span className="font-medium">{month.name}</span>
                <span className="font-medium">{month.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {displayData.map((month, index) => (
            <div key={index} className="flex justify-between">
              <span className="font-medium">{month.name}</span>
              <span className="font-medium">{month.count}</span>
            </div>
          ))}
          
          {displayData.length > 0 && (
            <div className="text-xs text-gray-500 text-center mt-4">
              Showing last {displayData.length} months. Expand for full data.
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ApplicationReceived;