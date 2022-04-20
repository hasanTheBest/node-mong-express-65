const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const req = require("express/lib/request");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// mongo db connect
const uri =
  "mongodb+srv://mangodbmh:<password>@cluster0.snlol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// run database
async function runDB() {
  try {
    await client.connect();

    const userCollection = client.db("mongoUserDB").collection("users");

    // create a user
    app.post("/user", async (req, res) => {
      const result = await userCollection.insertOne(req.body);
      res.send(result);
      console.log("user added and ID is ", result.insertedId);
    });

    // read the users
    app.get("/user", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const data = await cursor.toArray();

      res.send(data);
    });

    // read a user
    app.get("/user/:id", async (req, res) => {
      const { id } = req.params;

      // find from db
      const query = { _id: ObjectId(id) };
      const data = await userCollection.findOne(query);
      res.send(data);
    });

    // update a user
    app.put("/user/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const upsertUser = { $set: req.body };

      console.log(id, req.body);

      const result = await userCollection.updateOne(
        filter,
        upsertUser,
        options
      );

      res.send(result);
    });

    // delete a user
    app.delete("/user/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);

      if (result.deletedCount > 0) {
        res.send(result);
      } else {
        res.send({ error: "No item is deleted." });
      }
    });
  } finally {
    // await client.close();
  }
}

runDB().catch(console.dir);

// just to check server is running at port 5000
app.get("/", (req, res) => {
  res.send("Node mongo server is running...");
});

app.listen(port, () => console.log("app listening at port", port));
