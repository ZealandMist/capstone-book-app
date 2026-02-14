import mongoose from "mongoose";

let isConnected = false; // global cache

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI!);
    isConnected = true;

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log(`✅ MongoDB Connected: ${connection.host}`);
    });

    connection.on("error", (error) => {
      console.error(`❌ MongoDB connection error: ${error.message}`);
      process.exit(1);
    });
  } catch (error: any) {
    console.error("MongoDB connection failed:", error.message);
    throw new Error(error.message);
  }
}
