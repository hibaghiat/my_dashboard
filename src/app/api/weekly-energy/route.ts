// /app/api/weekly-energy/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  const mongoUrl = process.env.MONGO_URI;
  const client = new MongoClient(mongoUrl!);

  // Total estimated consumption per room per hour (Watts)
  const DEVICE_WATTS = {
    projector: 150,
    computer: 100,
    tv: 120,
    lights: 20,
  };

  const totalWatts = Object.values(DEVICE_WATTS).reduce((a, b) => a + b, 0); // 390W
  const hoursToKWh = (watts: number) => watts / 1000; // convert to kWh
  const ROOM_WATTS_KWH = hoursToKWh(totalWatts); // 0.39 kWh

  try {
    await client.connect();
    const db = client.db("occupancyDB");
    const logs = await db
      .collection("occupancy_logs")
      .find({})
      .sort({ timestamp: 1 })
      .limit(75)
      .toArray();

    const weekdayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const dayMap: Record<string, { consumed: number; saved: number }> = {
      Monday: { consumed: 0, saved: 0 },
      Tuesday: { consumed: 0, saved: 0 },
      Wednesday: { consumed: 0, saved: 0 },
      Thursday: { consumed: 0, saved: 0 },
      Friday: { consumed: 0, saved: 0 },
    };

    logs.forEach((log, index) => {
      const dayIndex = Math.floor(index / 15); // 15 logs per day
      const day = weekdayLabels[dayIndex];
      if (!day) return;

      for (const room in log.data) {
        const { occupancy = 0, status = "Off" } = log.data[room];

        if (occupancy > 0 || status === "On") {
          dayMap[day].consumed += ROOM_WATTS_KWH;
        } else {
          dayMap[day].saved += ROOM_WATTS_KWH;
        }
      }
    });

    const responseData = Object.entries(dayMap).map(([day, values]) => ({
      day,
      consumed: parseFloat(values.consumed.toFixed(2)),
      saved: parseFloat(values.saved.toFixed(2)),
    }));

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("Weekly energy error:", err);
    return NextResponse.json({ error: "Failed to calculate energy data" }, { status: 500 });
  } finally {
    await client.close();
  }
}
