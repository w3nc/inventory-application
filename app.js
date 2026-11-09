const path = require("node:path");
const express = require("express");
const cookieReader = require("./middleware/cookies");
const { exposeAdmin } = require("./middleware/admin");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const indexRouter = require("./routes/indexRouter");
const drawerRouter = require("./routes/drawerRouter");
const recordRouter = require("./routes/recordRouter");
const authRouter = require("./routes/authRouter");
const { setupSchema } = require("./db/schema");
const money = require("./utils/money");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieReader);
app.use(exposeAdmin);

// Values every view can use without being passed in.
app.use((req, res, next) => {
  res.locals.formatPesos = money.formatPesos;
  res.locals.shopName = "Groove Cellar";
  next();
});

app.use("/", indexRouter);
app.use("/drawers", drawerRouter);
app.use("/records", recordRouter);
app.use("/", authRouter);

// These must come last, after every route.
app.use(notFound);
app.use(errorHandler);

// Make the tables ready first, then start listening.
setupSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Groove Cellar running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Could not reach the database:", err.message);
    console.error("Check DATABASE_URL in groove-cellar/.env");
    process.exit(1);
  });
