import React from "react";
import ReactDOM from "react-dom";
import Button from "@material-ui/core/Button";
import Discoverer from "./my_modules/TMDBDiscover";
import API_KEY from "./configs/API_KEY";

const disc = new Discoverer(API_KEY);
disc.addFilter("person", "=", "Tom Cruise");
disc.addSort("popularity", "desc");
disc.page = 1;
disc.run(response => {
  console.log(response);
});

function App() {
  return (
    <Button variant="contained" color="primary">
      Hello World
    </Button>
  );
}

ReactDOM.render(<App />, document.querySelector("#app"));
