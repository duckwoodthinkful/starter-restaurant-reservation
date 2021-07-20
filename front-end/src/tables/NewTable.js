import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

// Function to handle creating a new table
function NewTable() {
  const history = useHistory();

  const [table, setTable] = useState({
    table_name: "",
    capacity: 0,
  });

  // Handle parameter input changes
  function changeHandler({ target: { name, value, type } }) {
    if (type === "number") value = Number(value);
    setTable((previousTable) => ({
      ...previousTable,
      [name]: value,
    }));
  }

  // Validate the parameters
  function validateForm() {
    let message = "";

    if (table.table_name.length < 2) {
      message += "\ntable_name must have a length of at least 2.";
    }

    if (table.capacity < 1) {
      message += "\nCapacity must be at least 1.";
    }

    if (message !== "") {
      setError({ message: message });
      return false;
    }

    return true;
  }

  const [error, setError] = useState(null);

  // Handle submitting the form
  function handleSubmit(event) {
    event.preventDefault();

    // Clear any previous errors
    setError(null);
    if (validateForm()) {
      createTable(table)
        .then(() => {
          history.push("/");
        })
        .catch(setError);
    } else {
      return;
    }
  }

  // Handle returing to previous page on cancel
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
        <label htmlFor="table_name">
          Table Name:
          <input
            id="table_name"
            type="text"
            name="table_name"
            onChange={changeHandler}
            value={table.table_name}
          />
        </label>
        <label htmlFor="capacity">
          Capacity:
          <input
            id="capacity"
            type="number"
            name="capacity"
            min="1"
            onChange={changeHandler}
            value={table.capacity}
          />
        </label>
        <button type="submit">Submit</button>
        <CancelButton />
      </form>
    </main>
  );
}

export default NewTable;
