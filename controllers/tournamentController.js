const Tournament = require('../model/Tournament');

exports.getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTournamentById = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTournament = async (req, res) => {
  try {
    const { tournamentName, creatorName } = req.body;
    const tournament = await Tournament.create({
      tournament_name: tournamentName,
      creator_name: creatorName,
    });
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { roomId } = req.body;

    const tournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      { $push: { rooms: { room_id: roomId, players: [] } } },
      { new: true }
    );

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.joinRoom = async (req, res) => {
     try {
       const { tournamentId, roomId } = req.params;
       const { playerName, email } = req.body;
   
       // Validate email before updating the database
       if (!email || !validateEmail(email)) { 
         return res.status(400).json({ error: 'Invalid email address' });
       }
   
       const tournament = await Tournament.findOneAndUpdate(
         { _id: tournamentId, 'rooms.room_id': roomId },
         {
           $push: {
             'rooms.$.players': {
               player_name: playerName,
               email: email,
               score: 0,
             },
           },
         },
         { new: true }
       );
   
       if (!tournament) {
         return res.status(404).json({ error: 'Tournament or room not found' });
       }
       res.json(tournament);
     } catch (error) {
       // Handle duplicate key errors from MongoDB
       if (error.code === 11000 && error.keyPattern && error.keyPattern['rooms.players.email'] === 1) {
         return res.status(400).json({ error: 'Email address already exists in this room' });
       }
       res.status(500).json({ error: error.message });
     }
   };
   

function validateEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(String(email).toLowerCase());
}


exports.saveScore = async (req, res) => {
  try {
    const { tournamentId, roomId, playerName } = req.params;
    const { score } = req.body;

    const tournament = await Tournament.findOneAndUpdate(
      {
        _id: tournamentId,
        'rooms.room_id': roomId,
        'rooms.players.player_name': playerName,
      },
      {
        $set: { 'rooms.$[room].players.$[player].score': score },
      },
      {
        arrayFilters: [
          { 'room.room_id': roomId },
          { 'player.player_name': playerName },
        ],
        new: true,
      }
    );

    if (!tournament) {
      return res
        .status(404)
        .json({ error: 'Tournament, room, or player not found' });
    }

    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setWinner = async (req, res) => {
  try {
    const { tournamentId, roomId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const roomIndex = tournament.rooms.findIndex(
      (r) => r.room_id === roomId
    );
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = tournament.rooms[roomIndex];
    const winner = room.players.reduce(
      (max, player) => (max.score > player.score ? max : player),
      { score: -Infinity }
    );

    if (winner.score === -Infinity) {
      return res
        .status(400)
        .json({ error: 'No players in the room to determine a winner' });
    }

    tournament.winner_name = winner.player_name;
    await tournament.save();

    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};