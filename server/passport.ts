// server/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage"; // ты уже используешь storage
import { generateUserId } from "./auth";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    if (!user) return done(null, false);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!, // из `.env`
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "http://localhost:5000/api/auth/google/callback", // локальный редирект
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const firstName = profile.name?.givenName;
      const lastName = profile.name?.familyName;
      const profileImageUrl = profile.photos?.[0]?.value;

      if (!email) return done(new Error("No email from Google"), false);

      let user = await storage.getUserByEmail(email);

      if (!user) {
        user = await storage.createUser({
          id: generateUserId(),
          email,
          firstName,
          lastName,
          profileImageUrl,
        });
      }

      done(null, user);
    } catch (error) {
      done(error);
    }
  }
));
