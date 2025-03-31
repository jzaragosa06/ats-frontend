import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import api from "../../api/axios";

ChartJS.register(ArcElement, Tooltip);

const SourceOfApplication = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/analytic/graphs/source");
        
        if (response.data && response.data.source) {
          setData(response.data.source);
        } else {
          setError("No source data available");
        }
      } catch (error) {
        console.error("Error fetching source data:", error);
        setError("Failed to load source data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-gray-500">Loading source data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-gray-500">No source data available</p>
      </div>
    );
  }

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
                backgroundColor: chartData.datasets[0].backgroundColor[index % chartData.datasets[0].backgroundColor.length],
              }}
            />
            <span className="text-sm text-gray-700">{entry.source}</span>
            <span className="ml-auto text-sm font-medium">{entry.value}%</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default SourceOfApplication;