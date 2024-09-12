const mongoose = require('mongoose');


const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; 

const playerSchema = new mongoose.Schema({
     player_name: String,
     email: {
       type: String,
       required: true,
       unique: true,
       default: '', 
       validate: {
         validator: function(value) {
           return emailRegex.test(value);
         },
         message: 'Please provide a valid email address'
       }
     },
     score: { type: Number, default: 0 }
   });

const roomSchema = new mongoose.Schema({
  room_id: String,
  players: [playerSchema]
});

const tournamentSchema = new mongoose.Schema(
  {
    tournament_name: String,
    creator_name: String,
    winner_name: String,
    rooms: [roomSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tournament', tournamentSchema);