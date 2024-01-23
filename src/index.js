import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { configureCloudinary } from "./utils/cloudinary.js";

configureCloudinary();
connectDB()
    .then(() => {
        const port = process.env.PORT || 8000;
        app.on("error", () => {
            console.log(`App is unable to communicate with database`);
        });
        app.listen(port, () => {
            console.log(`App is listennig at port : ${port}`);
        });
    })
    .catch((error) => {
        console.log("Mongodb connection failed !!! ", error);
    });

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
