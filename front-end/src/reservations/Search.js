import React, { useState } from "react";
import { findReservationsByMobileNumber } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../layout/ReservationList";

function SearchReservation() {

  const [reservations, setReservations] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    mobile_number: "",
  });

  function changeHandler({ target: { name, value, type } }) {
    if (type === "number") value = Number(value);
    setSearchCriteria((previousSearchCriteria) => ({
      ...previousSearchCriteria,
      [name]: value,
    }));
  }

  function validateForm() {
    let message = "";

    if (message !== "") {
      setError({ message: message });
      return false;
    }

    return true;
  }

  const [error, setError] = useState(null);

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

  function handleSubmit(event) {
    event.preventDefault();
    // Clear any previous errors
    setError(null);
    if (validateForm()) {
      console.log("Search for reservations");
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
      <ReservationList reservations={reservations} updateCallback={findReservations}/>
    </main>
  );
}

export default SearchReservation;
