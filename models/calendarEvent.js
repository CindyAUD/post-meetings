import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("CalendarEvent", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    platform: DataTypes.STRING, // e.g. zoom/google/teams
    attendees: DataTypes.TEXT,  // store JSON string of attendees
  });
};
