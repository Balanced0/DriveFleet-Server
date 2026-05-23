const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
dotenv.config();
const port = process.env.PORT;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGO_URI;
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("DriveFleet");
    const carsCollection = db.collection("cars");

    app.post("/cars", async (req, res) => {
      const carData = req.body;
      const result = await carsCollection.insertOne(carData);
      res.json(result);
    });
    app.get("/cars", async (req, res) => {
      const result = await carsCollection.find().toArray();
      res.json(result);
    });
    app.get("/cars/:userId", async (req, res) => {
      const { userId } = req.params;
      const result = await carsCollection.find({ userId }).toArray();
      res.json(result);
    });
    app.patch("/cars/:id", async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;

      const result = await carsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );

      res.json(result);
    });
    app.delete("/cars/:id", async (req, res) => {
      const { id } = req.params;
      const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    app.get("/cars/detail/:id", async (req, res) => {
      const { id } = req.params;
      const result = await carsCollection.findOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    const bookingCollection = db.collection("booking");
    app.post("/booking", async (req, res) => {
      const bookingData = req.body;
      const exist = await bookingCollection.findOne({
        userId: bookingData.userId,
        carName: bookingData.carName,
      });
      if (exist) {
        return res
          .status(400)
          .json({ message: "You have already booked this car" });
      }
      const result = await bookingCollection.insertOne(bookingData);
      res.json(result);
    });
    app.get("/booking/:userId", async (req, res) => {
      const { userId } = req.params;
      const result = await bookingCollection.find({ userId }).toArray();
      res.json(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("DriveFleet").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
