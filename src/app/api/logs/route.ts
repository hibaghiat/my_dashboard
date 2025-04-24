import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Define types for the room data
interface RoomData {
  occupancy: number;
  status: string;
  count: number;
  frequency: string;
}

interface Data {
  [roomName: string]: RoomData;
}

export async function GET() {
  try {
    const mongoUrl = "mongodb://127.0.0.1:27017";
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db("occupancyDB");

    // Get latest occupancy log
    const latestLog = await db
      .collection("occupancy_logs")
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (latestLog.length === 0) {
      return NextResponse.json({ rooms: [] });
    }

    const data: Data = latestLog[0].data; // Cast data to the defined Data type

    // Get AP mappings from devices collection
    const deviceDocs = await db.collection("devices").find({}).toArray();

    // Build roomName → AP name map
    const roomToApMap: Record<string, string> = {};
    for (const doc of deviceDocs) {
      for (const [apName, roomName] of Object.entries(doc)) {
        if (apName !== "_id") {
          roomToApMap[roomName as string] = apName;
        }
      }
    }

    const result = Object.entries(data).map(([roomName, { occupancy, status, count, frequency }]) => {
      let ap = roomToApMap[roomName] || "Unknown";
      
      if (roomName === "NAB Classroom 001") {
        status = "On";
      } else {
        status = "NA";
      }
      if (occupancy === 0) {
        count = 1;
        frequency = "5 mins";
      }

      return {
        building: "NAB",
        room: roomName.replace(/^NAB\s+/i, "").replace(/^Classroom/i, "ClassRoom"),
        ap,
        occupancy,
        status,
        count,
        frequency,
      };
    });

    return NextResponse.json({ rooms: result });
  } catch (err) {
    console.error("Error fetching logs:", err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
