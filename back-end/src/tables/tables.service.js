const knex = require("../db/connection");

function list() {
  return knex("tables").select("*").orderBy('table_name', 'asc');
}

function read(table_name) {
  // your solution here
  console.log("Reading tables", table_name);
  return knex("tables")
  .select("*")
  .where({table_name: table_name});
}

// Create a new table
function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}


module.exports = {
  list,
  create,
  read,
};
