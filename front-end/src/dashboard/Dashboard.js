import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
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

  const useQueryString = () => {
    const location = useLocation();
    return new URLSearchParams(location.search);
  };

  const [searchDate, setSearchDate] = useState(
    useQueryString().get("date") || date
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (date) {
      params.append("date", date);
    } else {
      params.delete("date");
    }
    history.push({ search: params.toString() });
  }, [date, history]);

  // const location = useLocation();
  // const search = location.search; // could be '?foo=bar'
  // const params = new URLSearchParams(search);
  // const foo = params.get("date"); // bar
  // if (foo)
  // setSearchDate(foo);

  console.log("searchDate=", searchDate);

  // https://css-tricks.com/snippets/css/a-guide-to-flexbox/

  useEffect(loadDashboard, [searchDate]);

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
    // console.log("load, date=", date);
    // console.log("load, searchDate=", searchDate);

    listReservations({ date: searchDate }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  function ReservationList({ reservations }) {
    const rows = reservations.map(
      ({ first_name, last_name, reservation_date, people }, index) => (
        <tr key={index}>
          <td>{first_name}</td>
          <td>{last_name}</td>
          <td>{reservation_date}</td>
          <td>{people}</td>
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

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {searchDate}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
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
      <ReservationList reservations={reservations} />

      {/* {JSON.stringify(reservations)} */}
    </main>
  );
}

export default Dashboard;
