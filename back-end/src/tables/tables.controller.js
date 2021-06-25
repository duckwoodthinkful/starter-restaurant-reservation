/**
 * List handler for table resources
 */
const service = require("./tables.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

function checkTableName(table_name) {
  let message = "";

  if (table_name.length < 2) {
    message += "\nTable name must be at least 2 characters.";
  }
  return message;
}

function checkCapacity(capacity) {
  let message = "";
  if (capacity < 1) {
    message += "\nCapacity must be at least 1.";
  }

  return message;
}

function hasData(req, res, next) {
  if (req.body.data) {
    return next();
  }
  next({ status: 400, message: "Body must have data property" });
}

function hasTableName(req, res, next) {
  const table_name = req.body.data.table_name;
  if (table_name) {
    return next();
  }
  next({ status: 400, message: "table_name is required" });
}

function validTableName(req, res, next) {
  const table_name = req.body.data.table_name;
  let message = checkTableName(table_name);
  if (message == "") {
    return next();
  }
  next({ status: 400, message: message });
}

function validCapacity(req, res, next) {
  const capacity = req.body.data.capacity;
  let message = checkCapacity(capacity);
  if (message == "") {
    return next();
  }
  next({ status: 400, message: message });
}

function hasCapacity(req, res, next) {
  const capacity = req.body.data.capacity;
  if (typeof capacity == "number") {
    return next();
  }
  next({ status: 400, message: "A numeric Capacity is required" });
}

async function tableExists(req, res, next) {
  const { table_name } = req.query;
//   console.log("table_name =", table_name);
  const tables = await service.read(table_name);
//   console.log("tables =", tables);
  if (tables) {
    res.locals.tables = tables;
    return next();
  }
  return next({ status: 404, message: `No table found with that name.` });
}

async function list(req, res, next) {
    console.log ("listing tables...");
  res.json({ data: await service.list() });
}

async function read(req, res, next) {
  res.json({ data: res.locals.tables });
}

// Create a new table
async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data: data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasData,
    hasTableName,
    hasCapacity,
    // hasOccupied,
    validTableName,
    validCapacity,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), read],
};
