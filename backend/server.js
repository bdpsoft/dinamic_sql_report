import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const functions = JSON.parse(fs.readFileSync("./functions.json", "utf8"));

app.get("/api/functions", (req, res) => {
  res.json(functions);
});

app.post("/api/executeFunction", (req, res) => {
  const { function_name, parameters, filters } = req.body;
  console.log("Executing function:", function_name);
  console.log("Parameters:", parameters);
  console.log("Filters:", filters);

  const result = {
    success: true,
    executed_at: new Date(),
    rows: [
      { message: `Simulated result for ${function_name}` },
      { parameters, filters },
    ],
  };

  res.json(result);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
