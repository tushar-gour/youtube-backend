// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env",
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`server running at port : ${process.env.PORT}`);
        });

        app.on("error", (error) => {
            console.log("Error: ", error);
            throw error;
        });
    })
    .catch((error) => {
        console.log("DB connection failed ", error);
    });
