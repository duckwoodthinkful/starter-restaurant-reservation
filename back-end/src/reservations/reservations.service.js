// Service module for reservation handling

const knex = require("../db/connection");

// List all of the reservations
function list() {
  return knex("reservations").select("*");
}

// List all reservations for a given date
function read(reservation_date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date: reservation_date })
    .andWhereNot({ status: "finished" })
    .orderBy("reservation_time", "asc");
}

// List all reservations for a given mobile number
function readByMobile(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

// Read a specific reservation by it's ID
function readById(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservation_id })
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
  readByMobile,
  update,
};
