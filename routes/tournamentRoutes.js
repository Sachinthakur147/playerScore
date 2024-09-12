
const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');

router.get('/', tournamentController.getAllTournaments);

router.get('/:tournamentId', tournamentController.getTournamentById);

router.post('/', tournamentController.createTournament);

router.post('/:tournamentId/rooms', tournamentController.createRoom);

router.post('/:tournamentId/rooms/:roomId/join', tournamentController.joinRoom); 

router.put('/:tournamentId/rooms/:roomId/players/:playerName/score', tournamentController.saveScore);

router.put('/:tournamentId/rooms/:roomId/winner', tournamentController.setWinner); 

module.exports = router;