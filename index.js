const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWAORD}@cluster0.cc39d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Guitar_Factory");
    const guitarCollection = database.collection("guitars");
    const purchaserCollection = database.collection("purchaser");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");

    // get all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.json(result);
    });
    // post reviews
    app.post("/reviews", async (req, res) => {
      const result = await reviewsCollection.insertOne(req.body);
      res.json(result);
    });
    // get all guitar
    app.get("/guitars", async (req, res) => {
      const result = await guitarCollection.find({}).toArray();
      res.json(result);
    });
    // add manual products
    app.post("/guitars", async (req, res) => {
      const products = req.body;
      const result = await guitarCollection.insertOne(products);
      console.log(result);
      res.json(result);
    });

    // make An Admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // Receive Orders
    app.put("/statusUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const newStatus = req.body;
      const filter = { _id: ObjectId(req.params.id) };
      const options = { upsert: true };
      const updateStatus = {
        $set: {
          status: newStatus[0],
        },
      };
      const result = await purchaserCollection.updateOne(
        filter,
        updateStatus,
        options
      );
      res.json(result);
    });
    // find admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    // save purchaser info
    app.post("/purchaser", async (req, res) => {
      const purchase = req.body;
      const result = await purchaserCollection.insertOne(purchase);
      console.log(result);
      res.json(result);
    });

    // get purchaser info by email
    app.get("/purchaser", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };

      const cursor = await purchaserCollection.find(query).toArray();
      res.json(cursor);
    });
    // get purchaser info
    app.get("/orders", async (req, res) => {
      const result = await purchaserCollection.find({}).toArray();
      res.json(result);
    });
    // post an user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // update user
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
    });
    // cancel order
    app.delete("/cancelOrder/:id", (req, res) => {
      console.log(req.params.id);

      purchaserCollection
        .deleteOne({ _id: ObjectId(req.params.id) })
        .then((result) => {
          res.send(result);
        });
    });

    // delete product
    app.delete("/deleteProduct/:id", (req, res) => {
      console.log(req.params.id);

      guitarCollection
        .deleteOne({ _id: ObjectId(req.params.id) })
        .then((result) => {
          res.send(result);
        });
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("My server running at", port);
});
