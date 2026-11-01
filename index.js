 
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const client = new MongoClient(process.env.MONGODB_URI);

const database = client.db("goodwaveDB");
const eventCollection = database.collection("events");

// Connect to MongoDB
export async function connectToMongoDB() {
  try {
    await client.connect();

    console.log("You successfully connected to MongoDB!");

    return client;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

// Home Route
app.get("/", (req, res) => {
  res.send("Goodwave server is running!");
});

// ==========================================
// GET ALL UPCOMING EVENTS
// Category Filter + Search + Limit
// ==========================================

app.get("/api/events", async (req, res) => {
  try {
    const { category, search } = req.query;

    // Validate limit
    const requestedLimit = Number.parseInt(req.query.limit, 10);

    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 0;

    // Only future events
    const filter = {
      eventDate: { $exists: true },
      $expr: {
        $gt: [{ $toDate: "$eventDate" }, new Date()],
      },
    };

    // Category Filter
    if (
      typeof category === "string" &&
      category.trim() &&
      category !== "All"
    ) {
      filter.eventType = category.trim();
    }

    // Search by title, location or description
    if (typeof search === "string" && search.trim()) {
      const safeSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(safeSearch, "i");

      filter.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
      ];
    }

    // Fetch events from MongoDB
    const cursor = eventCollection
      .find(filter)
      .sort({ eventDate: 1 });

    if (limit > 0) {
      cursor.limit(limit);
    }

    const events = await cursor.toArray();

    res.status(200).send({
      success: true,
      total: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get Events Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch events",
    });
  }
});

// ==========================================
// GET SINGLE EVENT DETAILS
// ==========================================

app.get("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await eventCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).send({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Get Event Details Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch event details",
    });
  }
});

// ==========================================
// CREATE EVENT
// JWT SECURITY WILL BE ADDED NEXT
// ==========================================

app.post("/api/events", async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      thumbnail,
      location,
      eventDate,
    } = req.body;

    // Required field validation
    if (
      !title?.trim() ||
      !description?.trim() ||
      !eventType?.trim() ||
      !thumbnail?.trim() ||
      !location?.trim() ||
      !eventDate
    ) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate event date
    const selectedDate = new Date(eventDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).send({
        success: false,
        message: "Invalid event date",
      });
    }

    if (selectedDate <= new Date()) {
      return res.status(400).send({
        success: false,
        message: "Event date must be in the future",
      });
    }

    // Prepare event data
    const eventData = {
      title: title.trim(),
      description: description.trim(),
      eventType: eventType.trim(),
      thumbnail: thumbnail.trim(),
      location: location.trim(),
      eventDate: selectedDate,

      // Temporary sample organizer.
      // Next step: take this from verified JWT.
      organizerEmail: "demo@goodwave.com",

      createdAt: new Date(),
    };

    // Insert into MongoDB
    const result = await eventCollection.insertOne(eventData);

    res.status(201).send({
      success: true,
      message: "Event created successfully",
      insertedId: result.insertedId,
      data: eventData,
    });
  } catch (error) {
    console.error("Create Event Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to create event",
    });
  }
});

// ==========================================
// START SERVER AFTER MONGODB CONNECTION
// ==========================================

async function startServer() {
  try {
    await connectToMongoDB();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
