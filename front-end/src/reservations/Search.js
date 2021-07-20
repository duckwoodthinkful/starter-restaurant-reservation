import React, { useState } from "react";
import { findReservationsByMobileNumber } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../layout/ReservationList";

// Function that allow for searching for a reservation
function SearchReservation() {
  const [reservations, setReservations] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    mobile_number: "",
  });

  // Handle changing of parameter inputs
  function changeHandler({ target: { name, value, type } }) {
    if (type === "number") value = Number(value);
    setSearchCriteria((previousSearchCriteria) => ({
      ...previousSearchCriteria,
      [name]: value,
    }));
  }

  // Validate the search form input parameters
  function validateForm() {
    let message = "";

    if (message !== "") {
      setError({ message: message });
      return false;
    }

    return true;
  }

  const [error, setError] = useState(null);

  // Find the reservations that match the search criteria
  function findReservations() {
    const abortController = new AbortController();
    setError(null);

    findReservationsByMobileNumber(
      { mobile_number: searchCriteria.mobile_number },
      abortController.signal
    )
      .then(setReservations)
      .catch(setError);
    return () => abortController.abort();
  }

  // Handle the submit buttom for the form
  function handleSubmit(event) {
    event.preventDefault();
    // Clear any previous errors
    setError(null);
    if (validateForm()) {
      findReservations();
    } else {
      return;
    }
  }

  return (
    <main>
      <ErrorAlert error={error} />
      <form onSubmit={handleSubmit}>
        <label htmlFor="mobile_number">
          Mobile Number:
          <input
            id="mobile_number"
            type="text"
            name="mobile_number"
            onChange={changeHandler}
            value={searchCriteria.mobile_number}
          />
        </label>
        <button type="submit">Find</button>
      </form>
      <hr />
      <ReservationList
        reservations={reservations}
        updateCallback={findReservations}
      />
    </main>
  );
}

export default SearchReservation;
