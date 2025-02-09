const express = require("express");
const { MongoClient, ObjectId } = require("mongodb")
const app = express();

app.use(express.json())
let db;
const client = new MongoClient("mongodb://localhost:27017");
client.connect().then(() => {
    db = client.db("ecommerce");
    console.log("MongoDB connected");
}).catch((err) => {
    console.log("MongoDB unconnect");
});


// ดึงข้อมูลทั้งหมด
app.get('/product', async (req, res) => {
    try {
        const product = await db.collection("product").find().toArray();
        res.json(product);
    } catch (err) {
        res.json("error");
    }
});

app.get('/product/topping/:topping', async (req, res) => {
    try {
        const topping = req.params.topping;
        const product = await db.collection("product").find({
            "topping": { $in: [{ "name": topping }] }
        }).toArray();
        res.json(product);
    } catch (err) {
        res.json("error");
    }
});
//ดึงข้อมูลที่มีราคามากกว่า 35
app.get('/product/expensive', async (req, res) => {
    try {
        const products = await db.collection("product").find({ price: { $gt: 35 } }).toArray();
        res.json(products);
    } catch (err) {
        res.json("error");
    }
});

// ดึงข้อมูลรายการนั้น
app.get('/product/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await db.collection("product").findOne({
            "_id": new ObjectId(id)
        });
        res.json(product);
    } catch (err) {
        res.json("error");
    }
});

// เพิ่มข้อมูลใหม่
app.post('/product', async (req, res) => {
    try {
        const data = req.body;
        const product = await db.collection("product").insertOne(data);
        res.json(product);
    } catch (err) {
        res.json("error");
    }
});

// แก้ไขข้อมูล
app.put('/product/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const product = await db.collection("product").updateOne({
            "_id": new ObjectId(id)
        }, {
            $set: data
        });
        res.json(product);
    } catch (err) {
        res.json("error");
    }
});
// ลบข้อมูลรายการนั้น 
app.delete('/product/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const result = await db.collection("product").deleteOne({
            "_id": new ObjectId(id)
        });
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting product", error: err });
    }
});

app.listen(3000, () => {
    console.log('Server started: success');
});