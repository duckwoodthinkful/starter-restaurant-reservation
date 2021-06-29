const knex = require("../db/connection");

function list() {
  return knex("reservations").select("*");
}

function read(reservation_date) {
  // console.log("Reading reservations", reservation_date);
  return knex("reservations")
  .select("*")
  .where({reservation_date: reservation_date})
  .orderBy('reservation_time', 'asc');
}

function readById(reservation_id) {

  // console.log("Reading reservations", reservation_id);
  return knex("reservations")
  .select("*")
  .where({reservation_id: reservation_id})
  .then((records) => records[0]);
}


// Create a new reservation
function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}


module.exports = {
  list,
  create,
  read,
  readById,
};
