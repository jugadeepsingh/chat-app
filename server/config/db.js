const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.MYSQL_PUBLIC_URL, {
  dialect: "mysql",
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("MySQL connected ✅");
  } catch (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
