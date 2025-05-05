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

    // ------------------------------
    // 1. Get total occupancy
    // ------------------------------
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

    // ------------------------------
    // 2. Get this week's energy usage from Shelly logs
    // ------------------------------
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekUsage = await db.collection("device_usage").find({
      timestamp: { $gte: oneWeekAgo }
    }).toArray();

    const lastWeekUsage = await db.collection("device_usage").find({
      timestamp: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
    }).toArray();

    const thisWeekEnergy = thisWeekUsage.reduce((sum, doc) => sum + (doc.energy ?? 0), 0);
    const lastWeekEnergy = lastWeekUsage.reduce((sum, doc) => sum + (doc.energy ?? 0), 0);

    const thisWeek = parseFloat((thisWeekEnergy / 60 / 1000).toFixed(2)); // kWh
    const lastWeek = parseFloat((lastWeekEnergy / 60 / 1000).toFixed(2)); // kWh

    let energyTrend: "up" | "down" | "same" = "same";
    if (thisWeek > lastWeek) energyTrend = "up";
    else if (thisWeek < lastWeek) energyTrend = "down";
    
    const energyChange =
      lastWeek > 0 ? (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1) : "0";
    

    // ------------------------------
    // 3. Save weekly energy summary
    // ------------------------------
    const energyCollection = db.collection("energy");

    await energyCollection.insertOne({
      weekStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1),
      createdAt: new Date(),
      energySaved: thisWeek,
      lastWeek: lastWeek,
      energyChange: energyChange,
      trend: energyTrend,
    });

    // ------------------------------
    // 4. Count access devices
    // ------------------------------

    return NextResponse.json({
      accessDevices: await db.collection("devices").countDocuments(),
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
      await client.close();
    }
  }
}
