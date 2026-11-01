
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

const eventData = [
  // DONATION — 5 Events
  {
    title: "Winter Clothes Distribution",
    eventType: "Donation",
    location: "Mirpur, Dhaka",
    eventDate: "2026-11-10T09:00:00",
    description: "Collect and distribute warm clothes to underprivileged families during winter.",
    thumbnail: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
  },
  {
    title: "Blanket Distribution for the Needy",
    eventType: "Donation",
    location: "Kotbari, Cumilla",
    eventDate: "2026-11-15T10:00:00",
    description: "Help vulnerable families stay warm by donating blankets.",
    thumbnail: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad",
  },
  {
    title: "Emergency Blood Donation Drive",
    eventType: "Donation",
    location: "GEC Circle, Chattogram",
    eventDate: "2026-11-20T09:00:00",
    description: "Support local hospitals by organizing a voluntary blood donation campaign.",
    thumbnail: "https://images.unsplash.com/photo-1615461066841-6116e61058f4",
  },
  {
    title: "School Supplies for Children",
    eventType: "Donation",
    location: "Sadar, Mymensingh",
    eventDate: "2026-11-25T10:00:00",
    description: "Donate notebooks, pens and school bags to children from low-income families.",
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
  },
  {
    title: "Food Support for Street Families",
    eventType: "Donation",
    location: "Zindabazar, Sylhet",
    eventDate: "2026-12-02T11:00:00",
    description: "Distribute essential food packages among families in need.",
    thumbnail: "https://images.unsplash.com/photo-1593113598332-cd288d649433",
  },

  // CLEANUP — 5 Events
  {
    title: "Dhaka Community Cleaning Day",
    eventType: "Cleanup",
    location: "Dhanmondi, Dhaka",
    eventDate: "2026-11-12T08:00:00",
    description: "Join volunteers to clean public spaces and encourage responsible waste disposal.",
    thumbnail: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b",
  },
  {
    title: "Cumilla Lake Cleanup Campaign",
    eventType: "Cleanup",
    location: "Dharmasagar, Cumilla",
    eventDate: "2026-11-18T08:00:00",
    description: "Help remove waste around the lake and protect the local environment.",
    thumbnail: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5",
  },
  {
    title: "Chattogram Beach Cleanup",
    eventType: "Cleanup",
    location: "Patenga, Chattogram",
    eventDate: "2026-11-22T07:30:00",
    description: "Work together to remove plastic waste from the beach.",
    thumbnail: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5",
  },
  {
    title: "Sylhet Neighborhood Cleanup",
    eventType: "Cleanup",
    location: "Ambarkhana, Sylhet",
    eventDate: "2026-12-05T08:00:00",
    description: "Make our neighborhood cleaner through a community volunteer effort.",
    thumbnail: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b",
  },
  {
    title: "Cox's Bazar Coastal Cleanup",
    eventType: "Cleanup",
    location: "Laboni Beach, Cox's Bazar",
    eventDate: "2026-12-12T07:00:00",
    description: "Protect coastal wildlife by collecting plastic and other litter.",
    thumbnail: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5",
  },

  // PLANTATION — 5 Events
  {
    title: "Green Dhaka Tree Plantation",
    eventType: "Plantation",
    location: "Uttara, Dhaka",
    eventDate: "2026-11-14T08:00:00",
    description: "Plant trees and encourage a greener, healthier urban environment.",
    thumbnail: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
  },
  {
    title: "Cumilla Green Campus Initiative",
    eventType: "Plantation",
    location: "Kotbari, Cumilla",
    eventDate: "2026-11-28T08:30:00",
    description: "Plant shade and fruit trees around educational institutions.",
    thumbnail: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
  },
  {
    title: "Chattogram Hill Plantation",
    eventType: "Plantation",
    location: "Panchlaish, Chattogram",
    eventDate: "2026-12-08T08:00:00",
    description: "Promote biodiversity through a community tree plantation program.",
    thumbnail: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
  },
  {
    title: "Sylhet Green Neighborhood",
    eventType: "Plantation",
    location: "Beanibazar, Sylhet",
    eventDate: "2026-12-18T08:00:00",
    description: "Bring residents together to plant trees in their local community.",
    thumbnail: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
  },
  {
    title: "Rajshahi Urban Tree Project",
    eventType: "Plantation",
    location: "Shaheb Bazar, Rajshahi",
    eventDate: "2026-12-22T08:00:00",
    description: "Create greener public spaces with locally suitable tree species.",
    thumbnail: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
  },

  // WINTER RELIEF — 5 Events
  {
    title: "Winter Relief for Rural Families",
    eventType: "Winter Relief",
    location: "Nangolkot, Cumilla",
    eventDate: "2026-11-30T09:00:00",
    description: "Distribute warm clothing and essential winter items to rural families.",
    thumbnail: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
  },
  {
    title: "Warm Hearts Winter Campaign",
    eventType: "Winter Relief",
    location: "Savar, Dhaka",
    eventDate: "2026-12-10T09:00:00",
    description: "Support elderly people and vulnerable communities with winter essentials.",
    thumbnail: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad",
  },
  {
    title: "Winter Care for Street Children",
    eventType: "Winter Relief",
    location: "New Market, Chattogram",
    eventDate: "2026-12-20T10:00:00",
    description: "Provide warm clothes and care packages for children living on the streets.",
    thumbnail: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
  },
  {
    title: "Rural Winter Support Program",
    eventType: "Winter Relief",
    location: "Kushtia Sadar, Kushtia",
    eventDate: "2027-01-05T09:00:00",
    description: "Deliver winter clothing to families in underserved rural communities.",
    thumbnail: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad",
  },
  {
    title: "Winter Aid for Tea Garden Workers",
    eventType: "Winter Relief",
    location: "Sreemangal, Moulvibazar",
    eventDate: "2027-01-12T09:00:00",
    description: "Distribute warm clothes and basic necessities to tea garden workers.",
    thumbnail: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
  },

  // FOOD DRIVE — 5 Events
  {
    title: "Community Food Drive",
    eventType: "Food Drive",
    location: "Mohammadpur, Dhaka",
    eventDate: "2026-12-01T11:00:00",
    description: "Collect and distribute nutritious food packages to families in need.",
    thumbnail: "https://images.unsplash.com/photo-1593113598332-cd288d649433",
  },
  {
    title: "Ramadan Food Support Preparation",
    eventType: "Food Drive",
    location: "Kandirpar, Cumilla",
    eventDate: "2027-01-20T10:00:00",
    description: "Organize essential food supplies for low-income households.",
    thumbnail: "https://images.unsplash.com/photo-1593113598332-cd288d649433",
  },
  {
    title: "Meals for Everyone",
    eventType: "Food Drive",
    location: "Agrabad, Chattogram",
    eventDate: "2027-01-25T11:00:00",
    description: "Prepare and distribute meals to people experiencing food insecurity.",
    thumbnail: "https://images.unsplash.com/photo-1547592180-85f173990554",
  },
  {
    title: "Rangpur Community Food Support",
    eventType: "Food Drive",
    location: "Rangpur Sadar, Rangpur",
    eventDate: "2027-02-02T10:00:00",
    description: "Collect food donations and deliver them to vulnerable households.",
    thumbnail: "https://images.unsplash.com/photo-1593113598332-cd288d649433",
  },
  {
    title: "Food for Street Families",
    eventType: "Food Drive",
    location: "Khulna Sadar, Khulna",
    eventDate: "2027-02-08T11:00:00",
    description: "Bring volunteers together to prepare and distribute fresh meals.",
    thumbnail: "https://images.unsplash.com/photo-1547592180-85f173990554",
  },

  // HEALTH CAMP — 5 Events
  {
    title: "Free Community Health Camp",
    eventType: "Health Camp",
    location: "Gulshan, Dhaka",
    eventDate: "2026-12-03T09:00:00",
    description: "Provide basic health checkups and health awareness support.",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
  },
  {
    title: "Rural Health Awareness Camp",
    eventType: "Health Camp",
    location: "Debidwar, Cumilla",
    eventDate: "2026-12-15T09:00:00",
    description: "Promote preventive healthcare and provide basic medical guidance.",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
  },
  {
    title: "Women's Health Awareness Day",
    eventType: "Health Camp",
    location: "Panchlaish, Chattogram",
    eventDate: "2027-01-08T09:00:00",
    description: "Organize health education and basic screening for women.",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
  },
  {
    title: "Healthy Living Community Workshop",
    eventType: "Health Camp",
    location: "Rajshahi Sadar, Rajshahi",
    eventDate: "2027-01-18T10:00:00",
    description: "Share practical knowledge about nutrition, exercise and healthy living.",
    thumbnail: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528",
  },
  {
    title: "Free Eye Care Awareness Camp",
    eventType: "Health Camp",
    location: "Barishal Sadar, Barishal",
    eventDate: "2027-02-12T09:00:00",
    description: "Raise awareness about eye health and arrange basic vision screening.",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
  },

  // EDUCATION — 5 Events
  {
    title: "Free Computer Literacy Workshop",
    eventType: "Education",
    location: "Banani, Dhaka",
    eventDate: "2026-12-06T10:00:00",
    description: "Help young people learn basic computer skills and digital literacy.",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
  },
  {
    title: "Children's Reading Circle",
    eventType: "Education",
    location: "Cumilla Sadar, Cumilla",
    eventDate: "2026-12-16T10:00:00",
    description: "Encourage children to read books and develop creative thinking.",
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
  },
  {
    title: "Career Guidance for Students",
    eventType: "Education",
    location: "Nasirabad, Chattogram",
    eventDate: "2027-01-10T10:00:00",
    description: "Connect students with mentors and explore future career opportunities.",
    thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655",
  },
  {
    title: "Digital Skills for Rural Youth",
    eventType: "Education",
    location: "Bogra Sadar, Bogura",
    eventDate: "2027-01-28T10:00:00",
    description: "Introduce young people to useful digital tools and online learning.",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
  },
  {
    title: "Community English Learning Session",
    eventType: "Education",
    location: "Jashore Sadar, Jashore",
    eventDate: "2027-02-15T10:00:00",
    description: "Practice everyday English communication in a friendly learning environment.",
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
  },
];

async function seedEvents() {
  try {
    await client.connect();

    console.log("Connected to MongoDB!");

    const database = client.db("goodwaveDB");
    const eventCollection = database.collection("events");

    const operations = eventData.map((event, index) => ({
      updateOne: {
        filter: { seedKey: `goodwave-sample-${index + 1}` },
        update: {
          $set: {
            ...event,
            eventDate: new Date(event.eventDate),
            seedKey: `goodwave-sample-${index + 1}`,
          },
          $setOnInsert: {
            createdAt: new Date(),
            organizerEmail: "demo@goodwave.com",
          },
        },
        upsert: true,
      },
    }));

    const result = await eventCollection.bulkWrite(operations);

    console.log("Seed completed successfully!");
    console.log(`Sample events prepared: ${eventData.length}`);
    console.log(`Inserted: ${result.upsertedCount}`);
    console.log(`Updated existing samples: ${result.modifiedCount}`);
    console.log("Your manually created events were not deleted.");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await client.close();
  }
}

seedEvents();
