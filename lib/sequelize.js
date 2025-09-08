import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./app.db", // creates app.db in project root
  logging: false,
});

export default sequelize;
