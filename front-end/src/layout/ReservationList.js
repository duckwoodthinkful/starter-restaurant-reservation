import React from "react";
import { Link } from "react-router-dom";

function ReservationList({ reservations }) {
  const rows = reservations.map(
    (
      {
        reservation_id,
        first_name,
        last_name,
        reservation_date,
        people,
        status,
      },
      index
    ) => (
      <tr key={index}>
        <td>{first_name}</td>
        <td>{last_name}</td>
        <td>{reservation_date}</td>
        <td>{people}</td>
        <ReservationStatus status={status} reservation_id={reservation_id} />
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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

function ReservationStatus({ status, reservation_id }) {
  if (status === "booked") {
    return (
      <>
        <td data-reservation-id-status={reservation_id}>booked</td>
        <td>
          <Link to={"/reservations/" + reservation_id + "/seat"}>
            <button
              type="button"
              className="btn btn-secondary"
              title="Seat this reservation"
            >
              <span>Seat</span>
            </button>
          </Link>
        </td>
      </>
    );
  } else if (status === "seated") {
    return (
      <>
        <td data-reservation-id-status={reservation_id}>seated</td>
        <td></td>
      </>
    );
  }
  return null;
}

export default ReservationList;
