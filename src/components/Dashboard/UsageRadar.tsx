// "use client";

// import React, { useEffect, useState } from "react";
// import { FiEye } from "react-icons/fi";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend,
// } from "recharts";

// type HourlyData = {
//   hour: string; // Hour label (e.g., "8am", "9am", etc.)
//   monday: number; // Monday occupancy (0 or 1)
//   tuesday: number; // Tuesday occupancy (0 or 1)
//   wednesday: number; // Wednesday occupancy (0 or 1)
//   thursday: number; // Thursday occupancy (0 or 1)
//   friday: number; // Friday occupancy (0 or 1)
// };

// type DayData = {
//   name: string; // Day of the week (e.g., "Monday")
//   hours: { [hour: string]: number }; // Map of hour to occupancy (0 or 1)
// };

// export const UsageRadar = () => {
//   const [chartData, setChartData] = useState<HourlyData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedRoom, setSelectedRoom] = useState("NAB Classroom 001");

//   useEffect(() => {
//     const fetchStats = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/Usage?room=${encodeURIComponent(selectedRoom)}`);
//         const json = await res.json();

//         if (json.data) {
//           setChartData(json.data);
//         } else {
//           console.error("No data received from API");
//         }
//       } catch (err) {
//         console.error("Error fetching chart data", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, [selectedRoom]);

//   const hours = [
//     "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm"
//   ];

//   const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

//   // Transform chart data into hourly slots for each day (ensure each hour is unique per day)
//   const areaChartData: HourlyData[] = hours.map((hour) => {
//     const dayData = {
//       hour,
//       monday: chartData.find((data) => data.name === "Monday")?.hours[hour] || 0,
//       tuesday: chartData.find((data) => data.name === "Tuesday")?.hours[hour] || 0,
//       wednesday: chartData.find((data) => data.name === "Wednesday")?.hours[hour] || 0,
//       thursday: chartData.find((data) => data.name === "Thursday")?.hours[hour] || 0,
//       friday: chartData.find((data) => data.name === "Friday")?.hours[hour] || 0,
//     };
//     return dayData;
//   });

//   return (
//     <div className="col-span-4 overflow-hidden rounded border border-stone-300">
//       <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
//         <h3 className="flex items-center gap-1.5 font-medium">
//           <FiEye /> Inactivity Hours (0 Occupancy)
//         </h3>
//         <select
//           value={selectedRoom}
//           onChange={(e) => setSelectedRoom(e.target.value)}
//           className="border p-2 rounded"
//         >
//           {[
//             "NAB Classroom 001", "NAB Classroom 002", "NAB Classroom 003",
//             "NAB Classroom 004", "NAB Classroom 005", "NAB Classroom 006",
//             "NAB Classroom 007", "NAB Classroom 101", "NAB Classroom 102",
//             "NAB Classroom 103", "NAB Classroom 104", "NAB Lab 201",
//             "NAB Lab 202", "NAB Lab 203", "NAB Lab 204",
//           ].map((room) => (
//             <option key={room} value={room}>
//               {room}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="h-64 px-4">
//         {loading ? (
//           <div className="flex justify-center items-center h-full text-sm text-stone-500">Loading...</div>
//         ) : (
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={areaChartData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="hour" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Area
//                 type="monotone"
//                 dataKey="monday"
//                 name="Monday"
//                 stackId="1"
//                 stroke="#8884d8"
//                 fill="#8884d8"
//                 fillOpacity={0.3}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="tuesday"
//                 name="Tuesday"
//                 stackId="1"
//                 stroke="#82ca9d"
//                 fill="#82ca9d"
//                 fillOpacity={0.3}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="wednesday"
//                 name="Wednesday"
//                 stackId="1"
//                 stroke="#ffc658"
//                 fill="#ffc658"
//                 fillOpacity={0.3}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="thursday"
//                 name="Thursday"
//                 stackId="1"
//                 stroke="#ff7300"
//                 fill="#ff7300"
//                 fillOpacity={0.3}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="friday"
//                 name="Friday"
//                 stackId="1"
//                 stroke="#387908"
//                 fill="#387908"
//                 fillOpacity={0.3}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </div>
//   );
// };
