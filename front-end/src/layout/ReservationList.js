import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { updateReservationStatus } from "../utils/api";

// Display reservation list given a set of reservations
// updateCallback is used to update the DOM based on a change in the reservation status
function ReservationList({ reservations, updateCallback }) {
  const [finishing, setFinishing] = useState(0);

  useEffect(() => {}, [finishing]);

  // Show a confirmation to user to make sure they actually want to clear a table
  function cancelReservation(reservation_id) {
    var answer = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );
    if (answer) {
      setFinishing(reservation_id);
      onConfirm(reservation_id);
    } else return;
  }

  // User confirmed the reservation is to be cancelled
  function onConfirm(reservation_id) {
    updateReservationStatus({
      reservation_id: reservation_id,
      status: "cancelled",
    }).then(() => updateCallback());
  }

  // Map the reservations to an array for display
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
        <td>
          {status !== "cancelled" && (
            <button
              type="button"
              data-reservation-id-cancel={reservation_id}
              className="btn btn-secondary"
              title="Cancel Reservation"
              onClick={(e) => cancelReservation(reservation_id)}
            >
              <span>Cancel</span>
            </button>
          )}
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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

// Show the status of a given reservation
function ReservationStatus({ status, reservation_id }) {
  if (status === "booked") {
    return (
      <>
        <td data-reservation-id-status={reservation_id}>booked</td>
        <td>
          <Link
            to={"/reservations/" + reservation_id + "/seat"}
            href={"/reservations/" + reservation_id + "/seat"}
          >
            <button
              type="button"
              className="btn btn-secondary"
              title="Seat this reservation"
            >
              <span>Seat</span>
            </button>
          </Link>
        </td>
        <td>
          <Link
            to={"/reservations/" + reservation_id + "/edit"}
            href={"/reservations/" + reservation_id + "/edit"}
          >
            <button
              type="button"
              className="btn btn-secondary"
              title="Edit this reservation"
            >
              <span>Edit</span>
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
        <td></td>
      </>
    );
  }
  return null;
}

export default ReservationList;
