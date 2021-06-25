import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import { listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, Link } from "react-router-dom";
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
    loadTables();
  }, []);

  // https://css-tricks.com/snippets/css/a-guide-to-flexbox/

  useEffect(loadDashboard, [searchDate]);


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

  function loadDashboard() {
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

  
  function ReservationList({ reservations }) {
    const rows = reservations.map(
      ({ reservation_id, first_name, last_name, reservation_date, people }, index) => (
        <tr key={index}>
          <td>{first_name}</td>
          <td>{last_name}</td>
          <td>{reservation_date}</td>
          <td>{people}</td>
          <td>
          <Link to={'/reservations/' + reservation_id + '/seat'}>
          <button
            type="button"
            className="btn btn-secondary"
            title="Seat this reservation"
          >
            <span>Seat</span>
          </button>
          </Link>
          </td>
        </tr>
      )
    );
    if (reservations.length < 1) {
      return <div>No reservations found.</div>;
    } else {
      return (
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Reservation Date</th>
              <th>People</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      );
    }
  }

  function loadTables() {
    const abortController = new AbortController();
    setTablesError(null);

    listTables({}, abortController.signal)
      .then(setTables)
      .catch(setTablesError);
    return () => abortController.abort();
  }

  function TableList({ tables }) {
    const rows = tables.map(({ table_id, table_name, capacity, reservation_id }, index) => (
      <tr key={index}>
        <td>{table_name}</td>
        <td>{capacity}</td>
        <td data-table-id-status={table_id}>{reservation_id?"Occupied":"Free"}</td>
      </tr>
    ));
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
      <ReservationList reservations={reservations} />
      <hr />
      <TableList tables={tables} />
    </main>
  );
}

export default Dashboard;
