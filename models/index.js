import { DataTypes } from "sequelize";
import sequelize from "@/lib/sequelize.js";

// Define models
export const User = sequelize.define("User", {
  id: { type: DataTypes.STRING, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true },
  name: DataTypes.STRING,
});

export const Account = sequelize.define("Account", {
  id: { type: DataTypes.STRING, primaryKey: true },
  provider: DataTypes.STRING,
  providerAccountId: DataTypes.STRING,
});

export const CalendarEvent = sequelize.define("CalendarEvent", {
  id: { type: DataTypes.STRING, primaryKey: true },
  title: DataTypes.STRING,
  startTime: DataTypes.DATE,
  meetingUrl: DataTypes.STRING,
  notetakerEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export const Meeting = sequelize.define("Meeting", {
  id: { type: DataTypes.STRING, primaryKey: true },
  botId: DataTypes.STRING,
  transcript: DataTypes.TEXT,
  attendees: DataTypes.JSON,
});

export const Automation = sequelize.define("Automation", {
  id: { type: DataTypes.STRING, primaryKey: true },
  platform: DataTypes.STRING,
  config: DataTypes.JSON,
});

// Relationships
User.hasMany(Account);
Account.belongsTo(User);

User.hasMany(CalendarEvent);
CalendarEvent.belongsTo(User);

CalendarEvent.hasOne(Meeting);
Meeting.belongsTo(CalendarEvent);

User.hasMany(Automation);
Automation.belongsTo(User);

// Centralized DB object
const db = { sequelize, User, Account, CalendarEvent, Meeting, Automation };

// DB initializer
export async function initDb() {
  if (!global._dbInitialized) {
    try {
      await sequelize.sync({ alter: true }); // safer schema updates
      global._dbInitialized = true;
      console.log("✅ Database synced: app.db ready");
    } catch (err) {
      console.error("❌ DB sync failed", err);
    }
  }
}

export default db;
