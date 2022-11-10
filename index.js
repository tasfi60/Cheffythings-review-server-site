const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middle wares
app.use(cors());
app.use(express.json());


console.log(process.env.DB_USER)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.idbesa6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'unauthorized access'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err,decoded){
    if(err){
      return res.status(401).send({message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();
})
}


async function run(){
    try{
          const serviceCollection = client.db('cheffythings').collection('services');

          const reviewCollection = client.db('cheffythings').collection('reviews');

          //JWT TOKEN
          app.post('/jwt',(req,res) =>{
            const user = req.body;
            const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'})
            res.send({token})
          })

          app.get('/homeservices',async(req,res) => {
          
            //  const query = {};
             const cursor = serviceCollection.find({}).sort({_id:-1}).limit(3);
             const services = await cursor.toArray();
             res.send(services);
             
        });
          app.get('/services',async(req,res) => {
            
             const query = {};
             const cursor = serviceCollection.find(query);
             const services = await cursor.toArray();
             res.send(services);
           
        });
          app.get('/services/:id',async(req,res) => {
            
             const id = req.params.id;
             const query = {_id: ObjectId(id)};
             const service = await serviceCollection.findOne(query);
             res.send(service);
             
        });

        //review api

        app.get('/review',async(req,res) => {
            
          let query = {}
          if(req.query.service){
            query = {
                 service: req.query.service
            }
          }
          const cursor = reviewCollection.find(query).sort ( { date: -1 } );
          const reviews = await cursor.toArray();
          res.send(reviews);
     });

     app.get('/review',verifyJWT, async(req,res) => {
      const decoded = req.decoded;
      if(decoded.email !== req.query.email){
        res.status(403).send({message: 'unauthorized acces'})
      }
      
      let query = {};
      if(req.query.email){
        query = {
             email: req.query.email
        }
      }   
      
      const cursor = reviewCollection.find(query);
      const myreview = await cursor.toArray();
      res.send( myreview);
    
         });

          app.delete('/review/:id',async(req,res) =>{
              const id = req.params.id;
              const query = {_id: ObjectId(id)};
              const result = await reviewCollection.deleteOne(query);
              res.send(result);
              console.log('trying to delete',id);
          }); 

          app.put('/review/:id',async(req,res) =>{
              const id = req.params.id;
              const filter = {_id: ObjectId(id)};
              const user = req.body;
              const option = {upsert: true};
              const Updateduser = {
                $set: {
                  name: user.name,
                  email: user.email,
                  message: user.message
                }
              }
              const result = await reviewCollection.updateOne(filter,Updateduser,option);
              res.send(result);

          })


          app.get('/review/:id',async(req,res) =>{
              const id = req.params.id;
              const query = {_id: ObjectId(id)};  
              const result = await reviewCollection.findOne(query);
              res.send(result);

          }); 



          app.post('/review', async(req,res) =>{
            const review =  req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result); 
          })

          app.post('/services', async(req,res) =>{
            const service =  req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result); 
          })

         
    }
    finally{

    }

}

run().catch(err => console.error(err));


app.get('/',(req,res) => {
    res.send('Simple node Server is Running');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




