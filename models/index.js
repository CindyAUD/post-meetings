// models/index.js
import { DataTypes } from "sequelize";
import sequelize from "@/lib/sequelize.js";

// User
export const User = sequelize.define("User", {
  id: { type: DataTypes.STRING, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true },
  name: DataTypes.STRING,
  botLeadMinutes: { type: DataTypes.INTEGER, defaultValue: 5 },
});

// Account (OAuth per provider per user)
export const Account = sequelize.define("Account", {
  id: { type: DataTypes.STRING, primaryKey: true }, // e.g. provider-providerAccountId
  provider: DataTypes.STRING,
  providerAccountId: DataTypes.STRING,
  accessToken: DataTypes.TEXT,
  refreshToken: DataTypes.TEXT,
  expiresAt: DataTypes.DATE,
  scope: DataTypes.TEXT,
  UserId: DataTypes.STRING,
});

// CalendarEvent
export const CalendarEvent = sequelize.define("CalendarEvent", {
  id: { type: DataTypes.STRING, primaryKey: true },
  title: DataTypes.STRING,
  startTime: DataTypes.DATE,
  endTime: DataTypes.DATE,
  meetingUrl: DataTypes.STRING,
  notetakerEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  provider: DataTypes.STRING, // "google" etc
  providerAccountId: DataTypes.STRING, // which Google account owns it
  UserId: DataTypes.STRING,
});

// Meeting
export const Meeting = sequelize.define("Meeting", {
  id: { type: DataTypes.STRING, primaryKey: true },
  CalendarEventId: DataTypes.STRING,
  platform: DataTypes.STRING,
  botId: DataTypes.STRING,
  status: DataTypes.STRING,
  attendees: DataTypes.JSON,
  transcript: DataTypes.TEXT,
  mediaReady: { type: DataTypes.BOOLEAN, defaultValue: false },
  transcriptUrl: DataTypes.STRING,
  audioUrl: DataTypes.STRING,
  UserId: DataTypes.STRING,
});

// Automation
export const Automation = sequelize.define("Automation", {
  id: { type: DataTypes.STRING, primaryKey: true },
  platform: DataTypes.STRING, // "linkedin" | "facebook"
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  config: DataTypes.JSON,
  UserId: DataTypes.STRING,
});

// ScheduledPost (optional persistence for generated posts)
export const ScheduledPost = sequelize.define("ScheduledPost", {
  id: { type: DataTypes.STRING, primaryKey: true },
  platform: DataTypes.STRING,
  text: DataTypes.TEXT,
  scheduledAt: DataTypes.DATE,
  postedAt: DataTypes.DATE,
  externalPostId: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: "scheduled" },
  error: DataTypes.TEXT,
  UserId: DataTypes.STRING,
});

// Associations
User.hasMany(Account);
Account.belongsTo(User);

User.hasMany(CalendarEvent);
CalendarEvent.belongsTo(User);

CalendarEvent.hasOne(Meeting);
Meeting.belongsTo(CalendarEvent);

User.hasMany(Automation);
Automation.belongsTo(User);

User.hasMany(ScheduledPost);
ScheduledPost.belongsTo(User);

// Centralized db export (models + sequelize)
export const db = {
  sequelize,
  User,
  Account,
  CalendarEvent,
  Meeting,
  Automation,
  ScheduledPost,
};

// DB initializer
export async function initDb() {
  if (!global._dbInitialized) {
    try {
      await sequelize.sync({ alter: true });
      global._dbInitialized = true;
      console.log("✅ Database synced: app.db ready");
    } catch (err) {
      console.error("❌ DB sync failed", err);
    }
  }
}

export default db;
