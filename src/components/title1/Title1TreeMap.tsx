2173668130
import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import {
  ShortFormat,
  ToPercentageString,
  ToDollarString,
} from "../shared/ConvertionFormats";
import PropTypes from "prop-types";
import { getJsonDataFromUrl } from "../../utils/apiutil";



function renderTreemap(data, year) {
  
}

export default function Title1TreeMap(data, year): JSX.Element {
  const rn = React.useRef(null);
  const tooltipRn = React.useRef(null);
  const [content, setContent] = React.useState("");
	const [stateCodesData, setStateCodesData] = React.useState([]);
	const [baseAcresData, setbaseAcresData] = React.useState([]);
	const [BenefitsData, setBenefitsData] = React.useState([]);
  const Styles = styled.div`
    svg {
      font-family: "Roboto", sans-serif;
    }
  `;
  React.useEffect(() => {

		// const statecode_url = `${config.apiUrl}/statecodes`;
		// getJsonDataFromUrl(statecode_url).then((response) => {
		// 	const converted_json = convertAllState(response);
		// 	setStateCodesData(converted_json);
		// });
		// const baseAcres_url = `${config.apiUrl}/baseAcres`;
		// getJsonDataFromUrl(baseAcres_url).then((response) => {
		// 	setbaseAcresData(response);
		// });
		// const Benefits_url = `${config.apiUrl}/states`;
		// getJsonDataFromUrl(Benefits_url).then((response) => {
		// 	setBenefitsData(response);
		// });

    renderTreemap(data, "2018-2022");

    //PENDING: Resize treemap
    // function handleResize() {
    //   setWidth(window.innerWidth * widthPercentage),
    //     setHeight(window.innerWidth * heightPercentage);
    // }
    // window.addEventListener("resize", handleResize);
    // return () => window.removeEventListener("resize", handleResize);
  });

  return (
    <div>
      <h1>Test</h1>
      <Styles>
        <svg ref={rn} id="Title1TreeMap" />
        <div ref={tooltipRn} />
      </Styles>
    </div>
  );
}
