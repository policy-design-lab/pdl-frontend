import React from 'react';
import state_distribution from '../../data/snap/snap_state_distribution_data.json';


/**
 * 
 * @param state_distribution 
 * @returns ["2018":[{"California":[...]},{"Texas":[...]}]]
 */
export function year_transpose(state_distribution){
  const year_keys = [
    "2018",
    "2019",
    "2020",
    "2021",
    "2022",
    "2018-2022"
  ]
  const result_data = [];
  Object.keys(state_distribution).forEach(state => {
    console.log(bigObject[key])
  })
  return result_data;
}
