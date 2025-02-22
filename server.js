const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.post('/reportData', (req, res) => {
    console.log(req.body)
    res.status(200).send('ok')
})

app.listen(9800, () => console.log('Listening on port 9800'));