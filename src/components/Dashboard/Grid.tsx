import React from "react";
import { StatCards } from "./StatCards";
import { ActivityGraph } from "./ActivityGraph";
import { Occupancies } from "./Occupancies";
import { WeeklyEnergyRadar } from "./WeeklyEnergyRadar";

export const Grid = () => {
  return (
    <div className="px-4 grid gap-3 grid-cols-12">
      <StatCards />
      <ActivityGraph />
      <WeeklyEnergyRadar />
      <Occupancies />
    </div>
  );
};
