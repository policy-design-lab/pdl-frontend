import React from "react";

import { renderToStaticMarkup } from "react-dom/server";
import { useEffect, useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import { csv, json } from "d3-fetch";
import { geoCentroid } from "d3-geo";
import allStates from "../data/allstates.json";

const colorScale = scaleQuantize()
  .domain([0, 100])
  .range([
    "#D9ED92",
    "#B5E48C",
    "#99D98C",
    "#76C893",
    "#52B69A",
    "#34A0A4",
    "#168AAD",
    "#1A759F",
    "#1E6091",
    "#184E77",
  ]);

const benchmark_ratio = 0.86;

const MapDisplay = ({ year, crop, state, setState, setTooltipContent }) => {
  const [data, setData] = useState([]);
  const [stateGeo, setStateGeo] = useState([]);
  const [geo, setGeo] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [yearData, setYearData] = useState({});
  const [center, setCenter] = useState([-96, 37.8]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [stateGeoData, setStateGeoData] = useState([]);

  const updateTooltip = ({ countyName, arcPay, dataPresent }) => {
    let content = (
      <div className="tooltip-container">
        <div className="tooltip-header">{countyName}</div>
        {dataPresent ? (
          <div className="tooltip-body">
            <p className="year">
              <b>Year:</b> {year}
            </p>
            <p className="payment">
              <b>ARC-CO Adjusted Payment Rate: </b>
              {arcPay}
            </p>
          </div>
        ) : (
          <div className="tooltip-body">No Data Available</div>
        )}
      </div>
    );
    setTooltipContent(renderToStaticMarkup(content));
  };

  useEffect(() => {
    json("assets/json/counties-10m.json").then((data) => {
      setGeo(data);
      console.log("Geo county data loaded!");
    });
  }, []);

  useEffect(() => {
    json("assets/json/states-10m.json").then((data) => {
      setStateGeo(data);
      console.log("Geo state data loaded!");
    });
  }, []);

  useEffect(() => {
    const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020];
    const promises = years.map((year) =>
      csv(`assets/csv/all_${year}.csv`).then((data) => {
        return data;
      })
    );
    Promise.all(promises).then((results) => {
      // Create an object with the year as the key and the data as the value
      results = results.reduce((acc, result, index) => {
        acc[years[index]] = result;
        return acc;
      }, {});

      setYearData({
        ...yearData,
        ...results,
      });

      setData(results[year]);
      setLoaded(true);
      console.log("Yearly data loaded!");
    });
  }, []);

  useEffect(() => {
    // Wait for the data to be fetched
    if (!loaded) return;
    setData(yearData[year]);
  }, [year]);

  useEffect(() => {
    if (!loaded) return;
    if (crop === "") {
      return;
    }
  }, [crop, loaded]);

  useEffect(() => {
    if (!stateGeoData || !state) {
      return;
    }

    if (state === "all") {
      setCenter([-96, 37.8]);
      setZoomLevel(1);
      return;
    }

    const geoID = allStates.find((s) => s.id === state);
    const geo = stateGeoData.find((s) => s.id === geoID.val);

    if (geo) {
      const centroid = geoCentroid(geo);
      setCenter(centroid);
      setZoomLevel(3);
    }
  }, [stateGeoData, state]);

  return (
    <div data-tip="" data-html={true} className="map-wrapper">
      <div className="key">
        <div className="key-title">ARC-CO Adjusted Payment Rate</div>
        <div className="key-colors"></div>
      </div>
      <div className="btn-group">
        <button
          className="btn btn-zoom-out"
          onClick={() => setZoomLevel(zoomLevel - 0.5)}
          disabled={zoomLevel <= 1}
        >
          <div className="sr-only">Zoom Out</div>
        </button>
        <button
          className="btn btn-zoom-in"
          onClick={() => setZoomLevel(zoomLevel + 0.5)}
          disabled={zoomLevel >= 3}
        >
          <div className="sr-only">Zoom In</div>
        </button>
      </div>
      <ComposableMap projection="geoAlbersUsa" className="map-display">
        <ZoomableGroup
          center={center}
          zoom={zoomLevel}
          onMoveEnd={(zoom) => {
            setCenter(zoom.coordinates);
            setZoomLevel(zoom.zoom);
          }}
        >
          <Geographies geography={geo} borders={"#fff"}>
            {({ geographies }) => {
              return geographies.map((g) => {
                const cur = data.find((s) => s.fips === g.id);

                let arc_pay = null;
                let found = false;

                if (cur && cur.crop === crop) {
                  if (cur.crop !== crop) {
                    found = false;
                  } else {
                    const benchmark_rev = cur.bchmk * cur.bchmk_prc;
                    const guarantee = benchmark_rev * benchmark_ratio;
                    const max_pay = benchmark_rev * 0.1;
                    const act_rev = cur.act_yld * cur.nat_prc;
                    const form = Math.max(guarantee - act_rev, 0);
                    arc_pay = Math.min(max_pay, form);
                    found = true;
                  }
                }

                return (
                  <Geography
                    key={g.rsmKey}
                    className="county"
                    geography={g}
                    fill={
                      found && arc_pay >= 0 ? colorScale(arc_pay) : "#F2F2F2"
                    }
                    onMouseEnter={() => {
                      if (
                        state === "all" ||
                        allStates.some(
                          (s) =>
                            s.id === state && s.val == Math.floor(g.id / 1000)
                        )
                      ) {
                        updateTooltip(
                          found
                            ? {
                                countyName: g.properties.name,
                                arcPay: `$${arc_pay.toFixed(2)}`,
                                dataPresent: true,
                              }
                            : {
                                countyName: g.properties.name,
                                arcPay: "N/A",
                                dataPresent: false,
                              }
                        );
                      }
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    stroke={found && arc_pay >= 0 ? "#000" : "#FFF"}
                    style={
                      state === "all" ||
                      allStates.some(
                        (s) =>
                          s.id === state && s.val == Math.floor(g.id / 1000)
                      )
                        ? {
                            default: {
                              fill:
                                found && arc_pay >= 0
                                  ? colorScale(arc_pay)
                                  : "#F2F2F2",
                              stroke:
                                found && arc_pay >= 0
                                  ? "#000"
                                  : "rgb(72, 72, 72)",
                              strokeWidth: found && arc_pay >= 0 ? 0.2 : 0.2,
                              outline: "none",
                            },
                            hover: {
                              stroke: "#000",
                              strokeWidth: 0.5,
                              outline: "none",
                            },
                            pressed: {
                              stroke: "#000",
                              strokeWidth: 0.5,
                              outline: "none",
                            },
                          }
                        : {
                            default: {
                              fill: "transparent",
                              stroke: "transparent",
                              strokeWidth: 0.1,
                              outline: "none",
                            },
                            hover: {
                              fill: "transparent",
                              stroke: "transparent",
                              strokeWidth: 0.5,
                              outline: "none",
                            },
                            pressed: {
                              fill: "transparent",
                              stroke: "transparent",
                              strokeWidth: 0.5,
                              outline: "none",
                            },
                          }
                    }
                  />
                );
              });
            }}
          </Geographies>
          <Geographies
            geography={stateGeo}
            style={zoomLevel < 2 ? { display: "block" } : { display: "none" }}
          >
            {({ geographies }) => {
              setStateGeoData(geographies);
              return (
                <>
                  {geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className="state"
                      style={{
                        default: {
                          fill: "transparent",
                          stroke: "#000",
                          strokeWidth: 0.75,
                          outline: "none",
                        },
                        hover: {
                          fill: "#000",
                          fillOpacity: 0.2,
                          stroke: "#000",
                          strokeWidth: 0.75,
                          outline: "none",
                        },
                        pressed: {
                          fill: "#000",
                          outline: "none",
                        },
                      }}
                    />
                  ))}
                </>
              );
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default memo(MapDisplay);
