require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ตรวจสอบค่าใน .env
if (!process.env.MONGO_URI || !process.env.DB_NAME) {
    console.error("Missing MONGO_URI or DB_NAME in .env file");
    process.exit(1);
}
console.log(process.env.MONGO_URI);  // ตรวจสอบค่าที่โหลดมาจาก .env
console.log(process.env.DB_NAME);
// เชื่อมต่อ MongoDB
const mongoURI = `${process.env.MONGO_URI}/${process.env.DB_NAME}`;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);  // หยุดการทำงานหากเชื่อมต่อ MongoDB ไม่สำเร็จ
    });

// สร้าง Schema ของ `stdhistory`
const studentSchema = new mongoose.Schema({
    ID: Number,
    Fname: String,
    Name: String,
    "Eng-Name": String,
    School: String,
    "Degree name": String
});

const Student = mongoose.model("stdhistory", studentSchema, "stdhistory");

// 📌 GET - ดึงข้อมูลนักศึกษา
app.get("/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: "Error fetching students", error: err });
    }
});

// 📌 POST - เพิ่มนักศึกษา
app.post("/students", async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: "Error saving student", error: err });
    }
});

// 📌 PUT - แก้ไขข้อมูลนักศึกษา
app.put("/students/:id", async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: "Updated Successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating student", error: err });
    }
});

// 📌 DELETE - ลบนักศึกษา
app.delete("/students/:id", async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting student", error: err });
    }
});

// 📌 GET - ค้นหานักศึกษาด้วยชื่อ (ไทย & อังกฤษ)
app.get("/students/search/:name", async (req, res) => {
    try {
        const students = await Student.find({
            $or: [
                { Name: new RegExp(req.params.name, "i") },
                { "Eng-Name": new RegExp(req.params.name, "i") }
            ]
        });
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: "Error searching students", error: err });
    }
});


// เริ่มรันเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
