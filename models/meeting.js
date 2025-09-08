import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Account", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    provider: DataTypes.STRING,
    providerAccountId: DataTypes.STRING,
  });
};
