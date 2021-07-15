const knex = require("../db/connection");

function list() {
  return knex("reservations").select("*");
}

function read(reservation_date) {
  // console.log("Reading reservations", reservation_date);
  return knex("reservations")
  .select("*")
  .where({reservation_date: reservation_date})
  .andWhereNot({status: "finished"})
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

// Update an existing reservation
function update(updatedReservation) {
  console.log("updatedReservation=", updatedReservation);
  return knex("reservations")
    .select("*")
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

module.exports = {
  list,
  create,
  read,
  readById,
  update,
};
