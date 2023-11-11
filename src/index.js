import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({
    path: "./.env",
});

connectDB();

/** 
import express from "express";
const app = express();
(async () => {
    try {
        console.log(
            "process.env.MONGODB_URI -- ",
            process.env.MONGODB_URI,
            DB_NAME
        );
        const connectionInstanse = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        console.log("connectionInstanse -> ", connectionInstanse);
        app.on("error", () => {
            console.log("App is not able to talk with database");
        });
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port : ${process.env.PORT}`);
        });
    } catch (error) {
        console.log("Error connecting databse ", error);
    }
})();
*/
