import React, { useEffect, useState } from "react";
import { listReservations, listTables, clearTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../layout/ReservationList";
import { useLocation } from "react-router-dom";
import { today, next, previous } from "../utils/date-time";
import { useHistory } from "react-router-dom";


/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const history = useHistory();

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  const [finishing, setFinishing] = useState(0);

  const useQueryString = () => {
    const location = useLocation();
    return new URLSearchParams(location.search);
  };

  const [searchDate, setSearchDate] = useState(
    useQueryString().get("date") || date
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchDate) {
      params.append("date", searchDate);
    } else {
      params.delete("date");
    }
    history.push({ search: params.toString() });
  }, [searchDate, history]);

  useEffect(() => {
    console.log("finishingUseEffect");
    loadTables();
  }, [finishing]);

  // https://css-tricks.com/snippets/css/a-guide-to-flexbox/

  useEffect(loadReservations, [searchDate, finishing]);

  // TODO: CAN USE LINK here
  function datePrev() {
    setSearchDate(previous(searchDate));
  }
  function dateToday() {
    setSearchDate(today());
  }
  function dateNext() {
    setSearchDate(next(searchDate));
  }

  // Show a confirmation to user to make sure they actually want to clear a table
  function finishSeating(table_id, reservation_id) {
    var answer = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    if (answer) {
      setFinishing(table_id);
      onConfirm(table_id, reservation_id);
    } else return;
  }

  // User confirmed the table is to be cleared
  function onConfirm(table_id, reservation_id) {
    console.log("confirm tableid=", table_id);
    clearTable(table_id).then(() => setFinishing(0));
  }

  // User said not to clear the table, do nothing.
  function onNotConfirmed() {
    console.log("Not confirmed");
    setFinishing(0);
  }

  function loadTables() {
    const abortController = new AbortController();
    setTablesError(null);
    console.log("Load Tables");
    listTables({}, abortController.signal)
      .then(setTables)
      .catch(setTablesError);
    return () => abortController.abort();
  }

  function loadReservations() {
    const abortController = new AbortController();
    setReservationsError(null);

    listReservations({ date: searchDate }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  function ReservationNav() {
    return (
      <div>
        <div className="d-md-flex mb-3">
          <h4 className="mb-0">Reservations for {searchDate}</h4>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-primary"
            data-testid="prev-date"
            title="Go to previous day"
            onClick={datePrev}
          >
            <span>Prev</span>
          </button>
          <span> </span>
          <button
            type="button"
            className="btn btn-primary"
            data-testid="today-date"
            title="Go to today"
            onClick={dateToday}
          >
            <span>Today</span>
          </button>
          <span> </span>
          <button
            type="button"
            className="btn btn-primary"
            data-testid="next-date"
            title="Go to next day"
            onClick={dateNext}
          >
            <span>Next</span>
          </button>
        </div>
      </div>
    );
  }


  function TableButtons({ reservation_id, table_id }) {
    if (false) {
      if (table_id === finishing) {
        return (
          <div>
            <button
              type="button"
              data-table-id-confirm={table_id}
              className="btn btn-secondary"
              title="Ok"
              onClick={(e) => onConfirm(table_id, reservation_id)}
            >
              <span>Ok</span>
            </button>
            <span> </span>
            <button
              type="button"
              data-table-id-cancel={table_id}
              className="btn btn-secondary"
              title="Cancel"
              onClick={(e) => onNotConfirmed()}
            >
              <span>Cancel</span>
            </button>
          </div>
        );
      }
      return null;
    } else if (reservation_id) {
      return (
        <button
          type="button"
          data-table-id-finish={table_id}
          className="btn btn-secondary"
          title="Finish seating"
          onClick={(e) => finishSeating(table_id, reservation_id)}
        >
          <span>Finish</span>
        </button>
      );
    } else {
      return null;
    }
  }


  function TableList({ tables, finishing }) {
    const rows = tables.map(
      ({ table_id, table_name, capacity, reservation_id }, index) => (
        <tr key={index}>
          <td>{table_name}</td>
          <td>{capacity}</td>
          <td data-table-id-status={table_id}>
            {reservation_id ? "Occupied" : "Free"}
          </td>
          {reservation_id ? (
            <td>
              <TableButtons
                reservation_id={reservation_id}
                table_id={table_id}
                finishing={finishing}
              />
            </td>
          ) : (
            <td></td>
          )}
        </tr>
      )
    );
    if (tables.length < 1) {
      return <div>No tables found.</div>;
    } else {
      return (
        <table>
          <thead>
            <tr>
              <th>Table Name</th>
              <th>Capacity</th>
              <th>Occupied</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      );
    }
  }
  return (
    <main>
      <h1>Dashboard</h1>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />
      <ReservationNav />
      <ReservationList reservations={reservations} updateCallback={loadReservations} />
      <hr />
      <TableList tables={tables} finishing={finishing} />
    </main>
  );
}

export default Dashboard;
