import { database } from "../db/db.js";


const userTable = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(400) NOT NULL,
    email VARCHAR(300) NOT NULL UNIQUE,
    displayName VARCHAR(400) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`

const urlTable = `CREATE TABLE IF NOT EXISTS url(
    id INT AUTO_INCREMENT PRIMARY KEY,
    longUrl VARCHAR(500) NOT NULL,
    customAlias  VARCHAR(400) NOT NULL,
    topic VARCHAR(400) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const analyticsTable = `CREATE TABLE IF NOT EXISTS url_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customAlias VARCHAR(400) NOT NULL,
    clickDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    osType VARCHAR(100),
    deviceType VARCHAR(100),
    ipAddress VARCHAR(45) NOT NULL
);
`

const createTable = async (tablename, query )=>{
    try {
        await database.query(query);
        console.log(`${tablename} table created successfully`);
    } catch (error) {
        console.log(`Error creating ${tablename}`, error);
    }
}

const createAllTable = async ()=>{
    try {
        await createTable("users",userTable );
        await createTable("url",urlTable );
        await createTable("analytics",analyticsTable );
        console.log("table created successfully")
    } catch (error) {
        console.log(error)
    }
}

export default createAllTable