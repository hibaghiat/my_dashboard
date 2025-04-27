import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
export const dynamic = "force-dynamic";

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
  const match = RegExp(/occupancy_(\d{2})-(\d{2})-(\d{4})--(\d{2})-(\d{2})/).exec(fileName);
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

function formatHourLabel(hour: number): string {
  const suffix = hour >= 12 ? "pm" : "am";

  let adjusted: number;
  if (hour === 0) {
    adjusted = 12;
  } else if (hour > 12) {
    adjusted = hour - 12;
  } else {
    adjusted = hour;
  }

  return `${adjusted}${suffix}`;
}


function transformLogsToChartData(logs: Log[], roomName: string) {
  const timeSlots: Record<string, any>[] = hours.map((hour) => ({ name: hour }));

  logs.forEach((log) => {
    const date = parseSourceFileDate(log.sourceFile);
    const day = weekdays[date.getDay() - 1]; // skip Sunday
    const hour = formatHourLabel(date.getHours());

    if (!day || !hours.includes(hour)) return;

    const occupancy = log?.data?.[roomName]?.occupancy ?? 0;

    const hourIndex = hours.indexOf(hour);
    if (hourIndex !== -1) {
      timeSlots[hourIndex][day] = occupancy;
    }
  });

  return timeSlots;
}


export async function GET(req: NextRequest) {
  try {
    const roomName = req.nextUrl.searchParams.get("room");
    if (!roomName) {
      return NextResponse.json({ error: "Missing room parameter" }, { status: 400 });
    }

    const mongoUrl = process.env.MONGO_URI;
    if (!mongoUrl) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db("occupancyDB");

    // Fetch logs and sort them by timestamp (ascending)
    const logs = await db
      .collection("occupancy_logs")
      .find({})
      .limit(75)
      .toArray();

    // Sort logs by the sourceFile timestamp (using parseSourceFileDate)
    const sortedLogs = logs.toSorted((a, b) => {
      const dateA = parseSourceFileDate(a.sourceFile);
      const dateB = parseSourceFileDate(b.sourceFile);
      return dateA.getTime() - dateB.getTime();
    }).slice(0, 75); // Limit to 75 most recent logs

    const typedLogs: Log[] = sortedLogs as unknown as Log[];

    // Transform the logs into chart-friendly format
    const chartData = transformLogsToChartData(typedLogs, roomName);

    return NextResponse.json({ data: chartData });

  } catch (err) {
    console.error("Failed to fetch occupancy data:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
