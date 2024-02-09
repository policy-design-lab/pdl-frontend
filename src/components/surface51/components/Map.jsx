import React from "react";
import { useEffect, useState } from "react";
import MapControls from "./MapControls";
import MapDisplay from "./MapDisplay";
import ReactToolTip from "react-tooltip";
import "../scss/index.scss";

const Map = () => {
  const [year, setYear] = useState(2014);
  const [cropTypes, setCropTypes] = useState([]);
  const [crop, setCrop] = useState("");
  const [stateTypes, setStateTypes] = useState([]);
  const [state, setState] = useState("");
  const [tooltipContent, setTooltipContent] = useState("");

  useEffect(() => {
    setState("all");
  }, []);

  return (
    <section className="map-container container">
      <MapControls
        crop={crop}
        cropTypes={cropTypes}
        setCrop={setCrop}
        setState={setState}
        setYear={setYear}
        state={state}
        stateTypes={stateTypes}
        year={year}
      />
      <hr />
      <MapDisplay
        crop={crop}
        setStateTypes={setStateTypes}
        setCropTypes={setCropTypes}
        setState={setState}
        state={state}
        year={year}
        setTooltipContent={setTooltipContent}
      />
      <ReactToolTip>{tooltipContent}</ReactToolTip>
      <hr />
    </section>
  );
};

export default Map;
