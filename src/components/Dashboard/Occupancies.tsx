"use client";
import React, { useEffect, useState } from "react";
import { FiUser, FiMoreHorizontal } from "react-icons/fi";

const date = new Date().toLocaleDateString('en-US', { 
  month: 'short',   
  day: 'numeric' 
});

interface StatCardsProps {
  showAll: boolean;
}

export const OccupancyTable = ({ showAll }: StatCardsProps) => {
  const [rooms, setRooms] = useState<
    { building: string; room: string; ap: string; occupancy: number; status: string; count: number; frequency: string}[] | null
  >(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setRooms(data.rooms);
    };
    fetchStats();
  }, []);
  

  if (!rooms) return <p>Loading...</p>;

  const visibleRooms = showAll ? rooms : rooms.slice(0, 6);

  return (
    <>
      {visibleRooms.map((roomData, index) => (
        <TableRow
          key={roomData.room}
          Building={roomData.building}
          Room={roomData.room}
          AP={roomData.ap}
          // date={date}
          Occupancy={roomData.occupancy.toString()}
          Status={roomData.status}
          Count={roomData.count.toString()}
          Frequency={roomData.frequency}
          order={index + 1}
        />
      ))}
    </>
  );
};


export const Occupancies = () => {
  const [showAll, setShowAll] = useState(false);

  const handleToggle = () => {
    setShowAll((prev) => !prev);
  };

  return (
    <div className="col-span-12 p-4 rounded border border-stone-300">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-medium">
          <FiUser /> Occupancies
        </h3>
        <button className="text-sm text-violet-500 hover:underline"
          onClick={handleToggle}
        >
          {showAll ? "Show less" : "See all"}
        </button>
      </div>
      <table className="w-full table-auto">
        <TableHead />
        <tbody>
          <OccupancyTable showAll={showAll} />
        </tbody>
      </table>
    </div>
  );
};


const TableHead = () => {
  return (
    <thead>
      <tr className="text-sm font-normal text-stone-500">
        <th className="text-left p-2 w-[10%]">Building</th>
        <th className="text-left p-2 w-[15%]">Room</th>
        <th className="text-left p-2 w-[20%]">Access Point</th>
        <th className="text-left p-2 w-[10%]">Occupancy</th>
        <th className="text-left p-2 w-[10%]">Status</th>
        <th className="text-left p-2 w-[10%]">Count</th>
        <th className="text-left p-2 w-[15%]">Frequency</th>
        <th className="w-8"></th>
      </tr>
    </thead>
  );
};

const TableRow = ({
  Building,
  Room,
  AP,
  Occupancy,
  Status,
  Count,
  Frequency,
  order,
}: {
  Building: string;
  Room: string;
  AP: string;
  Occupancy: string;
  Status: string;
  Count: string;
  Frequency: string;
  order: number;
}) => {
  return (
    <tr className={order % 2 ? "bg-stone-100 text-sm" : "text-sm"}>
      <td className="p-2 w-[10%]">{Building}</td>
      <td className="p-1.5 whitespace-nowrap text-violet-600 flex items-center gap-1">{Room}</td>
      <td className="p-2 w-[20%]">{AP}</td>
      <td className="p-2 w-[10%]">{Occupancy}</td>
      <td className="p-2 w-[10%]">{Status}</td>
      <td className="p-2 w-[10%]">{Count}</td>
      <td className="p-2 w-[15%]">{Frequency}</td>
      <td className="w-8">
        <button className="hover:bg-stone-200 transition-colors grid place-content-center rounded text-sm size-8">
          <FiMoreHorizontal />
        </button>
      </td>
    </tr>
  );
};

