import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { checkDatabase } from "./db/db.js";
import passport from "passport";
import createAllTable from "./tabels/tables.js";
import cookieSession from "cookie-session";
import { user } from "./routes/userRoute.js";
import { routeUrl } from "./routes/urlRoute.js";

dotenv.config()
const app = express(); //call express in app vareiable

const server = process.env.SERVER
try {
    http.createServer(app).listen(server); 
    console.log("server created");
    
} catch (error) {
    console.log(error)
}
app.use(
	cookieSession({
		name: "session",
		keys: ["cyberwolve"],
		maxAge: 24 * 60 * 60 * 100,
	})
);
app.use(express.json()); //convert is json data;

app.use(cors());

app.use(passport.initialize());
app.use(passport.session())

app.get("/", (req,res)=>{
    try {
        res.send("hello world")
    } catch (error) {
        res.send(error)
    }
});

app.use("/user", user);

app.use("/api", routeUrl)

try {
    await checkDatabase();
    await createAllTable()
} catch (error) {
    console.log(error)
}