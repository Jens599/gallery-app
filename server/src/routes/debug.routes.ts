import { Router } from "express";
import mongoose from "mongoose";
import { config } from "../config";

const router = Router();

// MongoDB debug info endpoint - only available in development
if (config.server.isDevelopment) {
  router.get("/mongodb-status", async (req, res) => {
    try {
      const connectionState = mongoose.connection.readyState;
      const stateMap: Record<number, string> = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
      };

      // Get database stats and info
      const db = mongoose.connection.db;
      const dbStats = await db?.stats();
      const collections = await db?.listCollections().toArray();
      const adminDb = db?.admin();
      const serverStatus = await adminDb?.serverStatus();

      const dbInfo = {
        connection: {
          state: stateMap[connectionState] || "unknown",
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
          uri: config.db.url.replace(/(mongodb:\/\/[^:]+:)[^@]+@/, "$1****@"), // Hide password
        },
        database: {
          name: mongoose.connection.name,
          collections: collections?.map((col) => ({
            name: col.name,
            type: col.type,
          })),
          stats: {
            collections: dbStats?.collections,
            views: dbStats?.views,
            objects: dbStats?.objects,
            avgObjSize: dbStats?.avgObjSize,
            dataSize: dbStats?.dataSize,
            storageSize: dbStats?.storageSize,
            indexes: dbStats?.indexes,
            indexSize: dbStats?.indexSize,
          },
        },
        server: {
          version: serverStatus?.version,
          uptime: serverStatus?.uptime,
          connections: serverStatus?.connections,
        },
        models: Object.keys(mongoose.models),
      };

      res.json({
        status: "success",
        data: dbInfo,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined,
      });
    }
  });
}

export default router;
