import express from "express";
import cors from "cors";
import fs from "fs";
import passport from "passport";
import { BearerStrategy } from "passport-azure-ad";
import session from "express-session";
import dotenv from "dotenv";
import { config } from "./config.js";

dotenv.config();

const app = express();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Azure AD Bearer strategy configuration
const bearerStrategy = new BearerStrategy({
  identityMetadata: `${config.auth.authority}/${config.auth.tenantId}/v2.0/.well-known/openid-configuration`,
  clientID: config.auth.clientId,
  validateIssuer: true,
  issuer: `https://sts.windows.net/${config.auth.tenantId}/`,
  passReqToCallback: false
}, (token, done) => {
  done(null, { email: token.preferred_username }, token);
});

passport.use(bearerStrategy);
app.use(passport.initialize());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));
app.use(express.json());

const functions = JSON.parse(fs.readFileSync("./functions.json", "utf8"));

// Auth routes
app.get('/auth/login', passport.authenticate('azure-ad-oauth2'));

app.get('/auth/callback',
  passport.authenticate('azure-ad-oauth2', { session: false }),
  (req, res) => {
    res.redirect('http://localhost:5173'); // Redirect to frontend
  }
);

app.get('/auth/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Protected API routes
app.get("/api/functions", passport.authenticate('bearer', { session: false }), (req, res) => {
  res.json(functions);
});

app.post("/api/executeFunction", passport.authenticate('bearer', { session: false }), (req, res) => {
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
