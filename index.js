require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.port || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nh8g7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const allUsers = client.db('TaskMan').collection('UsersData');

    const allTasks = client.db('TaskMan').collection('TasksDB');

    // const allClassesDB = client.db('TaskMan').collection('AllClassesDB');

    // const allTestimony = client.db('TaskMan').collection('ReviewDB');

    // const allForums = client.db('TaskMan').collection('CommunityDB');

   



    app.post('/users', async(req, res) =>{
      const user = req.body;

      const query = {email : user.email}
      const existuser = await allUsers.findOne(query)
      if (existuser) {
        return res.send({message: 'user exists', insertedId:null})
      }
      const result = await allUsers.insertOne(user);
      res.send(result);
      console.log(result)
    })
    
    app.post('/alltasks', async(req, res) =>{
      const alltasks = req.body;
      const result = await allTasks.insertOne(alltasks);
      res.send(result);
      console.log(result)
    })



    app.get('/allTasks/:id', async (req, res) => {
        const taskId = req.params.id;
      
        try {
          const client = new MongoClient(process.env.MONGODB_URI);
          await client.connect();
          const db = client.db('TaskMan');
          const collection = db.collection('TasksDB'); // Use the correct collection name
      
          const objectId = new ObjectId(taskId);
      
          const task = await collection.findOne({ _id: objectId });
      
          if (!task) {
            return res.status(404).json({ message: "Task not found" });
          }
      
          res.status(200).json(task);
        } catch (error) {
          console.error("Error fetching task:", error);
          res.status(500).json({ error: 'Failed to fetch task' });
        } finally {
          await client.close();
        }
      });



      app.patch('/alltasks/:id', async (req, res) => {
        const taskId = req.params.id;
        const updateData = req.body;
      
        try {
          const client = new MongoClient(process.env.MONGODB_URI);
          await client.connect();
          const db = client.db('your_database_name'); // Or 'TaskMan' if that's your DB name
          const collection = db.collection('TasksDB'); // Use the correct collection name: TasksDB
      
          const objectId = new ObjectId(taskId);
      
          const updateResult = await collection.updateOne(
            { _id: objectId },
            { $set: updateData }
          );
      
          if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ message: "Task not found" });
          }
      
          const updatedTask = await collection.findOne({ _id: objectId });
      
          res.status(200).json(updatedTask);
        } catch (error) {
          console.error("Error updating task:", error);
          res.status(500).json({ error: 'Failed to update task' });
        } finally {
          await client.close();
        }
      });


    // app.post('/newsletters', async(req, res) =>{
    //   const newsletters = req.body;
    //   const result = await allnewsletters.insertOne(newsletters);
    //   res.send(result);
    //   console.log(result)
    // })
    // app.post('/newtrainer', async(req, res) =>{
    //   const Trainer = req.body;
    //   const result = await newtrainer.insertOne(Trainer);
    //   res.send(result);
    //   console.log(result)
    // })
    // app.post('/newclass', async(req, res) =>{
    //   const newClass = req.body;
    //   const result = await allClassesDB.insertOne(newClass);
    //   res.send(result);
    //   console.log(result)
    // })
    app.post('/newforum', async(req, res) =>{
      const newForum = req.body;
      const result = await allForums.insertOne(newForum);
      res.send(result);
      console.log(result)
    })
    app.post('/paymenthistory', async(req, res) =>{
      const PayHistory = req.body;
      const result = await paymentHistory.insertOne(PayHistory);
      const query = {_id: {
        $in: PayHistory.BookedTrainerID.map(id => new ObjectId(id))
      }};
      const deleteR = await allBookings.deleteMany(query)
      console.log(PayHistory, deleteR)
      res.send({result, deleteR});
    })
    
    app.post('/promotetrainer', async (req, res) => {
      try {
        const { trainerEmail } = req.body;
    
        console.log(trainerEmail);
    
        // Find the applied trainer in the newtrainer collection
        const appliedTrainer = await newtrainer.findOne({ email: trainerEmail });
        console.log(appliedTrainer);
    
        if (!appliedTrainer) {
          return res.status(404).json({ message: 'Applied trainer not found' });
        }
    
        // Find user in allUsers collection
        const user = await allUsers.findOne({ email: trainerEmail });
        console.log(user);
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Update user's role to 'trainer' (replace 'applied' with your desired role)
        const updateResult = await allUsers.updateOne(
          { _id: user._id },
          { $set: { role: 'trainer' } } // Set role to 'trainer'
        );
        console.log(updateResult);
    
        // Optionally, delete the applied trainer document
        const deleteResult = await newtrainer.deleteOne({ _id: appliedTrainer._id });
        console.log(deleteResult);
    
        // Insert applied trainer data into TrainerDB (assuming it has the same structure)
        const insertResult = await allTrainers.insertOne(appliedTrainer);
        console.log(insertResult);
    
        res.status(200).json({ message: 'Trainer promoted successfully' });
      } catch (error) {
        console.error('Error promoting trainer:', error);
        res.status(500).json({ message: 'Server Error' });
      }
    });
    
    
    
    
    app.get('/onepaymentHistory', async(req, res) =>{
      const email = req.query.email;
      const query = {email : email}
      const result = await paymentHistory.find(query).toArray();
      res.send(result);
    })
    app.get('/paymentHistory', async(req, res) =>{
      const result = await paymentHistory.find().toArray();
      res.send(result);
    })
    app.get('/allpay', async(req, res) =>{
      const result = await paymentHistory.aggregate([
        {
          $group: {
            _id: '_id',
            quantitity:{$sum: 1},
            revenue: {$sum: '$price'}
          }
        }
      ]).toArray();
      res.send(result);
    })
    app.get('/appliedtrainer', async(req, res) =>{
      const result = await newtrainer.find().toArray();
      res.send(result);
    })
    app.get('/allUsers', async(req, res) =>{
      const result = await allUsers.find().toArray();
      res.send(result);
    })


    app.get('/allTasks', async(req, res) =>{
      const result = await allTasks.find().toArray();
      res.send(result);
    })


    app.get('/newsletters', async(req, res) =>{
      const result = await allnewsletters.find().toArray();
      res.send(result);
    })

    app.get('/allFeatures', async(req, res) =>{
      const result = await allFeatures.find().toArray();
      res.send(result);
    })
    app.get('/allTrainers', async(req, res) =>{
        const result = await allTrainers.find().toArray();
        res.send(result);
    })
    app.get('/allClasses', async(req, res) =>{
        const result = await allClassesDB.find().toArray();
        res.send(result);
    })
    app.get('/allBookedTrainer', async(req, res) =>{
      const cursor = allBookings
      .find()
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/BookedTrainer', async(req, res) =>{
        const email = req.query.email;
        const query = {email : email}
        const cursor = allBookings
        .find(query)
        const result = await cursor.toArray();
        res.send(result);
      });
      app.get('/auser', async(req, res) =>{
        const email = req.query.email;
        const query = {email : email}
        const cursor = allUsers
        .find(query)
        const result = await cursor.toArray();
        res.send(result);
      });
      
      app.get('/aTrainer', async(req, res) =>{
        const email = req.query.email;
        const query = {email : email}

        const cursor = allTrainers
        .find(query)
        const result = await cursor.toArray();

        res.send(result);
    })
    app.get('/allTestimony', async(req, res) =>{
        const result = await allTestimony.find().sort({ _id: -1 }).toArray();
        res.send(result);
    })
    app.get('/allForums', async(req, res) =>{
        const result = await allForums.find().toArray();
        res.send(result);
    })
    app.put('/allTrainers/:trainerId/availableSlot', async (req, res) => {
      try {
        const trainerId = req.params.trainerId;
        const { availableSlot } = req.body; 

        // Validate input (optional)
        if (!trainerId || !Array.isArray(availableSlot)) {
          return res.status(400).json({ message: 'Missing or invalid data' });
        }

        const result = await allTrainers.updateOne(
          { _id: new ObjectId(trainerId) },
          { $set: { availableSlot: availableSlot } } 
        );

        if (result.modifiedCount === 1) {
          res.json({ message: 'Slot updated successfully' });
        } else {
          res.status(404).json({ message: 'Trainer not found' });
        }
      } catch (error) {
        console.error('Error updating available slots:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    app.delete('/allTrainers/:trainerId/availableSlot/:slot', async (req, res) => {
      try {
        const trainerId = req.params.trainerId;
        const slotToDelete = req.params.slot;

        // Validate input (optional)
        if (!trainerId || !slotToDelete) {
          return res.status(400).json({ message: 'Missing or invalid data' });
        }

        const result = await allTrainers.updateOne(
          { _id: new ObjectId(trainerId) },
          { $pull: { availableSlot: slotToDelete } } 
        );

        if (result.modifiedCount === 1) {
          res.json({ message: 'Slot deleted successfully' });
        } else {
          res.status(404).json({ message: 'Slot not found or trainer not found' }); 
        }
      } catch (error) {
        console.error('Error deleting slot:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    
    app.get('/allTrainers/:id', async (req, res) => {
        const id = req.params.id;
      
        try {
          const result = await allTrainers.findOne({ _id: new ObjectId(id) });
          if (!result) {
            return res.status(404).send({ message: 'Trainer not found' });
          }
          res.send(result);
        } catch (error) {
          console.error('Error fetching Trainer:', error);
          res.status(500).send({ message: 'Internal server error' });
        }
      });
    app.get('/topTrainers', async (req, res) => {
        try {
          const topTrainers = await allTrainers.aggregate([
            { $sort: { bookedCount: -1 } },
            { $limit: 3 }
          ]).toArray();
          res.json(topTrainers);
        } catch (err) {
          console.error('Error fetching top trainers:', err);
          res.status(500).json({ error: 'Failed to fetch top trainers' });
        }
    });

    app.get('/popularClasses', async(req, res) =>{
        const cursor = allClassesDB
        .find() // Filter for drafts
        .sort({ _id: -1 }) // Sort by _id (latest first)
        .limit(6); // Limit to the latest 6 documents
        const result = await cursor.toArray();
        res.send(result);
      })
    app.get('/LatestForums', async(req, res) =>{
        const cursor = allForums
        .find() // Filter for drafts
        .sort({ _id: -1 }) // Sort by _id (latest first)
        .limit(6); // Limit to the latest 6 documents
        const result = await cursor.toArray();
        res.send(result);
    }) 
    app.get('/allForums/:id', async (req, res) => {
        const id = req.params.id;
      
        try {
          const result = await allForums.findOne({ _id: new ObjectId(id) });
          if (!result) {
            return res.status(404).send({ message: 'Trainer not found' });
          }
          res.send(result);
        } catch (error) {
          console.error('Error fetching Trainer:', error);
          res.status(500).send({ message: 'Internal server error' });
        }
      });

    //   Payment Intent
    app.post('/create-payment-intent', async(req,res) => {
        const {price} = req.body;
        const amount = parseInt(price*100);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency : 'usd',
            payment_method_types: ['card']
        })
        res.send({
            clientSecret: paymentIntent.client_secret
        })
    }
)
app.post('/BookedTrainer', async(req, res) =>{
    const newBooking = req.body;
    console.log(newBooking)
    const result = await allBookings.insertOne(newBooking);
    res.send(result);
    console.log(result)
  })
  app.delete('/trainers/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Find and delete the trainer from the database
      const deletedTrainer = await allTrainers.deleteOne({ _id: new ObjectId(id) });

      if (!deletedTrainer.deletedCount) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      res.status(200).json({ message: 'Trainer deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  app.delete('/appliedtrainer/:trainerId', async (req, res) => {
    try {
      const trainerId = req.params.trainerId;

      // Find the trainer by ID
      const trainer = await newtrainer.findOne({ _id: new ObjectId(trainerId) });

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      // Delete the trainer from the newtrainer collection
      const deleteResult = await newtrainer.deleteOne({ _id: new ObjectId(trainerId) });

      if (deleteResult.deletedCount === 0) {
        return res.status(500).json({ message: 'Failed to delete trainer' });
      }

      // Send success response
      res.status(200).json({ message: 'Trainer deleted successfully' });
    } catch (error) {
      console.error('Error deleting trainer:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected TaskMan to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send(`TaskMan Server Is Running Successfully at port: ${port}`)
})

app.listen(
    port,() => {
      console.log(`TaskMan Server Is Running at port: ${port}`)  
    }
)
