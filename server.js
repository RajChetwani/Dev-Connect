const express = require('express');
const connectDB = require('./config/db')
const app = express();
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const bodyParser = require('body-parser');

app.use(express.json({extended:false}));

//connect database
connectDB();

app.get('/', (req,res) => res.send("Hello world"));

//use routes
app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',posts);

const port = process.env.PORT || 5000 ;


app.listen(port, () => console.log(`Server running on port ${port}`));