const express = require("express");
const router = express.Router();
const cardController = require("../controllers/card");

// GET /api/cards?listId=1  -> get all cards (optionally filtered by list)
router.get("/cards", cardController.getAllCards);

// GET /api/cards/:id  -> get single card by ID
router.get("/cards/:id", cardController.getByIdCard);

// POST /api/cards  -> create new card
router.post("/cards", cardController.postCard);

// PUT /api/cards/:id  -> update card by ID
router.put("/cards/:id", cardController.putCard);

// DELETE /api/cards/:id  -> delete card by ID
router.delete("/cards/:id", cardController.deleteCard);

module.exports = router;