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

// Update an existing table
function update(updatedTable) {
  console.log("updatedTable=", updatedTable);
  return knex("tables")
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

// Clear a table
function clearTable(clearedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id: clearedTable.table_id })
    .update(clearedTable, "*")
    .then((updatedRecords) => updatedRecords[0]);
}


module.exports = {
  list,
  listAvailable,
  create,
  read,
  readId,
  update,
  clearTable,
};
