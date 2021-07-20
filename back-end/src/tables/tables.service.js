// Service module for table handling
const knex = require("../db/connection");

// List all existing tables
function list() {
  return knex("tables").select("*").orderBy("table_name", "asc");
}

// List all available tables
function listAvailable() {
  return knex("tables")
    .select("*")
    .groupBy("table_id")
    .havingNull("reservation_id");
}

// Read an existing table
function read(table_name) {
  return knex("tables").select("*").where({ table_name: table_name });
}

// Read an existing table by id
function readId(table_id) {
  return knex("tables").select("*").where({ table_id: table_id });
}

// Create a new table
function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

// Seat a table and update the reservation status in a single transaction
function seatTable(updatedTable) {
  return knex.transaction(function (trx) {
    knex("tables")
      .update({ reservation_id: updatedTable.reservation_id })
      .where({ table_id: updatedTable.table_id })
      .transacting(trx)
      .then(function () {
        return knex("reservations")
          .update({ status: "seated" })
          .where({ reservation_id: updatedTable.reservation_id })
          .transacting(trx);
      })
      .then(trx.commit)
      .catch(function (e) {
        t.rollback();
        throw e;
      });
  });
}

// Clear a table and update the reservation status in a single transaction
function clearTable(clearedTable) {
  return knex.transaction(function (t) {
    knex("tables")
      .update({ reservation_id: null })
      .where({ table_id: clearedTable.table_id })
      .transacting(t)
      .then(function () {
        return knex("reservations")
          .update({ status: "finished" })
          .where({ reservation_id: clearedTable.reservation_id })
          .transacting(t);
      })
      .then(t.commit)
      .catch(function (e) {
        t.rollback();
        throw e;
      });
  });
}

module.exports = {
  list,
  listAvailable,
  create,
  read,
  readId,
  seatTable,
  clearTable,
};
