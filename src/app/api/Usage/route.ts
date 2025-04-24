import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

interface Log {
  timestamp: { $date: string };
  data: Record<string, { occupancy: number }>;
  sourceFile: string;
  sourceFolder: string;
}

function transformToHourlyZeroOccupancy(logs: Log[], roomName: string) {
  const timeLabels = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8;
    const suffix = hour >= 12 ? "pm" : "am";
    const label = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}${suffix}`;
    return label;
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dataMap: Record<string, any> = {};

  timeLabels.forEach((label) => {
    dataMap[label] = { name: label };
    days.forEach((day) => {
      dataMap[label][day] = 0;
    });
  });

  logs.forEach((log) => {
    const date = new Date(log.timestamp.$date);
    const hour = date.getHours();
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    if (!days.includes(weekday)) return;

    const label = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}${hour >= 12 ? "pm" : "am"}`;
    const occupancy = log.data?.[roomName]?.occupancy ?? 0;
    if (occupancy === 0 && dataMap[label]) {
      dataMap[label][weekday] = 1;
    }
  });

  return Object.values(dataMap);
}

export async function GET(req: NextRequest) {
  try {
    const roomName = req.nextUrl.searchParams.get("room");
    if (!roomName) {
      return NextResponse.json({ error: "Missing room parameter" }, { status: 400 });
    }

    const client = new MongoClient("mongodb://127.0.0.1:27017");
    await client.connect();
    const db = client.db("occupancyDB");

    const logs = await db
      .collection("occupancy_logs")
      .find({})
      .sort({ timestamp: 1 })
      .toArray();

    const typedLogs: Log[] = logs as unknown as Log[];
    const chartData = transformToHourlyZeroOccupancy(typedLogs, roomName);

    return NextResponse.json({ data: chartData });
  } catch (err) {
    console.error("Failed to fetch zero occupancy data:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
