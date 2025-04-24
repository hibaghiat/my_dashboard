"use client";

import React, { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";

const colors = [
  "#5b21b6", // purple
  "#2563eb", // blue
  "#16a34a", // green
  "#dc2626", // red
  "#f59e0b", // amber
  "#0e7490", // cyan
  "#db2777", // pink
  "#7c3aed", // indigo
  "#059669", // emerald
  "#d97706", // orange
  "#6b7280", // gray
  "#be123c", // rose
  "#10b981", // teal
  "#9333ea", // violet
  "#ef4444", // red again (fallback)
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border shadow-sm p-2 rounded text-sm">
        <p className="text-xs text-stone-500 font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex justify-between text-xs">
            <span className="font-medium" style={{ color: entry.stroke }}>
              {entry.name}: 
            </span>
            <span style={{ color: entry.stroke }}>{ entry.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export const ActivityGraph = () => {
  const [chartData, setChartData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState("NAB Classroom 001");

  // Fetch the data whenever the selected room changes
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/occupancy?room=${encodeURIComponent(selectedRoom)}`);
        const json = await res.json();
        
        if (json.data) {
          setChartData(json.data); // Set the fetched data in state
        } else {
          console.error("No data received from API");
        }
        setLoading(false); // Set loading to false after fetching data
      } catch (err) {
        console.error("Error fetching chart data", err);
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchStats();
  }, [selectedRoom]); // Run the effect again when the selectedRoom changes

  if (loading) return <p>Loading...</p>;

  return (
    <div className="col-span-8 overflow-hidden rounded border border-stone-300">
      <div className="p-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 font-medium">
          <FiUser /> Activity
        </h3>

        {/* Dropdown to select the room */}
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="border p-2 rounded ml-auto"
        >
          <option value="NAB Classroom 001">NAB Classroom 001</option>
          <option value="NAB Classroom 002">NAB Classroom 002</option>
          <option value="NAB Classroom 003">NAB Classroom 003</option>
          <option value="NAB Classroom 004">NAB Classroom 004</option>
          <option value="NAB Classroom 005">NAB Classroom 005</option>
          <option value="NAB Classroom 006">NAB Classroom 006</option>
          <option value="NAB Classroom 007">NAB Classroom 007</option>
          <option value="NAB Classroom 101">NAB Classroom 101</option>
          <option value="NAB Classroom 102">NAB Classroom 102</option>
          <option value="NAB Classroom 103">NAB Classroom 103</option>
          <option value="NAB Classroom 104">NAB Classroom 104</option>
          <option value="NAB Lab 201">NAB Lab 201</option>
          <option value="NAB Lab 202">NAB Lab 202</option>
          <option value="NAB Lab 203">NAB Lab 203</option>
          <option value="NAB Lab 204">NAB Lab 204</option>
        </select>
      </div>

      <div className="h-64 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={400}
            data={chartData}
            margin={{
              top: -5,
              right: 0,
              left: -30,
              bottom: -5,
            }}
          >
            <CartesianGrid stroke="#e4e4e7" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-xs font-bold"
              padding={{ right: 3 }}
            />
            <YAxis
              className="text-xs font-bold"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 9999 }} />
            {[ "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm"].map((hour, index) => (
              <Line
                key={hour}
                type="monotone"
                dataKey={hour}
                stroke={colors[index % colors.length]} // wrap around if more than 15
                strokeWidth={1.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
