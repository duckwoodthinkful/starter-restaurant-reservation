import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { listTables } from "../utils/api";

function NewSeat() {
  const history = useHistory();

  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  const [options, setOptions] = useState([]);

  const [seat, setSeat] = useState({
    table_id: null,
  });

  useEffect(() => {
    loadTables();
  }, []);


  useEffect(() => {
    setOptions(tables.map(({ table_name, capacity }) => `${table_name} - ${capacity}`));
  }, [tables]);

  function changeHandler({ target: { name, value } }) {
    setSeat((previousSeat) => ({
      ...previousSeat,
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

  function handleSubmit(event) {
    event.preventDefault();
    // Clear any previous errors
    setError(null);
    // if (validateForm()) {
    //   createSeat(seat)
    //     .then(() => {
    //       history.push("/");
    //     })
    //     .catch(setError);
    // } else {
    //   return;
    // }
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
    setTablesError(null);

    listTables({}, abortController.signal)
      .then(setTables)
      .catch(setTablesError);
    return () => abortController.abort();
  }

  return (
    <main>
      <ErrorAlert error={error} />
      <select name="table_id" onChange={changeHandler}>
        {" "}
        <option value="hello">hello</option>{" "}
      </select>
      <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
        <CancelButton />
      </form>
    </main>
  );
}

export default NewSeat;
