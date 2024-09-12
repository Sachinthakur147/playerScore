
const express = require('express');
const mongoose = require('mongoose');
const tournamentRoutes = require('./routes/tournamentRoutes'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; 

mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

app.use(express.json());
app.use('/tournaments', tournamentRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' }); 
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));