const express = require("express");

const port = 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
const fs=require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jolmh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
/* app.use(express.static("services")); */
app.use(fileUpload());

app.get("/", function (req, res) {
  res.send("Creative agency working !");
});

const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true, });
client.connect(err => {
  const serviceCollection = client.db(process.env.DB_NAME).collection("services");
  

// create and add new service part
   //add services
   app.post('/addServices', (req, res) => {
    const file = req.files.file;
   /*  const fileType = file.mimetype; */
    /* const fileSize = file.size; */
    const serviceData = req.body;
    const fileData = file.data;
    const encFile = fileData.toString('base64');

    const convertedFile = {
        contentType: file.mimetype,
        size: parseFloat(file.size),
        img: Buffer.from(encFile, 'base64')
    };
    const FinalData = { title: serviceData.title, description: serviceData.description, file: convertedFile }

    serviceCollection.insertOne(FinalData)
        .then(result => {
            if (result.insertedCount > 0) {
                res.sendStatus(200);
            }
        })
        .catch(err => console.log(err))
});





//service data 
app.get('/services',(req,res) =>{
  serviceCollection.find({})
  .toArray((err,documents)=>{
    res.send(documents)
  })
})

 
});

app.listen(process.env.PORT || port);