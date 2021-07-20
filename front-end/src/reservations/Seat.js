import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {
  listTables,
  createSeat,
  readReservation,
  updateReservationStatus,
} from "../utils/api";

// Function to handle seating a reservation at a table
function NewSeat() {
  const history = useHistory();
  const params = useParams();

  const [tables, setTables] = useState([]);
  const [reservation, setReservation] = useState([]);

  const [seat, setSeat] = useState({
    table_id: "",
    reservation_id: params.reservationId,
    capacity: 0,
  });

  useEffect(() => {
    loadTables();
  }, []);

  // Update the reservation information based on a reservation ID change
  useEffect(() => {
    const abortController = new AbortController();
    setError(null);

    readReservation(params.reservationId, abortController.signal)
      .then(setReservation)
      .catch(setError);
    return () => abortController.abort();
  }, [params.reservationId]);

  // Update the seating information based on a change in the tables
  useEffect(() => {
    if (tables.length > 1)
      setSeat((previousSeat) => ({
        ...previousSeat,
        table_id: tables[0].table_id,
        capacity: tables[0].capacity,
      }));
  }, [tables]);

  // Handle changes to the table seating information
  function changeHandler({ target }) {
    setSeat((previousSeat) => ({
      ...previousSeat,
      [target.name]: target.value,
      capacity:
        target.options[target.selectedIndex].getAttribute("data-capacity"),
    }));
  }

  // validate the form inputs to confirm they are within range
  function validateForm() {
    let message = "";

    if (reservation.people > seat.capacity) {
      message += "Table cannot handle the number of people.";
    }

    if (message !== "") {
      setError({ message: message });
      return false;
    }

    return true;
  }

  const [error, setError] = useState(null);

  // Handle the submit button on the form
  function handleSubmit(event) {
    event.preventDefault();
    // Clear any previous errors
    setError(null);
    if (validateForm()) {
      createSeat(seat)
        .then(
          updateReservationStatus({
            reservation_id: seat.reservation_id,
            status: "seated",
          })
        )
        .then(() => {
          history.push("/");
        })
        .catch(setError);
    } else {
      return;
    }
  }

  // Return to the previous page on cancel
  function CancelButton() {
    const history = useHistory();
    return (
      <button type="button" onClick={() => history.goBack()}>
        Cancel
      </button>
    );
  }

  // Load all of the tables that reside in the restaurant
  function loadTables() {
    const abortController = new AbortController();
    setError(null);

    listTables({ available: true }, abortController.signal)
      .then(setTables)
      .catch(setError);
    return () => abortController.abort();
  }

  // Show a list of tables available in the restaurant
  function TableList({ tables }) {
    const rows = tables.map(({ table_name, capacity, table_id }, index) => (
      <option
        value={table_id}
        key={index}
        data-capacity={capacity}
      >{`${table_name} - ${capacity}`}</option>
    ));
    if (tables.length < 1) {
      return (
        <div>
          <div>No tables found.</div>
          <CancelButton />
        </div>
      );
    } else {
      return (
        <form onSubmit={handleSubmit}>
          <select
            name="table_id"
            value={seat.table_id}
            onChange={changeHandler}
          >
            {rows}
          </select>
          <div>
            <button type="submit">Submit</button>
            <CancelButton />
          </div>
        </form>
      );
    }
  }

  return (
    <main>
      <ErrorAlert error={error} />
      <TableList tables={tables} />
    </main>
  );
}

export default NewSeat;
