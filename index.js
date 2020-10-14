const express = require("express");

const port = 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jolmh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", function (req, res) {
  res.send("Creative agency working !");
});

const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true, });
client.connect(err => {
  const ServiceCollection = client.db(process.env.DB_NAME).collection("services");
  console.log('database connection successfully');
  
 
});

app.listen(process.env.PORT || port);