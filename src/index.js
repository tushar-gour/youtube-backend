// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env",
})

connectDB()





























// OLD APPROACH

// import express from "express";
// const App = express()

// ;(async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        
//         App.on("error", (error) => {
//             console.log("Error: ", error)
//             throw error
//         })

//         App.listen(process.env.PORT, () => {
//             console.log(`App is listening on ${process.env.PORT}`)
//         })

//     } catch (error) {
//         console.log(error)
//         throw error
//     }
// })