/**
 * List handler for reservation resources
 */
const service = require("./reservations.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
// const {  formatAsTime,
//   formatAsDate,
// } = require("../../../front-end/src/utils/date-time.js");

// Original JavaScript code by Chirp Internet: chirpinternet.eu
// Please acknowledge use of this code by including this header.

function checkDate(date) {
  var allowBlank = true;
  var minYear = 1902;
  var maxYear = 2100;

  // empty string means no error
  var errorMsg = "";

  // regular expression to match required date format
  const re = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

  if (date != "") {
    if ((regs = date.match(re))) {
      if (regs[3] < 1 || regs[3] > 31) {
        errorMsg = "reservation_date - Invalid value for day: " + regs[3];
      } else if (regs[2] < 1 || regs[2] > 12) {
        errorMsg = "reservation_date - Invalid value for month: " + regs[2];
      } else if (regs[1] < minYear || regs[1] > maxYear) {
        errorMsg =
          "reservation_date -Invalid value for year: " +
          regs[1] +
          " - must be between " +
          minYear +
          " and " +
          maxYear;
      }
    } else {
      errorMsg = "reservation_date - Invalid date format: " + date;
    }
  } else if (!allowBlank) {
    errorMsg = "reservation_date - Empty date not allowed!";
  }

  return errorMsg;
}

// Original JavaScript code by Chirp Internet: chirpinternet.eu
// Please acknowledge use of this code by including this header.

function checkTime(time) {
  var errorMsg = "";

  // regular expression to match required time format
  const re = /^(\d{1,2}):(\d{2})(:00)?([ap]m)?$/;

  if (time != "") {
    if ((regs = time.match(re))) {
      if (regs[4]) {
        // 12-hour time format with am/pm
        if (regs[1] < 1 || regs[1] > 12) {
          errorMsg = "reservation_time - Invalid value for hours: " + regs[1];
        }
      } else {
        // 24-hour time format
        if (regs[1] > 23) {
          errorMsg = "reservation_time - Invalid value for hours: " + regs[1];
        }
      }
      if (!errorMsg && regs[2] > 59) {
        errorMsg = "reservation_time - Invalid value for minutes: " + regs[2];
      }
    } else {
      errorMsg = "Invalid reservation_time: " + time;
    }
  }

  return errorMsg;
}

function checkDayOfWeek(date, time) {
  const aDay = new Date(date + " " + time);
  // console.log("aDay=", aDay)
  const dayWeek = aDay.getDay();
  // console.log("dayWeek=", dayWeek);
  let message = "";
  if (Date.parse(aDay) - Date.now() < 0) {
    message += "\nReservation must be in the future.";
  }

  if (dayWeek === 2) {
    message += "\nRestaurant is closed on Tuesdays.";
  }
  return message;
}

function checkReservationTime(date, time) {
  const aReservationDay = new Date(date + " " + time);
  // console.log("aReservationTime=", aReservationDay)
  let message = "";
  var startBusinessHours = new Date(date + " " + time);
  startBusinessHours.setHours(10, 30, 0); // 10:30 am is when restaraunt opens
  var endBusinessHours = new Date(date + " " + time);
  endBusinessHours.setHours(21, 30, 0); // 9:30 pm latest reservation

  if (
    !(
      aReservationDay >= startBusinessHours &&
      aReservationDay < endBusinessHours
    )
  ) {
    message += "\nReservation must be between 10:30 am and 9:30 pm.";
  }

  return message;
}

function hasData(req, res, next) {
  if (req.body.data) {
    return next();
  }
  next({ status: 400, message: "Body must have data property" });
}

function hasFirstName(req, res, next) {
  const first_name = req.body.data.first_name;
  if (first_name) {
    return next();
  }
  next({ status: 400, message: "first_name is required" });
}

function hasLastName(req, res, next) {
  const last_name = req.body.data.last_name;
  if (last_name) {
    return next();
  }
  next({ status: 400, message: "last_name is required" });
}

function hasReservationDate(req, res, next) {
  const reservation_date = req.body.data.reservation_date;
  let message = "reservation_date is required";
  if (reservation_date) {
    // console.log("rd=", reservation_date);
    // console.log("check=", checkDate(reservation_date));
    message = checkDate(reservation_date);
    if (message === "") {
      return next();
    }
  }
  next({ status: 400, message: message });
}

function hasReservationTime(req, res, next) {
  const reservation_time = req.body.data.reservation_time;
  let message = "reservation_time is required";
  if (reservation_time) {
    // console.log("rt=", reservation_time);
    // console.log("checkt=", checkDate(reservation_time));
    message = checkTime(reservation_time);
    if (message === "") {
      return next();
    }
  }
  next({ status: 400, message: message });
}

function validReservationDate(req, res, next) {
  const reservation_date = req.body.data.reservation_date;
  const reservation_time = req.body.data.reservation_time;
  let message = checkDayOfWeek(reservation_date, reservation_time);
  if (message == "") {
    return next();
  }
  next({ status: 400, message: message });
}

function validReservationTime(req, res, next) {
  const reservation_date = req.body.data.reservation_date;
  const reservation_time = req.body.data.reservation_time;
  let message = checkReservationTime(reservation_date, reservation_time);
  if (message == "") {
    return next();
  }
  next({ status: 400, message: message });
}

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

function hasPeople(req, res, next) {
  const people = req.body.data.people;
  // console.log("people = ", people);
  if (typeof people == "number") {
    if (people >= 1) {
      return next();
    }
  }
  next({ status: 400, message: "people is required" });
}

function invalidStatus(req, res, next) {
  const status = req.body.data.status;

  if (typeof status === "undefined") return next();

  if (status === null) return next();

  if (status === "booked") return next();

  next({ status: 400, message: `status ${status} is invalid` });
}

function validStatus(req, res, next) {
  const status = req.body.data.status;

  if (res.locals.reservations.status)
    if (status === "booked" || status === "seated" || status === "finished" || status === "cancelled")
      return next();

  next({
    status: 400,
    message: `status ${status} received value must not be null nor undefined`,
  });
}

function statusNotFinished(req, res, next) {
  if (res.locals.reservations.status !== "finished") return next();

  next({ status: 400, message: `a finished reservation cannot be updated` });
}

function hasMobileNumber(req, res, next) {
  const mobile_number = req.body.data.mobile_number;
  if (mobile_number) {
    return next();
  }
  next({ status: 400, message: "mobile_number is required" });
}

async function reservationExists(req, res, next) {
  const { date, mobile_number } = req.query;

  if (date) {
    // console.log("date =", date);
    const reservations = await service.read(date);
    // console.log("reservations =", reservations);
    if (reservations) {
      res.locals.reservations = reservations;
      return next();
    }
  } else if (mobile_number) {
    const reservations = await service.readByMobile(mobile_number);
    console.log("mobile number reservations =", reservations);
    if (reservations) {
      res.locals.reservations = reservations;
      return next();
    }
  }
  return next({ status: 404, message: `No reservations found for that date.` });
}

async function reservationIdExists(req, res, next) {
  const { reservationId } = req.params;
  const reservations = await service.readById(reservationId);
  // console.log("reservations =", reservations);
  if (reservations) {
    res.locals.reservations = reservations;
    return next();
  }
  return next({
    status: 404,
    message: `reservation_id ${reservationId} not found.`,
  });
}

async function list(req, res, next) {
  res.json({ data: await service.list() });
}

async function read(req, res, next) {
  // const knexInstance = req.app.get("db");
  const { reservations } = res.locals;
  // console.log("reservations = ", reservations);
  res.status(200).json({ data: res.locals.reservations });
}

// Create a new reservation
async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data: data });
}

// Update an existing reservation
async function update(req, res) {
  // console.log("updatebodydata = ", req.body.data);
  // console.log("locals = ", res.locals.reservations);

  const updatedReservation = {
    ...res.locals.reservations,
    ...req.body.data,
  };
  // console.log("updatedReservationinupdate = ", updatedReservation);

  const data = await service.update(updatedReservation);

  const result = {
    ...updatedReservation,
  };

  res.json({ data: result });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(hasData),
    asyncErrorBoundary(hasFirstName),
    asyncErrorBoundary(hasLastName),
    asyncErrorBoundary(hasReservationDate),
    asyncErrorBoundary(hasReservationTime),
    asyncErrorBoundary(hasPeople),
    asyncErrorBoundary(hasMobileNumber),
    asyncErrorBoundary(validReservationDate),
    asyncErrorBoundary(validReservationTime),
    asyncErrorBoundary(invalidStatus),
    create,
  ],
  update: [
    asyncErrorBoundary(reservationIdExists),
    asyncErrorBoundary(hasData),
    asyncErrorBoundary(hasFirstName),
    asyncErrorBoundary(hasLastName),
    asyncErrorBoundary(hasReservationDate),
    asyncErrorBoundary(hasReservationTime),
    asyncErrorBoundary(hasPeople),
    asyncErrorBoundary(hasMobileNumber),
    asyncErrorBoundary(validReservationDate),
    asyncErrorBoundary(validReservationTime),
    asyncErrorBoundary(invalidStatus),
    update,
  ],
  read: [asyncErrorBoundary(reservationExists), read],
  readById: [asyncErrorBoundary(reservationIdExists), read],
  updateStatus: [
    asyncErrorBoundary(reservationIdExists),
    asyncErrorBoundary(statusNotFinished),
    asyncErrorBoundary(validStatus),
    update,
  ],
};
