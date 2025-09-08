// lib/db.js
import sequelize from "./sequelize.js";
import db from "../models/index.js";
// We expose both sequelize instance + models
export { sequelize };
export default db;