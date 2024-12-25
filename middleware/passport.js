import GoogleStrategy from "passport-google-oauth20";

GoogleStrategy.Strategy();
import passport from "passport";
import { database } from "../db/db.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
   async function (profile, done) {
      try {
        const { id, email, displayName } = profile;
        const emails = email[0]?.value;

        const [userCheck] = await database.query(
          `SELECT * FROM users WHERE google_id = ? OR emails =?`,

          [id, emails]
        );

        if (userCheck.length === 0) {
          const [response] = await  database.query(
            `INSERT INTO users (google_id, email, displayName) VALUES (?,?,?)`,

            [id, emails, displayName]
          );

          const newUser = {
            id: response.insertId,
            goggle_id: id,
            emails,
            displayName,
          };

          return done(null, newUser);
        }

        return done(null, userCheck[0])
      } catch (error) {
        console.log(error)
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async(user, done) => {
   try {
    const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    done(null, user[0]);
   } catch (error) {
    console.log(error)
   }
});
