import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

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

    const data = latestLog[0].data;

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

    const result = Object.entries(data).map(([roomName, { occupancy }]) => {
      let status = "NA";
      let count = 0;
      let frequency = "1 hour";
      let ap = roomToApMap[roomName] || "Unknown";

      if (occupancy === 0) {
        count = 1;
        frequency = "5 mins"
        if(roomName === "NAB Classroom 001"){
          status = "On";
        }
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
