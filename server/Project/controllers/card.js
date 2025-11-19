const cardModel = require("../model/card");
const { cardValidation } = require("../validation/card");
const asyncErrorHandler = require("../services/asyncErrorHandler");
const customError = require("../services/customError");

// This controller sends requests to DB and returns responses

// returns all cards that exist
exports.getAllCards = asyncErrorHandler(async (req, res, next) => {
  const allCards = await cardModel.getCardsByList(req.query.listId);
  res.status(200).json(allCards);
});

// returns a card by its ID with status 200 or an error 404
exports.getByIdCard = asyncErrorHandler(async (req, res, next) => {
  const card = await cardModel.getById(req.params.id);

  if (!card) {
    const error = new customError("Card with this ID is not found", 404);
    return next(error);
  }

  res.status(200).json(card);
});

// creates a new card, validates input and returns it with status 201 or error
exports.postCard = [
  cardValidation,
  asyncErrorHandler(async (req, res, next) => {
    const { title, description, listId, position } = req.body;

    const createdBy = 1; // temporary hard-coded user ID

    // if position is not provided, compute next position in the list
    let finalPosition = position;
    if (finalPosition === undefined || finalPosition === null) {
      const maxPos = await cardModel.getMaxPosition(listId);
      finalPosition = maxPos + 1;
    }

    const newCard = await cardModel.createCard({
      title,
      description,
      list_id: listId,
      position: finalPosition,
      created_by: createdBy,
    });

    res.status(201).json(newCard);
  }),
];

// updates a card by ID and returns it with status 200 or an error 404
exports.putCard = [
  cardValidation,
  asyncErrorHandler(async (req, res, next) => {
    const { title, description, listId, position } = req.body;

    const dataToUpdate = {};

    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (listId !== undefined) dataToUpdate.list_id = listId;
    if (position !== undefined) dataToUpdate.position = position;

    const updatedCard = await cardModel.updateCard(req.params.id, dataToUpdate);

    if (!updatedCard) {
      const error = new customError("Card with this ID is not found", 404);
      return next(error);
    }

    res.status(200).json(updatedCard);
  }),
];

// deletes a card by ID and returns it with status 200 or an error 404
exports.deleteCard = asyncErrorHandler(async (req, res, next) => {
  const deletedCard = await cardModel.deleteCard(req.params.id);

  if (!deletedCard) {
    const error = new customError("Card with this ID is not found", 404);
    return next(error);
  }

  res.status(200).json(deletedCard);
});