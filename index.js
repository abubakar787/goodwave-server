 
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import { createRemoteJWKSet, jwtVerify } from "jose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use((req, res, next) => {
  if (
    req.body &&
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return res.status(400).send({
      success: false,
      message: "Invalid request body",
    });
  }

  next();
});
app.use(express.json());

app.use((req, res, next) => {
  if (
    req.body !== undefined &&
    (!req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body))
  ) {
    return res.status(400).send({
      success: false,
      message: "Invalid request body",
    });
  }

  next();
});

// ==========================================
// MONGODB CONNECTION
// ==========================================

const client = new MongoClient(process.env.MONGODB_URI || "");

const database = client.db("goodwaveDB");

const eventCollection = database.collection("events");
const joinedCollection = database.collection("joinedEvents");
let dbConnectionPromise;

async function connectDatabase() {
  if (!dbConnectionPromise) {
    dbConnectionPromise = client
      .connect()
      .then(async () => {
        await joinedCollection.createIndex(
          { eventId: 1, userId: 1 },
          { unique: true }
        );

        console.log("MongoDB connected successfully!");
      })
      .catch((error) => {
        dbConnectionPromise = null;
        throw error;
      });
  }

  return dbConnectionPromise;
}

// ==========================================
// BETTER AUTH JWT CONFIGURATION
// ==========================================

const AUTH_URL =
  process.env.BETTER_AUTH_URL || "http://localhost:3000";

const JWKS = createRemoteJWKSet(
  new URL(`${AUTH_URL}/api/auth/jwks`)
);

// ==========================================
// GET VERIFIED USER IDENTITY
// ==========================================

function getUserIdentity(req) {
  const userId = req.user?.sub;
  const email = req.user?.email;

  if (!userId || !email) {
    throw new Error("User ID or email missing from JWT");
  }

  return {
    userId: String(userId),
    email: String(email).toLowerCase(),
  };
}

// ==========================================
// JWT AUTHENTICATION MIDDLEWARE
// ==========================================

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: AUTH_URL,
      audience: AUTH_URL,
    });

    req.user = payload;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    return res.status(401).send({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

// ==========================================
// CHECK EVENT OWNERSHIP
// ==========================================

async function findOwnedEvent(eventId, user) {
  if (!ObjectId.isValid(eventId)) {
    return null;
  }

  return eventCollection.findOne({
    _id: new ObjectId(eventId),
    organizerId: user.userId,
  });
}

// ==========================================
// VALIDATE EVENT DATA
// ==========================================

function validateEventData(data, partial = false) {
  const fields = [
    "title",
    "description",
    "eventType",
    "thumbnail",
    "location",
    "eventDate",
  ];

  for (const field of fields) {
    if (!partial || data[field] !== undefined) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        String(data[field]).trim() === ""
      ) {
        return `${field} is required`;
      }
    }
  }

  const limits = {
    title: 100,
    description: 2000,
    eventType: 50,
    thumbnail: 2048,
    location: 150,
  };

  for (const [field, maxLength] of Object.entries(limits)) {
    if (
      data[field] !== undefined &&
      String(data[field]).trim().length > maxLength
    ) {
      return `${field} exceeds maximum length`;
    }
  }

  if (
    data.title !== undefined &&
    String(data.title).trim().length < 3
  ) {
    return "Title must contain at least 3 characters";
  }

  if (
    data.description !== undefined &&
    String(data.description).trim().length < 10
  ) {
    return "Description must contain at least 10 characters";
  }

  if (data.thumbnail !== undefined) {
    try {
      const imageUrl = new URL(data.thumbnail);

      if (!["http:", "https:"].includes(imageUrl.protocol)) {
        return "Invalid thumbnail URL";
      }
    } catch {
      return "Invalid thumbnail URL";
    }
  }

  if (data.eventDate !== undefined) {
    const selectedDate = new Date(data.eventDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return "Invalid event date";
    }

    if (selectedDate <= new Date()) {
      return "Event date must be in the future";
    }
  }

  return null;
}

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send("GOODWAVE server is running!");
});

// ==========================================
// GET ALL UPCOMING EVENTS
// PUBLIC API
// ==========================================

app.get("/api/events", async (req, res) => {
  try {
    const { category, search } = req.query;

    const requestedLimit = Number.parseInt(req.query.limit, 10);

    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 0;

    const filter = {
      eventDate: { $exists: true },
      $expr: {
        $gt: [{ $toDate: "$eventDate" }, new Date()],
      },
    };

    if (
      typeof category === "string" &&
      category.trim() &&
      category !== "All"
    ) {
      filter.eventType = category.trim();
    }

    if (typeof search === "string" && search.trim()) {
      const safeSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const searchRegex = new RegExp(safeSearch, "i");

      filter.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
      ];
    }

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
  message: "Unable to retrieve events at this time.",
  error: process.env.NODE_ENV === "development"
    ? error.message
    : undefined,
});
  }
});

// ==========================================
// GET SINGLE EVENT DETAILS
// PUBLIC API
// ==========================================

app.get("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

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
// PROTECTED API
// ==========================================

app.post("/api/events", verifyToken, async (req, res) => {
  try {
    const user = getUserIdentity(req);

    const {
      title,
      description,
      eventType,
      thumbnail,
      location,
      eventDate,
    } = req.body;

    const validationError = validateEventData({
      title,
      description,
      eventType,
      thumbnail,
      location,
      eventDate,
    });

    if (validationError) {
      return res.status(400).send({
        success: false,
        message: validationError,
      });
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      eventType: eventType.trim(),
      thumbnail: thumbnail.trim(),
      location: location.trim(),
      eventDate: new Date(eventDate),

      organizerId: user.userId,
      organizerEmail: user.email,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await eventCollection.insertOne(eventData);

    res.status(201).send({
      success: true,
      message: "Event created successfully",
      insertedId: result.insertedId,
      data: {
        ...eventData,
        _id: result.insertedId,
      },
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
// GET MY CREATED EVENTS
// PROTECTED API
// ==========================================

app.get("/api/my-events", verifyToken, async (req, res) => {
  try {
    const user = getUserIdentity(req);

    const events = await eventCollection
      .find({
        organizerId: user.userId,
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).send({
      success: true,
      total: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get My Events Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch your events",
    });
  }
});

// ==========================================
// UPDATE EVENT
// ONLY EVENT OWNER
// PROTECTED API
// ==========================================

app.patch("/api/events/:id", verifyToken, async (req, res) => {
  try {
    const user = getUserIdentity(req);
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await findOwnedEvent(id, user);

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found or you are not the owner",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "eventType",
      "thumbnail",
      "location",
      "eventDate",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const validationError = validateEventData(updateData, true);

    if (validationError) {
      return res.status(400).send({
        success: false,
        message: validationError,
      });
    }

    if (updateData.eventDate !== undefined) {
      updateData.eventDate = new Date(updateData.eventDate);
    }

    for (const field of Object.keys(updateData)) {
      if (typeof updateData[field] === "string") {
        updateData[field] = updateData[field].trim();
      }
    }

    updateData.updatedAt = new Date();

    await eventCollection.updateOne(
      {
        _id: new ObjectId(id),
        organizerId: user.userId,
      },
      {
        $set: updateData,
      }
    );

    const updatedEvent = await eventCollection.findOne({
      _id: new ObjectId(id),
    });

    res.status(200).send({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Update Event Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to update event",
    });
  }
});

// ==========================================
// DELETE EVENT
// ONLY EVENT OWNER
// PROTECTED API
// ==========================================

app.delete("/api/events/:id", verifyToken, async (req, res) => {
  try {
    const user = getUserIdentity(req);
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await findOwnedEvent(id, user);

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found or you are not the owner",
      });
    }

    await eventCollection.deleteOne({
      _id: new ObjectId(id),
      organizerId: user.userId,
    });

    // Remove all joins related to this event
    await joinedCollection.deleteMany({
      eventId: new ObjectId(id),
    });

    res.status(200).send({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete Event Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to delete event",
    });
  }
});

// ==========================================
// JOIN EVENT
// PROTECTED API
// ==========================================

app.post("/api/events/:id/join", verifyToken, async (req, res) => {
  try {
    const user = getUserIdentity(req);
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await eventCollection.findOne({
      _id: new ObjectId(id),
      $expr: {
        $gt: [{ $toDate: "$eventDate" }, new Date()],
      },
    });

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Upcoming event not found",
      });
    }

    const joinData = {
      eventId: new ObjectId(id),
      userId: user.userId,
      userEmail: user.email,
      eventTitle: event.title,
      joinedAt: new Date(),
    };

    await joinedCollection.insertOne(joinData);

    res.status(201).send({
      success: true,
      message: "You joined the event successfully",
      data: joinData,
    });
  } catch (error) {
    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "You have already joined this event",
      });
    }

    console.error("Join Event Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to join event",
    });
  }
});

// ==========================================
// GET JOINED EVENTS
// PROTECTED API
// ==========================================

app.get("/api/joined-events", verifyToken, async (req, res) => {
  try {
    const user = getUserIdentity(req);

    const joinedRecords = await joinedCollection
      .find({
        userId: user.userId,
      })
      .sort({ joinedAt: -1 })
      .toArray();

    const eventIds = joinedRecords.map((record) => record.eventId);

    const events = await eventCollection
      .find({
        _id: { $in: eventIds },
      })
      .toArray();

    const eventMap = new Map(
      events.map((event) => [event._id.toString(), event])
    );

    const joinedEvents = joinedRecords
      .map((record) => {
        const event = eventMap.get(record.eventId.toString());

        if (!event) return null;

        return {
          ...event,
          joinedAt: record.joinedAt,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() -
          new Date(b.eventDate).getTime()
      );

    res.status(200).send({
      success: true,
      total: joinedEvents.length,
      data: joinedEvents,
    });
  } catch (error) {
    console.error("Get Joined Events Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch joined events",
    });
  }
});

// ==========================================
// CHECK IF USER JOINED AN EVENT
// PROTECTED API
// ==========================================

app.get("/api/events/:id/join-status", verifyToken, async (req, res) => {
  try {
    const user = getUserIdentity(req);
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID",
      });
    }

    const joined = await joinedCollection.findOne({
      eventId: new ObjectId(id),
      userId: user.userId,
    });

    res.status(200).send({
      success: true,
      joined: Boolean(joined),
    });
  } catch (error) {
    console.error("Join Status Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to check join status",
    });
  }
});

// ==========================================
// ==========================================
// HEALTH CHECK API
// ==========================================

app.get("/api/health", async (req, res) => {
  try {
    await database.command({ ping: 1 });

    res.status(200).send({
      success: true,
      message: "GOODWAVE API is healthy",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Health Check Error:", error);

    res.status(503).send({
      success: false,
      message: "Service unavailable",
      database: "disconnected",
    });
  }
});
// LOCAL DEVELOPMENT SERVER

if (process.env.VERCEL !== "1") {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error);
      process.exit(1);
    });
}

// VERCEL SERVERLESS EXPORT

export default app;