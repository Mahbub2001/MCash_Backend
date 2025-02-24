const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require('cookie-parser'); 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/user"));
app.use("/agent", require("./routes/agent"));
app.use("/admin", require("./routes/admin"));

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send(`MCash server is running on port ${PORT}`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
