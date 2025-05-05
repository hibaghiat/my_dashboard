"use client";
import React, { useEffect, useState } from "react";
import { FiTrendingDown, FiTrendingUp , FiMinus} from "react-icons/fi";
import { MdGroups } from "react-icons/md"; // Material icon for groups
import { LuRouter } from "react-icons/lu"; // Lucide router icon (if you're using lucide-react)

export const StatCards = () => {
  const [stats, setStats] = useState<{
    accessDevices: number;
    occupancy: number;
    energySaved: number;
    trend: { energy: "up" | "down" };
  } | null>(null);

  const getCurrentHourPeriod = () => {
    const now = new Date();
    const hour = now.getHours();
  
    if (hour >= 8 && hour <= 22) {
      return `As of ${hour.toString().padStart(2, "0")}:00`;
    } else {
      return "No active monitoring as of 10pm";
    }
  };
  

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
        period={getCurrentHourPeriod()}
      />
      <Card
        title="Occupancy"
        value={stats.occupancy.toString()}
        pillText="Users"
        trend="up"
        period={getCurrentHourPeriod()}
      />
      <Card
        title="Energy Optimization"
        value={`${stats.energySaved.toFixed(1)} kWh`}
        pillText={
          stats.energySaved > 0
            ? "Saved this week"
            : "No savings yet"
        }
        trend={stats.trend.energy}
        period="Compared to always-on baseline"
      />
    </>
  );
};

const Card = ({
  title,
  value,
  pillText,
  trend,
  period,
}: {
  title: string;
  value: string;
  pillText: string;
  trend?: "up" | "down";
  period: string;
}) => {
  let icon = null;
  let trendColor = "bg-stone-100 text-stone-700";

  if (title.includes("Access Devices") && trend === "up") {
    icon = <LuRouter />;
    trendColor = "bg-green-100 text-green-600";
  } else if (title.includes("Occupancy") && trend === "up") {
    icon = <MdGroups />;
    trendColor = "bg-green-100 text-green-600";
  } else if (title.includes("Energy")) {
    if (trend === "up") {
      icon = <FiTrendingUp />;
      trendColor = "bg-green-100 text-green-600";
    } else if (trend === "down") {
      icon = <FiTrendingDown />;
      trendColor = "bg-red-100 text-red-600";
    } else {
      icon = <FiMinus />;
      trendColor = "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div className="col-span-4 p-4 rounded border border-stone-300">
      <div className="flex mb-8 items-start justify-between">
        <div>
          <h3 className="text-stone-500 mb-2 text-sm">{title}</h3>
          <p className="text-3xl font-semibold">{value}</p>
        </div>

        {pillText && (
          <span
            className={`text-xs flex items-center gap-1 font-medium px-2 py-1 rounded ${trendColor}`}
          >
            {icon} {pillText}
          </span>
        )}
      </div>

      <p className="text-xs text-stone-500">{period}</p>
    </div>
  );
};
