const express = require("express");

const port = 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jolmh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
/* app.use(express.static("services")); */
app.use(fileUpload());

// default / root
app.get("/", function (req, res) {
  res.send("Creative agency working !");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const serviceCollection = client
    .db(process.env.DB_NAME)
    .collection("services");
  const feedbackCollection = client
    .db(process.env.DB_NAME)
    .collection("UserReviews");
  const OrderCollection = client.db(process.env.DB_NAME).collection("orders");

  // create and add new service part

  app.post("/addServices", (req, res) => {
    const file = req.files.file;
    /*  const fileType = file.mimetype; */
    /* const fileSize = file.size; */
    const serviceData = req.body;
    const fileData = file.data;
    const encFile = fileData.toString("base64");

    const convertedFile = {
      contentType: file.mimetype,
      size: parseFloat(file.size),
      img: Buffer.from(encFile, "base64"),
    };
    const FinalData = {
      title: serviceData.title,
      description: serviceData.description,
      file: convertedFile,
    };

    serviceCollection
      .insertOne(FinalData)
      .then((result) => {
        if (result.insertedCount > 0) {
          res.sendStatus(200);
        }
      })
      .catch((err) => console.log(err));
  });

  //service data
  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //User feedback load to  database
  app.post("/addFeedback", (req, res) => {
    const feedback = req.body;
    console.log(feedback);
    feedbackCollection.insertOne(feedback).then((result) => {
      console.log(result);
      res.send(result);
    });
  });

  app.get("/feedback", (req, res) => {
    feedbackCollection.find({}).toArray((err, documents) => {
      res.send(documents);
      if (err) {
        console.log(err);
      }
    });
  });

  //
  //add orders by customer
  // for add order
  app.post("/addOrder", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const title = req.body.title;
    const file = req.files.file;
    const details = req.body.details;
    const price = req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString("base64");
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, "base64"),
    };
    OrderCollection.insertOne({
      name,
      email,
      title,
      details,
      price,
      image,
    }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/orders", (req, res) => {
    OrderCollection.find({}).toArray((error, documents) => {
      res.send(documents);
    });
  });

  app.get("/orderedList", (req, res) => {
    OrderCollection.find({ email: req.query.email }).toArray(
      (error, documents) => {
        res.send(documents);
      }
    );
  });
});

app.listen(process.env.PORT || port);
