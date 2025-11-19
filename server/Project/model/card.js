const db = require("../../db/db");

const cardModel = {
  // Create a new card (task)
  async createCard({ title, description, list_id, position, created_by }) {
    const [id] = await db("cards").insert({
      title,
      description,
      list_id,
      position,
      created_by,
      created_at: new Date(),
    });

    return await db("cards").where({ id }).first();
  },

  // Get the highest position value inside a specific list
  async getMaxPosition(listId) {
    const result = await db("cards")
      .where({ list_id: listId })
      .max("position as maxPos")
      .first();

    return result?.maxPos ?? -1;
  },

  // Get all cards for a specific list
  async getCardsByList(listId) {
    return await db("cards").where({ list_id: listId }).select("*");
  },

  // Get a single card by its ID
  async getById(id) {
    return await db("cards").where({ id }).first();
  },

  // Update a card by its ID
  async updateCard(id, data) {
    await db("cards")
      .where({ id })
      .update(data);

    return this.getById(id); // return updated card
  },

  // Delete a card by its ID
  async deleteCard(id) {
    const card = await this.getById(id); // check if exists
    if (!card) return null;

    await db("cards").where({ id }).del();

    return card; // return deleted card
  },
};

module.exports = cardModel;