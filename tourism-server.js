const { MongoClient } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// connection to mongodb

// const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS}@cluster0.tx5hg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const uri = `mongodb+srv://tourism:OuM7iIgBMf2JT4Vk@cluster0.tx5hg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();

    const database = client.db("tourism");
    const tourCollection = database.collection("tours");
    const bookingCollection = database.collection("bookings");

    // creating a tour api
    app.post("/tours", async (req, res) => {
      const newTour = req.body;

      const result = await tourCollection.insertOne(newTour);
      res.json(result);
    });

    // get api for read all tours
    app.get("/tours", async (req, res) => {
      const cursor = tourCollection.find({});
      const tours = await cursor.toArray();
      res.json(tours);
    });

    // api for getting specific tour by id
    app.get("/tours/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const tour = await tourCollection.findOne(query);
      res.json(tour);
    });

    // api for bookings

    // creating api for inserting a new booking
    app.post("/bookings", async (req, res) => {
      const newBooking = req.body;
      const result = await bookingCollection.insertOne(newBooking);

      res.json(result);
    });

    // getting all bookings api
    app.get("/bookings", async (req, res) => {
      const cursor = bookingCollection.find({});
      const bookings = await cursor.toArray();
      res.json(bookings);
    });

    // getting a specific booking by id
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bookingCollection.findOne(query);
      res.json(booking);
    });

    // getting multiple bookings by filtering email
    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: { $in: email } };

      const cursor = bookingCollection.find(query);
      const bookings = await cursor.toArray();
      res.json(bookings);
    });

    // update the status of a booking
    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBooking = req.body;
      const filter = { _id: ObjectId(id) };

      const options = { upsert: true };
      // create a document that sets the status of the bookingCollection
      const updateDoc = {
        $set: {
          status: updatedBooking.status,
        },
      };

      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // api for delete a booking

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

// get api for home route

app.get("/", (req, res) => {
  res.send("Hello from tourism node server");
});

app.listen(port, () => {
  console.log("listening to port : ", port);
});
