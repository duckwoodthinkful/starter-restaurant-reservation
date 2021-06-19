const knex = require("../db/connection");

function list() {
  return knex("reservations").select("*");
}

function read(reservation_date) {
  // your solution here
  console.log("Reading reservations", reservation_date);
  return knex("reservations")
  .select("*")
  .where({reservation_date: reservation_date})
  .orderBy('reservation_time', 'asc');
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
};
