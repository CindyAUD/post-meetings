import { Sequelize } from "sequelize";

let sequelize;

if (process.env.DATABASE_URL) {
  // ✅ Use Postgres on Vercel
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // for Vercel + managed Postgres
      },
    },
  });
} else {
  // ✅ Fallback to SQLite locally
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite", // local file
    logging: false,
  });
}

export default sequelize;
