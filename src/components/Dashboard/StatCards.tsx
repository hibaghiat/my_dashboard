"use client";
import React, { useEffect, useState } from "react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";

export const StatCards = () => {
  const [stats, setStats] = useState<{
    accessDevices: number;
    occupancy: number;
    energySaved: number;
    trend: { energy: "up" | "down" };
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    };
    fetchStats();
  }, []); 

  if (!stats) return <p>Loading...</p>;

  return (
    <>
      <Card
        title="Access Devices"
        value={stats.accessDevices.toString()}
        pillText="Building 08C (NAB)"
        trend="up"
        // period="From Jan 1st - Jul 31st"
      />
      <Card
        title="Occupancy"
        value={stats.occupancy.toString()}
        pillText=""
        trend="down"
        // period="From Jan 1st - Jul 31st"
      />
      <Card
        title="Energy Saved this week"
        value={`${stats.energySaved} KWh`}
        pillText="+18.5% vs last week"
        trend={stats.trend.energy}
        // period="Previous 365 days"
      />
    </>
  );
};

const Card = ({
  title,
  value,
  pillText,
  trend,
  // period,
}: {
  title: string;
  value: string;
  pillText: string;
  trend: "up" | "down";
  // period: string;
}) => {
  return (
    <div className="col-span-4 p-4 rounded border border-stone-300">
      <div className="flex mb-8 items-start justify-between">
        <div>
          <h3 className="text-stone-500 mb-2 text-sm">{title}</h3>
          <p className="text-3xl font-semibold">{value}</p>
        </div>

        <span
          className={`text-xs flex items-center gap-1 font-medium px-2 py-1 rounded ${
            trend === "up"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {trend === "up" ? <FiTrendingUp /> : <FiTrendingDown />} {pillText}
        </span>
      </div>

      {/* <p className="text-xs text-stone-500">{period}</p> */}
    </div>
  );
};
