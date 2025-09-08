import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("User", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    name: DataTypes.STRING,
  });
};
