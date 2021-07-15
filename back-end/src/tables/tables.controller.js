/**
 * List handler for table resources
 */
const service = require("./tables.service.js");
const reservationService = require("../reservations/reservations.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

function checkTableName(table_name) {
  let message = "";

  if (table_name.length < 2) {
    message += "table_name must be at least 2 characters.";
  }
  return message;
}

function checkCapacity(capacity) {
  let message = "";
  if (capacity < 1) {
    message += "capacity must be at least 1.";
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
  let errormessage = checkTableName(table_name);

  if (errormessage === "") {
    return next();
  }
  next({ status: 400, message: errormessage });
}

function validCapacity(req, res, next) {
  const capacity = req.body.data.capacity;
  let errormessage = checkCapacity(capacity);
  if (errormessage == "") {
    return next();
  }
  next({ status: 400, message: errormessage });
}

function hasCapacity(req, res, next) {
  const capacity = req.body.data.capacity;
  if (typeof capacity == "number") {
    return next();
  }
  next({ status: 400, message: "A numeric capacity is required" });
}

async function tableExists(req, res, next) {
  const { table_name } = req.query;
  //   console.log("table_name =", table_name);
  const table = await service.read(table_name);
  //  console.log("tables =", tables);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({ status: 404, message: `No table found with that name.` });
}

async function tableIdExists(req, res, next) {
  const { table_id } = req.params;

  const table = await service.readId(table_id);
  if (table.length > 0) {
    // console.log("table exists=", table[0]);
    res.locals.table = table[0];
    return next();
  }
  next({ status: 404, message: `table_id ${table_id} not found.` });
}

function hasReservationId(req, res, next) {
  const reservation_id = req.body.data.reservation_id;
  // console.log("reservation_id=", reservation_id);
  if (reservation_id) {
    return next();
  }
  next({ status: 400, message: `reservation_id is required` });
}

async function reservationIdExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const reservation = await reservationService.readById(reservation_id);
  if (reservation) {
    // console.log("reservationIDExists reservation=", reservation);
    res.locals.reservation = reservation;
    return next();
  }
  return next({
    status: 404,
    message: `reservation_id ${reservation_id} not found.`,
  });
}

// Check if table has sufficient capacity to seat the reservation
function tableHasSufficientCapacity(req, res, next) {
  const reservation = res.locals.reservation;
  const table = res.locals.table;

  if (reservation.people <= table.capacity) {
    return next();
  }

  next({ status: 400, message: "number of people exceeds table capacity" });
}

// Check if table is already occupied
function tableIsOccupied(req, res, next) {
  const table = res.locals.table;

  if (!table.reservation_id) {
    return next();
  }

  next({ status: 400, message: "table is occupied" });
}

function reservationIsAlreadySeated(req, res, next) {
  const reservation = res.locals.reservation;
  // console.log ("reservationIsAlreadySeated reservation = ", reservation);
  if (reservation.status === "booked") {
    return next();
  }

  next({ status: 400, message: "table is already seated" });
}

// Check if table is already occupied
function tableIsNotOccupied(req, res, next) {
  const table = res.locals.table;

  // console.log ("tableIsNotOccupied table=", table);
  if (table.reservation_id) {
    return next();
  }

  next({ status: 400, message: "table is not occupied" });
}

async function list(req, res, next) {
  const available = req.query.available;
  let tables;

  if (available) {
    tables = await service.listAvailable(true);
  } else {
    tables = await service.list();
  }

  res.json({ data: tables });
}

async function read(req, res, next) {
  res.json({ data: res.locals.table });
}

// Create a new table
async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data: data });
}

// Seat a table
async function seatTable(req, res) {
  // console.log("bodydata = ", req.body.data)
  const updatedTable = {
    ...res.locals.table,
    ...req.body.data,
  };

  // console.log("inupdate, updatedTable=", updatedTable);
  const data = await service.seatTable(updatedTable);

  // console.log ("in seatTable, data - ", data);

  const reservation = await reservationService.readById(updatedTable.reservation_id);

  // console.log ("in seatTable, reservation - ", reservation);
  // updatedTable.updated_at = Date.now();
  // updatedTable.created_at = Date.now();

  const result = {
    ...updatedTable,
  };

  res.status(200).json({ data: result });
}

// Clear a table
async function clearTable(req, res) {
  const clearedTable = {
    ...res.locals.table,
    // reservation_id: null,
  };

  const data = await service.clearTable(clearedTable);

  const result = {
    ...clearedTable,
    reservation_id: null,
  };

  // console.log ("Table was cleared.");

  res.status(200).json({ data: result });
}

module.exports = {
  list: list,
  create: [
    asyncErrorBoundary(hasData),
    asyncErrorBoundary(hasTableName),
    asyncErrorBoundary(validTableName),
    asyncErrorBoundary(hasCapacity),
    asyncErrorBoundary(validCapacity),
    create,
  ],

  seatTable: [
    asyncErrorBoundary(hasData),
    asyncErrorBoundary(tableIdExists),
    asyncErrorBoundary(hasReservationId),
    asyncErrorBoundary(reservationIdExists),
    asyncErrorBoundary(reservationIsAlreadySeated),
    asyncErrorBoundary(tableHasSufficientCapacity),
    asyncErrorBoundary(tableIsOccupied),
    seatTable,
  ],
  read: [asyncErrorBoundary(tableExists), read],
  clearTable: [
    asyncErrorBoundary(tableIdExists),
    asyncErrorBoundary(tableIsNotOccupied),
    clearTable,
  ],
};
