import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

interface Log {
  timestamp: { $date: string };
  data: Record<string, { occupancy: number }>;
  sourceFile: string;
  sourceFolder: string;
}

const hours = [
  "8am", "9am", "10am", "11am", "12pm",
  "1pm", "2pm", "3pm", "4pm", "5pm",
  "6pm", "7pm", "8pm", "9pm", "10pm",
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Helper to parse date from sourceFile like "occupancy_14-04-2025--08-00-12.json"
function parseSourceFileDate(fileName: string): Date {
  const match = fileName.match(/occupancy_(\d{2})-(\d{2})-(\d{4})--(\d{2})-(\d{2})/);
  if (!match) return new Date(0); // fallback to epoch if parsing fails

  const [_, day, month, year, hour, minute] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );
}

// Transform logs into chart data grouped by day and hour
function transformLogsToChartData(logs: Log[], roomName: string) {
  const data: Record<string, any>[] = [];

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const dayIndex = Math.floor(i / 15); // 15 hours per day
    const hourIndex = i % 15;

    const dayName = weekdays[dayIndex];
    const hourLabel = hours[hourIndex];

    const occupancy = log?.data?.[roomName]?.occupancy ?? 0;

    if (!data[dayIndex]) {
      data[dayIndex] = { name: dayName };
    }

    data[dayIndex][hourLabel] = occupancy;
  }

  return data;
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

    const logs = (await db
      .collection("occupancy_logs")
      .find({})
      .toArray())
      .sort((a, b) => {
        const dateA = parseSourceFileDate(a.sourceFile);
        const dateB = parseSourceFileDate(b.sourceFile);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 75);

    const typedLogs: Log[] = logs as unknown as Log[];

    const chartData = transformLogsToChartData(typedLogs, roomName);

    return NextResponse.json({ data: chartData });

  } catch (err) {
    console.error("Failed to fetch occupancy data:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
