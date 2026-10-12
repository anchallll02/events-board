import mongoose from "mongoose";
import { connectDB } from "../lib/mongodb.js";
import { Event } from "../models/Event.js";
import { Reminder } from "../models/Reminder.js";
import { CardDesign } from "../models/CardDesign.js";

// days: number of days from today (negative = past)
function at(days, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const img = (seed) => `https://picsum.photos/seed/${seed}/800/500`;

const events = [
  // Upcoming + active
  { title: "Coimbatore Indie Music Night", category: "Music", city: "Coimbatore", startsAt: at(3, 18, 30), price: 499, isActive: true, description: "An evening of live indie bands from across South India.", imageUrl: img("indie-night") },
  { title: "Acoustic Sunset Sessions", category: "Music", city: "Chennai", startsAt: at(6, 17), price: 750, isActive: true, description: "Unplugged acoustic sets by the beach.", imageUrl: img("acoustic") },
  { title: "Classical Fusion Evening", category: "Music", city: "Bengaluru", startsAt: at(10, 19), price: 150000, isActive: true, description: "Carnatic and western classical artists share one stage.", imageUrl: img("fusion") },
  { title: "Pottery for Beginners", category: "Workshop", city: "Coimbatore", startsAt: at(4, 10), price: 1200, isActive: true, description: "Hands-on wheel throwing workshop. Materials included.", imageUrl: img("pottery") },
  { title: "Photography Walk", category: "Workshop", city: "Mumbai", startsAt: at(8, 7), price: 2500, isActive: true, description: "Learn street photography with a working photographer.", imageUrl: img("photowalk") },
  { title: "Street Food Carnival", category: "Food", city: "Chennai", startsAt: at(5, 16), price: 150, isActive: true, description: "Over 40 stalls serving regional street food.", imageUrl: img("streetfood") },
  { title: "Coimbatore Biryani Festival", category: "Food", city: "Coimbatore", startsAt: at(12, 12), price: 350, isActive: true, description: "Biryani styles from across India in one place.", imageUrl: img("biryani") },
  { title: "Community Football Finals", category: "Sports", city: "Delhi", startsAt: at(7, 16, 30), price: 0, isActive: true, description: "Neighbourhood teams compete in the season finale.", imageUrl: img("football") },
  { title: "City Marathon 10K", category: "Sports", city: "Bengaluru", startsAt: at(20, 5, 30), price: 800, isActive: true, description: "A fast, flat 10K route through the city centre.", imageUrl: img("marathon") },
  { title: "Kids Art and Craft Day", category: "Kids", city: "Coimbatore", startsAt: at(9, 11), price: 300, isActive: true, description: "Painting and paper craft for ages 5 to 10.", imageUrl: img("kidsart") },
  { title: "Puppet Show Matinee", category: "Kids", city: "Mumbai", startsAt: at(15, 15), price: 250, isActive: true, description: "A colourful puppet story for the whole family.", imageUrl: img("puppets") },
  // Inactive
  { title: "Rock Night (Postponed)", category: "Music", city: "Delhi", startsAt: at(11, 20), price: 999, isActive: false, description: "Postponed due to venue issues.", imageUrl: img("rocknight") },
  { title: "Baking Masterclass (Cancelled)", category: "Workshop", city: "Chennai", startsAt: at(13, 14), price: 1800, isActive: false, description: "Cancelled by the host.", imageUrl: img("baking") },
  // Past
  { title: "Diwali Food Fair", category: "Food", city: "Bengaluru", startsAt: at(-20, 17), price: 200, isActive: true, description: "Festive sweets and snacks fair.", imageUrl: img("diwali-fair") },
  { title: "Summer Kids Camp Showcase", category: "Kids", city: "Coimbatore", startsAt: at(-10, 10), price: 100, isActive: true, description: "Children present what they learned at camp.", imageUrl: img("kidscamp") },
];

async function main() {
  await connectDB();
  await CardDesign.deleteMany({});
  await Reminder.deleteMany({});
  await Event.deleteMany({});
  await Event.syncIndexes();
  await Event.insertMany(events);
  console.log(`Seeded ${events.length} events`);
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}