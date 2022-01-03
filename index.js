const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload')

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000; 

//Middlewere 
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qhwuq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('MBA-Task'); 
        const postCollection = database.collection('posts')

        //Get API 
        app.get('/posts', async(req, res)=>{
            const cursor = postCollection.find();
            const posts = await cursor.toArray();
            res.json(posts)
        })

        //Get Post by user
        app.get('/posts/:email', async(req, res)=>{
            const email = req.query.email;
            const query = {email: email}
            const cursor = postCollection.find(query);
            const posts = await cursor.toArray();
            res.json(posts)
        })

        // Get Post by Id
        app.get('/post/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const post = await postCollection.findOne(query);
            res.json(post);
        })

        //Post Method for store user post
        app.post('/posts', async(req, res)=>{
            const title = req.body.title;
            const des = req.body.des;
            const email = req.body.email;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const picBuffer = Buffer.from(encodedPic, 'base64');
            const post = {
                email,
                title,
                des,
                image:picBuffer
            }
            const result = await postCollection.insertOne(post)
            res.json(result)
        })


        //Update API for update post 

        app.put('/posts/:id', async (req, res)=>{
            const id = req.params.id;
            const updatePost = req.body
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const picBuffer = Buffer.from(encodedPic, 'base64');
            const query = {_id: ObjectId(id)};
            const options = {upsert : true}
            const updateDoc = {
                $set:{
                    title: updatePost.title,
                    des: updatePost.des,
                    image: picBuffer
                }
            }
            const result = await postCollection.updateOne(query, updateDoc, options )
            res.json(result)
        })
    }
    finally{
        // await client.close()
    }
}

run().catch(console.dir)

app.get('/', (req, res)=>{
    res.send('Running MBA Server');
})

app.listen(port, ()=>{
    console.log('Running MBA Server on port', port)
})