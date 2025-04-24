import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  let client;
  try {
    const mongoUrl = process.env.MONGO_URI;
    if (!mongoUrl) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db("occupancyDB");

    interface RoomOccupancy {
        occupancy: number;
      }
      
      interface OccupancyLog {
        data: Record<string, RoomOccupancy>;
        timestamp: Date;
      }
      
      const latestOccupancy = await db
        .collection<OccupancyLog>("occupancy_logs")
        .find({})
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();
      
      let totalOccupancy = 0;
      if (latestOccupancy.length > 0) {
        const data = latestOccupancy[0].data;
        totalOccupancy = Object.values(data).reduce((sum, room) => sum + room.occupancy, 0);
      }
      

    const energyDocs = await db
      .collection("energy")
      .find({})
      .sort({ _id: -1 })
      .limit(2)
      .toArray();


    const thisWeek = parseFloat(energyDocs[0]?.Energy ?? "0");
    const lastWeek = parseFloat(energyDocs[1]?.Energy ?? "0");

    const energyTrend = thisWeek > lastWeek ? "up" : "down";
    const energyChange =
      lastWeek > 0 ? (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1) : "0";


    //Devices Count
    const devices = await db.collection("devices").countDocuments();

    return NextResponse.json({
        accessDevices: devices,
        occupancy: totalOccupancy,
        energySaved: thisWeek,
        energyChange: energyChange,
        trend: {
            energy: energyTrend,
        },
        });
  } catch (err) {
    console.error("Error connecting to the database", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  } finally {
    if (client) {
      await client.close(); // Ensure that the connection is closed
    }
  }
}
