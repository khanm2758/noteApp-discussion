const express = require('express');
const app = express();
const {MongoClient, ObjectId} = require('mongodb')
const layout = require('express-ejs-layouts')
const pass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;
const dbUserName = process.env.DB_USERNAME;
const port = process.env.DB_PORT;
let db;

// ============================
// Configuration start
// ============================

// mongodb configuration

async function dbConnection(){
    const client = new MongoClient(`mongodb+srv://${dbUserName}:${pass}@cluster.ytiwmnz.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster`)
      await client.connect()
    console.log('mongodb connected')
   db = client.db()
}
dbConnection()

app.use(express.urlencoded({extended:true}))
app.set('view engine', 'ejs')
app.use(layout)


// ============================
// Configuration finished
// ============================

// ============================
// Routes
// ============================


// Route: home (views/index.ejs)
app.get('/', function(req, res){

    res.render('index')
})

// Route: login button (views/index.ejs)
app.get('/login', function(req, res){

    res.render('user/login')
})

// Route: Main interface of note app (notes/index.ejs)
app.get('/mainInterface', async function(req, res){

   const noteItems = await db.collection("todoItems").find().toArray()

    res.render('notes/index', {items: noteItems})
})

// Route: login button (user/login.ejs)
app.post('/user/login', function(req, res){

    res.redirect('/mainInterface')
})

// Route: create new note button (notes/index.ejs)
app.get('/notes/create', function(req, res){

    res.render('notes/create')
})

// Route: cancel button (notes/create.ejs)
app.get('/notes', function(req, res){

    res.redirect('/mainInterface')
})

// Route: save button (notes/crete.ejs)
app.post("/notes/create", async function(req, res){

   await db.collection('todoItems').insertOne({title: req.body.title, body: req.body.detailsText})

  
    res.redirect('/mainInterface')
     
})

// Route: view button (notes/index.ejs)
app.get('/notes/:id/view', async function(req, res){

   const viewItem = await db.collection('todoItems').findOne({_id: new ObjectId(req.params.id)})

   
   
    res.render('notes/view', {view: viewItem})
})

// Route: Edit button (notes/view.ejs)
app.get('/notes/:id/edit', async function(req, res){
    const id = req.params.id
  const editItem = await db.collection('todoItems').findOne({_id: new ObjectId(id)})

        res.render('notes/edit', {editId: editItem})
})

// Route: Edit Note:: cancel button
app.get('/notes/:id', function(req, res){
      
        res.redirect(`/notes/${req.params.id}/view`)
}) 
// Route: Edit Note:: save button 
app.post('/notes/:id/edit', async function(req, res){
      const id = req.params.id
      const editTitle = req.body.title
      const editBody = req.body.body
    await db.collection('todoItems').updateOne({_id: ObjectId.createFromHexString(id)},{$set: {title: editTitle, body:editBody, done: false }})

        res.redirect(`/notes/${req.params.id}/view`)
})

// Route: Mark as done 
app.post('/notes/:id/done', async function(req, res){
    const id = req.params.id

    await db.collection('todoItems').updateOne({_id: new ObjectId(id)}, {$set: {done: true}})

    res.redirect(`/notes/${id}/view`)

})

// Route: delete
app.post('/notes/:id/delete', async function(req, res){
   const id = req.params.id
   await db.collection('todoItems').deleteOne({_id: new ObjectId(id)})
    res.redirect('/mainInterface')

})


app.listen(port, function(){
    console.log(`server is running at port: ${port}`)
})
