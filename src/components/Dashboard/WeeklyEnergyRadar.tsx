"use client";

import React, { useEffect, useState } from "react";
import { FaBolt } from "react-icons/fa";
import {
  Radar,
  RadarChart,
  PolarGrid,
  Legend,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface EnergyData {
  day: string;
  consumed: number; // estimated energy without automation (e.g., all devices always on)
  saved: number;   // actual logged energy usage from Shelly plug
}

export const WeeklyEnergyRadar = () => {
  const [data, setData] = useState<EnergyData[]>([]);

  useEffect(() => {
    const fetchEnergy = async () => {
      try {
        const res = await fetch("/api/weekly-energy");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch weekly energy data", err);
      }
    };

    fetchEnergy();
  }, []);

  return (
    <div className="col-span-4 overflow-hidden rounded border border-stone-300">
      <div className="p-4">
      <h3 className="flex items-center gap-1.5 font-medium">
        <FaBolt /> Energy: Consumed vs. Saved (kWh)
      </h3>   
      </div>

      <div className="h-64 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis className="text-xs font-bold" dataKey="day" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar
                name="Energy Consumed"
                dataKey="consumed"
                stroke="#18181b"
                fill="#18181b"
                fillOpacity={0.2}
                />
                <Radar
                name="Energy Saved"
                dataKey="saved"
                stroke="#5b21b6" 
                fill="#5b21b6"
                fillOpacity={0.2}
                />
            <Tooltip
              wrapperClassName="text-sm rounded"
              labelClassName="text-xs text-stone-500"
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
