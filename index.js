const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.get('/',(req,res) => {
    res.send('Simple node Server is Running');
});

app.use(cors());

app.listen(port, () =>{
    console.log(`Simple node server is running on ${port}`);
})
