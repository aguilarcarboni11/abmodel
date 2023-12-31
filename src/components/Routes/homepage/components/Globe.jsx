import React, {useEffect, useRef, useState} from 'react'
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import * as d3 from "d3-scale"
import ReactGlobe from 'react-globe.gl';

function Globe({globeIsReady}) {
  const {height, width} = useWindowDimensions()
  const globeEl = useRef(undefined);
  const [activePoint, setActivePoint] = useState([])

  const filters = [
    {
      name: 'Points',
    },
    {
      name: 'Rings',
    },
    {
      name: 'Heatmap',
    },
  ]

  const [quakes, setQuakes] = useState([])
  const [activeFilters, setActiveFilters] = useState(
    new Array(3).fill(true)
  );

  const colorScale = d3.scaleOrdinal(['orangered', 'mediumblue', 'darkgreen', 'yellow']);

  const options = {
    focusAnimationDuration: 2000,
    focusEasingFunction: ['Linear', 'None'],
    ambientLightColor: 'white',
  };

  function onGlobeReady() {
    globeIsReady();
  }

  function onPointClick(d) {
    if (activePoint.length === 0) {
      globeEl.current.pointOfView({lat: d.lat, lng: d.lng, altitude: 1})
      setActivePoint(activePoint => [...activePoint, d]);
    } else {
      globeEl.current.pointOfView({lat: d.lat, lng: d.lng, altitude: 3})
      setActivePoint([])
    }
  }

  const handleOnChange = (position) => {
    const updatedCheckedState = activeFilters.map((item, index) =>
      index === position ? !item : item
    );
    setActiveFilters(updatedCheckedState);
  };

  useEffect(() => {
    // set viewport settings
    globeEl.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 3}); 

    // set globe settings
    globeEl.current.controls().autoRotateSpeed = 0.5;

    // populate data array
    let jsonData = require('../assets/superficial_moonquake_locations.json')
    setQuakes(jsonData)
  },[])

  const pointsData = [...quakes].map((element) => ({
    label: element.label,
    lat: element.lat,
    lng: element.lng,
    magnitude: element.magnitude,
    year: element.year,
    day: element.day,
    hour: element.hour,
    minute: element.minute,
    second: element.second
  }));


  const ringsData = [...quakes].map((element) => ({
    label: element.label,
    lat: element.lat,
    lng: element.lng,
    magnitude: element.magnitude,
    year: element.year,
    day: element.day,
    hour: element.hour,
    minute: element.minute,
    second: element.second,
  }))

  return (
    <div className='globeContainer'>
      <div className='filtersContainer'>
        {filters.map((el, index) => (
          <div key = {index} className='button'>
            <label>{el.name}: </label>
            <input
              type="checkbox"
              name={el.name}
              value={el.name}
              checked={activeFilters[index]}
              onChange={() => handleOnChange(index)}
            />
          </div>
        ))}
      </div>
      {activePoint.length !== 0 ? 
      <div className='popup'>
          {activePoint.map((el,index)=> (
            <div key={index}>
              <p className='subtitle'>Label: {el.label.slice(0,4)}</p>
              <p className='subtitle'>Magnitude: {el.magnitude}</p>
              <p className='subtitle'>Latitude: {el.lat}</p>
              <p className='subtitle'>Longitude: {el.lng}</p>
              <p className='subtitle'>Agency: {el.agency}</p>
              <p className='subtitle'>Date: {el.date}</p>
              <a href={el.url}>Wikipedia site</a>
            </div>
          ))}
      </div>:''}
      <ReactGlobe
        globeImageUrl={"//unpkg.com/globe.gl/example/moon-landing-sites/lunar_surface.jpg"}
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        backgroundColor = "#000000"
        options={options}
        height = {height}
        width={width}

        showGlobe={true}
        showAtmosphere={true}
        ref={globeEl}
        animateIn={true}
        waitForGlobeReady={true}
        onGlobeReady={onGlobeReady}

        pointsData={activeFilters[0] ? pointsData:[]}
        labelSize={1.7}
        pointRadius={1}
        pointAltitude={0}
        pointColor={d => colorScale(d.agency)}
        pointLabel={d => `<div><b>${d.label}</b></div>`}
        onPointClick = {d => onPointClick(d)}

        ringsData={activeFilters[1] ? ringsData:[]}
        ringColor={d => colorScale(d.agency)}
        ringMaxRadius = {d => d.magnitude * 2}
        ringPropagationSpeed = {d => d.magnitude}
      />
    </div>
  )}

export default Globe