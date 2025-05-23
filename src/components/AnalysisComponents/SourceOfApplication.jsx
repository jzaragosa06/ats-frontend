import React, { useEffect, useState, useCallback } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import api from "../../services/api";

ChartJS.register(ArcElement, Tooltip);

const SourceOfApplication = ({ year, month }) => { // Receive year and month props
  const [data, setData] = useState([]);
  const [lastFetch, setLastFetch] = useState(0);

  // Memoize the fetch function to maintain its identity between renders
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      // Check if we have valid cached data
      const cacheKey = `sourceData_${year}_${month}`;
      const cachedDataString = sessionStorage.getItem(cacheKey);
      const cachedTimeString = sessionStorage.getItem(`${cacheKey}_timestamp`);

      if (!forceRefresh && cachedDataString && cachedTimeString) {
        const cachedTime = parseInt(cachedTimeString);
        const currentTime = new Date().getTime();
        const cacheAge = currentTime - cachedTime;

        // Cache valid for 5 minutes (300000 ms)
        if (cacheAge < 300000) {
          const parsedData = JSON.parse(cachedDataString);
          setData(parsedData);
          setLastFetch(cachedTime);
          return;
        }
      }

      // If no valid cache or force refresh, fetch from API
      let url = `/analytic/graphs/source`;

      // Add year and month filters
      if (year !== "all") {
        url += (url.includes("?") ? "&" : "?") + `year=${year}`;
      }
      if (month !== "all") {
        url += (url.includes("?") ? "&" : "?") + `month=${month}`;
      }

      const response = await api.get(url);

      // Extract the source data directly from the response
      if (response.data && response.data.source) {
        const sourceData = response.data.source;

        // Store in session storage with timestamp
        sessionStorage.setItem(cacheKey, JSON.stringify(sourceData));
        sessionStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime().toString());

        setData(sourceData);
        setLastFetch(new Date().getTime());
      }
    } catch (error) {
      console.error("Error fetching source data:", error);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = {
    labels: data.map((entry) => entry.source),
    datasets: [
      {
        data: data.map((entry) => entry.value),
        backgroundColor: ["#008080", "#33A3A3", "#66C5C5", "#99E6E6", "#CCF2F2"],
        hoverBackgroundColor: ["#006666", "#2A8888", "#55A8A8", "#77BCBC", "#AACBCB"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (acc, val) => acc + val,
              0,
            );
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ${percentage}% (${value})`;
          },
        },
      },
    },
  };

  return (
    <>
      <h3 className="mb-4 text-center text-sm text-gray-600">
        Source of Application
      </h3>

      <div className="mx-auto w-1/2">
        <Pie data={chartData} options={options} />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: chartData.datasets[0].backgroundColor[index % 5],
              }}
            />
            <span className="text-sm text-gray-700">{entry.source}</span>
            <span className="ml-auto text-sm font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default SourceOfApplication;