import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { listTables, createSeat, readReservation, updateReservationStatus } from "../utils/api";

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

  useEffect(() => {
    const abortController = new AbortController();
    setError(null);

    readReservation(params.reservationId, abortController.signal)
      .then(setReservation)
      .catch(setError);
    return () => abortController.abort();
  }, [params.reservationId]);

  useEffect(() => {
    if (tables.length > 1)
      setSeat((previousSeat) => ({
        ...previousSeat,
        table_id: tables[0].table_id,
        capacity: tables[0].capacity,
      }));
  }, [tables]);

  function changeHandler({ target }) {
    setSeat((previousSeat) => ({
      ...previousSeat,
      [target.name]: target.value,
      capacity:
        target.options[target.selectedIndex].getAttribute("data-capacity"),
    }));
  }

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

  function handleSubmit(event) {
    event.preventDefault();
    // Clear any previous errors
    setError(null);
    if (validateForm()) {
      createSeat(seat)
        .then(updateReservationStatus({reservation_id: seat.reservation_id, status: "seated"}))
        .then(() => {
          history.push("/");
        })
        .catch(setError);
    } else {
      return;
    }
  }

  function CancelButton() {
    const history = useHistory();
    return (
      <button type="button" onClick={() => history.goBack()}>
        Cancel
      </button>
    );
  }

  function loadTables() {
    const abortController = new AbortController();
    setError(null);

    listTables({ available: true }, abortController.signal)
      .then(setTables)
      .catch(setError);
    return () => abortController.abort();
  }

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
