const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


// middle wares
app.use(cors());
app.use(express.json());

app.get('/',(req,res) => {
    res.send('Simple node Server is Running');
});


//user: dbuser1
//password : YLOKpUFrCh5dFsCO

app.use(cors());

app.listen(port, () =>{
    console.log(`Simple node server is running on ${port}`);
})
