"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var cron = require("node-cron");
var arubaService_1 = require("./arubaService");
var apMappings_1 = require("./apMappings");
var MongoClient = require("mongodb").MongoClient;
// Mock function to get device status
function getDeviceStatus(classroom) {
    // Replace this with actual API call to IoT platform
    // For now, simulate that some are on and some are off
    var simulatedOnRooms = ["RoomA", "RoomB"]; // Example
    return simulatedOnRooms.includes(classroom);
}
// Control functions
function turnOnDevices(classroom) {
    console.log(" [ACTION] Turning ON devices in ".concat(classroom));
    // Call actual IoT API here
}
function turnOffDevices(classroom) {
    console.log(" [ACTION] Turning OFF devices in ".concat(classroom));
    // Call actual IoT API here
}
var mongoUrl = "mongodb://127.0.0.1:27017";
var dbName = "occupancyDB";
var collectionName = "occupancy_logs";
function saveDataToMongo(data) {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, collection, now, options, formatter, timestamp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new MongoClient(mongoUrl);
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db(dbName);
                    collection = db.collection(collectionName);
                    now = new Date();
                    return [4 /*yield*/, collection.insertOne({
                            timestamp: now,
                            data: data,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, client.close()];
                case 3:
                    _a.sent();
                    options = {
                        timeZone: "Africa/Casablanca",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false
                    };
                    formatter = new Intl.DateTimeFormat("en-GB", options);
                    timestamp = formatter.format(now).replace(/\D/g, "-");
                    console.log("---------- Data saved to MongoDB at ".concat(timestamp));
                    return [2 /*return*/];
            }
        });
    });
}
function handleOccupancyLogic(occupancies) {
    return __awaiter(this, void 0, void 0, function () {
        var enriched, _loop_1, _i, _a, classroom;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    enriched = {};
                    _loop_1 = function (classroom) {
                        var occupancy, devicesOn, status_1, count, frequency, apName, rechecked, secondOccupancy;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    occupancy = occupancies[classroom].occupancy;
                                    devicesOn = getDeviceStatus(classroom);
                                    status_1 = "NA";
                                    count = 0;
                                    frequency = "1 hour";
                                    if (devicesOn && occupancy !== 0) {
                                        status_1 = "On";
                                        console.log(" ".concat(classroom, ": Devices ON & Occupancy ").concat(occupancy, " \u2192 Check again in an hour."));
                                    }
                                    if (!(devicesOn && occupancy === 0)) return [3 /*break*/, 3];
                                    console.log("------- ".concat(classroom, ": Devices ON & Occupancy 0 \u2192 Checking again in 5 min..."));
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5 * 60 * 1000); })];
                                case 1:
                                    _d.sent();
                                    apName = Object.keys(apMappings_1.apMappings).find(function (ap) { return apMappings_1.apMappings[ap] === classroom; });
                                    if (!apName)
                                        return [2 /*return*/, "continue"];
                                    return [4 /*yield*/, (0, arubaService_1.getDataForAPs)([apName])];
                                case 2:
                                    rechecked = _d.sent();
                                    secondOccupancy = ((_b = rechecked[classroom]) === null || _b === void 0 ? void 0 : _b.occupancy) || 0;
                                    if (secondOccupancy === 0) {
                                        turnOffDevices(classroom);
                                        status_1 = "Off";
                                        count = 1;
                                        frequency = "5 mins";
                                    }
                                    else {
                                        status_1 = "On";
                                    }
                                    _d.label = 3;
                                case 3:
                                    if (!devicesOn && occupancy === 0) {
                                        status_1 = "Off";
                                        console.log(" ".concat(classroom, ": Devices OFF & Occupancy 0 \u2192 Check again in an hour."));
                                    }
                                    if (!devicesOn && occupancy !== 0) {
                                        turnOnDevices(classroom);
                                        status_1 = "On";
                                        console.log(" ".concat(classroom, ": Devices OFF & Occupancy ").concat(occupancy, " \u2192 Turned ON devices, will check again in an hour."));
                                    }
                                    enriched[classroom] = { occupancy: occupancy, status: status_1, count: count, frequency: frequency };
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = Object.keys(occupancies);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    classroom = _a[_i];
                    return [5 /*yield**/, _loop_1(classroom)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, enriched];
            }
        });
    });
}
// Schedule to run every hour from 8AM to 10PM
cron.schedule("13 3-22 * * *", function () { return __awaiter(void 0, void 0, void 0, function () {
    var rawOccupancies, enrichedOccupancies, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(" Scheduled task running...");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, (0, arubaService_1.getData)()];
            case 2:
                rawOccupancies = _a.sent();
                return [4 /*yield*/, handleOccupancyLogic(rawOccupancies)];
            case 3:
                enrichedOccupancies = _a.sent();
                console.log("Enriched occupancies:", enrichedOccupancies);
                return [4 /*yield*/, saveDataToMongo(enrichedOccupancies)];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error("-------Error during scheduled task:", error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
console.log("-------Scheduler initialized. Running every hour from 8AM to 10PM.");
