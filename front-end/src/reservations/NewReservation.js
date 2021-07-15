import React, { useState } from "react";
import { useHistory } from "react-router-dom";
// import { today } from "../utils/date-time";
import { createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function NewReservation() {
  const history = useHistory();

  const [reservation, setReservation] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: new Date().toISOString().slice(0,10),
    reservation_time: "",
    people: 1,
  });

  function changeHandler({ target: { name, value, type } }) {
    if (type === "number" )  value = Number(value);
    setReservation((previousReservation) => ({
      ...previousReservation,
      [name]: value,
    }));
  }

  function validateForm() {
    const aReservationDay = new Date(reservation.reservation_date+" "+reservation.reservation_time);
    // console.log("aReservationDay=", aReservationDay)
    const dayWeek = aReservationDay.getDay();
    // console.log("dayWeek=", dayWeek);
    let message = "";
    if ((Date.parse(aReservationDay) - Date.now()) < 0)
    {
      message += "\nReservation must be in the future.";
    }

    if (dayWeek === 2) {
      message += "\nRestaurant is closed on Tuesdays.";
    }

    var startBusinessHours = new Date(reservation.reservation_date+" "+reservation.reservation_time);
    startBusinessHours.setHours(10,30,0); // 10:30 am is when restaraunt opens
    // console.log("startH=", startBusinessHours);
    var endBusinessHours = new Date(reservation.reservation_date+" "+reservation.reservation_time);
    endBusinessHours.setHours(21,30,0); // 9:30 pm latest reservation
    // console.log("endH=", endBusinessHours);
    // console.log(aReservationDay);
    
    if(!(aReservationDay >= startBusinessHours && aReservationDay < endBusinessHours )){
      message += "\nReservation must be between 10:30 am and 9:30 pm."
    }

    if (message !== "")
    {
      setError({message: message});
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
      createReservation(reservation)
        .then(() => {
          console.log ("pushing history - ", reservation.reservation_date);
          history.push("/dashboard/?date="+reservation.reservation_date);
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
  return (
    <main>
      <ErrorAlert error={error} />
      <form onSubmit={handleSubmit}>
        <label htmlFor="first_name">
          First Name:
          <input
            id="first_name"
            type="text"
            name="first_name"
            onChange={changeHandler}
            value={reservation.first_name}
          />
        </label>
        <label htmlFor="last_name">
          Last Name:
          <input
            id="last_name"
            type="text"
            name="last_name"
            onChange={changeHandler}
            value={reservation.last_name}
          />
        </label>
        <label htmlFor="mobile_number">
          Mobile Number:
          <input
            id="mobile_number"
            type="text"
            name="mobile_number"
            onChange={changeHandler}
            value={reservation.mobile_number}
          />
        </label>
        <label htmlFor="reservation_date">
          Date of Reservation:
          <input
            id="reservation_date"
            type="date"
            name="reservation_date"
            onChange={changeHandler}
            value={reservation.reservation_date}
          />
        </label>
        <label htmlFor="reservation_time">
          Time of Reservation:
          <input
            id="reservation_time"
            type="time"
            name="reservation_time"
            onChange={changeHandler}
            value={reservation.reservation_time}
          />
        </label>
        <label htmlFor="people">
          Number of People in Party:
          <input
            id="people"
            type="number"
            min="1"
            name="people"
            onChange={changeHandler}
            value={reservation.people}
          />
        </label>
        <button type="submit">Submit</button>
        <CancelButton />
      </form>
    </main>
  );
}

export default NewReservation;
