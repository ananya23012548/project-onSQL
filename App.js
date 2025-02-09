require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// ใช้ค่าจาก .env
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "school";

let db;
const client = new MongoClient(MONGO_URI);
client.connect().then(() => {
    db = client.db(DB_NAME);
    console.log("MongoDB connected");
}).catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
});

// 📌 GET - ดึงข้อมูลนักศึกษา
app.get("/students", async (req, res) => {
    try {
        const students = await db.collection("students").find().toArray();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: "Error fetching students", error: err });
    }
});

// 📌 GET - ค้นหานักศึกษาด้วยชื่อ (ไทย & อังกฤษ)
app.get("/students/search/:name", async (req, res) => {
    try {
        const search = req.params.name;
        const students = await db.collection("students").find({
            $or: [
                { "name": new RegExp(search, "i") },
                { "Eng-Name": new RegExp(search, "i") }
            ]
        }).toArray();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: "Error searching students", error: err });
    }
});

// 📌 GET - ดึงข้อมูลนักศึกษารายคน
app.get("/students/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const student = await db.collection("students").findOne({
            "_id": new ObjectId(id)
        });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: "Error fetching student", error: err });
    }
});

// 📌 POST - เพิ่มนักศึกษา
app.post("/students", async (req, res) => {
    try {
        const data = req.body;
        const result = await db.collection("students").insertOne(data);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Error adding student", error: err });
    }
});

// 📌 PUT - แก้ไขข้อมูลนักศึกษา
app.put("/students/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await db.collection("students").updateOne(
            { "_id": new ObjectId(id) },
            { $set: data }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Error updating student", error: err });
    }
});

// 📌 DELETE - ลบนักศึกษา
app.delete("/students/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.collection("students").deleteOne({
            "_id": new ObjectId(id)
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Error deleting student", error: err });
    }
});

// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});