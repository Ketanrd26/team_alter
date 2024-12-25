import mysql from "mysql2/promise.js";
import dotenv from "dotenv";

dotenv.config()

const database = mysql.createPool({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});


const checkDatabase = async ()=>{
    try {
        const connection = await database.getConnection();
        console.log("database connecetted sucessfully");
        connection.release();
    } catch (error) {
        console.log(error)
    }
}

export {database, checkDatabase}