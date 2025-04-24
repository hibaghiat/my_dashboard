const cron = require("node-cron");
import { getData, getDataForAPs } from "./arubaService";
import { apMappings } from "./apMappings";
const { MongoClient } = require("mongodb");

// Mock function to get device status
function getDeviceStatus(classroom: string): boolean {
    // Replace this with actual API call to IoT platform
    // For now, simulate that some are on and some are off
    const simulatedOnRooms = ["RoomA", "RoomB"]; // Example
    return simulatedOnRooms.includes(classroom);
  }
  
  // Control functions
  function turnOnDevices(classroom: string) {
    console.log(` [ACTION] Turning ON devices in ${classroom}`);
    // Call actual IoT API here
  }
  
  function turnOffDevices(classroom: string) {
    console.log(` [ACTION] Turning OFF devices in ${classroom}`);
    // Call actual IoT API here
  }
  
const mongoUrl = "mongodb://127.0.0.1:27017";
const dbName = "occupancyDB";
const collectionName = "occupancy_logs";

async function saveDataToMongo(data: any) {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const now = new Date();

  await collection.insertOne({
    timestamp: now,
    data,
  });

  await client.close();
  const options : Intl.DateTimeFormatOptions = {
        timeZone: "Africa/Casablanca",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false 
      };
  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const timestamp = formatter.format(now).replace(/\D/g, "-");
  console.log(`---------- Data saved to MongoDB at ${timestamp}`);
}


async function handleOccupancyLogic(occupancies: any) {
  const enriched: Record<string, { occupancy: number; status: string; count: number; frequency: string }> = {};

  for (const classroom of Object.keys(occupancies)) {
    const occupancy = occupancies[classroom].occupancy;
    const devicesOn = getDeviceStatus(classroom);

    let status = "NA";
    let count = 0;
    let frequency = "1 hour";

    if (devicesOn && occupancy !== 0) {
      status = "On";
      console.log(` ${classroom}: Devices ON & Occupancy ${occupancy} → Check again in an hour.`);

    }

    if (devicesOn && occupancy === 0) {
      console.log(`------- ${classroom}: Devices ON & Occupancy 0 → Checking again in 5 min...`);
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));

      const apName = Object.keys(apMappings).find(ap => apMappings[ap] === classroom);
      if (!apName) continue;

      const rechecked = await getDataForAPs([apName]);
      const secondOccupancy = rechecked[classroom]?.occupancy || 0;

      if (secondOccupancy === 0) {
        turnOffDevices(classroom);
        status = "Off";
        count = 1;
        frequency = "5 mins";
      } else {
        status = "On";
      }
    }

    if (!devicesOn && occupancy === 0) {
      status = "Off";
      console.log(` ${classroom}: Devices OFF & Occupancy 0 → Check again in an hour.`);
    }

    if (!devicesOn && occupancy !== 0) {
      turnOnDevices(classroom);
      status = "On";
      console.log(` ${classroom}: Devices OFF & Occupancy ${occupancy} → Turned ON devices, will check again in an hour.`);
    }

    enriched[classroom] = { occupancy, status, count, frequency };
  }

  return enriched;
}


// Schedule to run every hour from 8AM to 10PM
cron.schedule("13 3-22 * * *", async () => {
  console.log(" Scheduled task running...");
  try {
    const rawOccupancies = await getData();
    const enrichedOccupancies = await handleOccupancyLogic(rawOccupancies);
    
    console.log("Enriched occupancies:", enrichedOccupancies);

    await saveDataToMongo(enrichedOccupancies);
  } catch (error) {
    console.error("-------Error during scheduled task:", error);
  }
});
  
  console.log("-------Scheduler initialized. Running every hour from 8AM to 10PM.");
