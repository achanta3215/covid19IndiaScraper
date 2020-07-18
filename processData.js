/** @typedef {import('./definitions').StateData} StatesData */
/** @param { import('./definitions').Normalized<StatesData, 'state'>[0] } normalizedStatesData
 * @param {import('./definitions').NormaliedStatsForDay} statsForYesterday
 * @param {string} state
 * @return {import('./definitions').StateData}
 */
const getDelta = (normalizedStatesData, statsForYesterday, state) => {
  return {
    state,
    active: String(
      Number(normalizedStatesData[state].active) -
        Number(statsForYesterday[state].active),
    ),
    discharged: String(
      Number(normalizedStatesData[state].discharged) -
        Number(statsForYesterday[state].discharged),
    ),
    total: String(
      Number(normalizedStatesData[state].total) -
        Number(statsForYesterday[state].total),
    ),
    deceased: String(
      Number(normalizedStatesData[state].deceased) -
        Number(statsForYesterday[state].deceased),
    ),
  };
};

/** @type { <T, K extends keyof T>(obj: T[], params: K) => [{[x: string]: T}, T[K][]]} */
const simplyNormalize = (arrayOfData, key) => {
  const normalizedObj = arrayOfData.reduce(
    (acc, val) => ({
      ...acc,
      [val[key]]: val,
    }),
    {},
  );
  const entities = arrayOfData.map((data) => data[key]);
  return [normalizedObj, entities];
};

/** @param {Date} today
 * @return {Date}
 */
const getYesterday = (today) => {
  const yesterday = new Date(today.getTime());
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
};

/** @param {Date} date
 */

const getStatsKeyFromDate = (date) => {
  return date.toLocaleDateString().replace(/\//g, '');
};

/** @param {import('./definitions').StateData[]} statesData
 * @param {Date} today
 * @param {import('./definitions').StatsObj} statsObj
 * @return {import('./definitions').StatsObj}
 */
const transformStatesData = (statesData, today, statsObj) => {
  const yesterday = getYesterday(today);
  const [normalizedStatesData, statesList] = simplyNormalize(
    statesData,
    'state',
  );
  const statsForYesterday = statsObj[getStatsKeyFromDate(yesterday)];
  if (!statsForYesterday) {
    return {
      ...statsObj,
      [getStatsKeyFromDate(today)]: normalizedStatesData,
    };
  }
  const transformedData = statesList.reduce(
    (acc, state) => ({
      ...acc,
      [state]: {
        ...normalizedStatesData[state],
        delta: getDelta(normalizedStatesData, statsForYesterday, state),
      },
    }),
    {},
  );
  return {
    ...statsObj,
    [getStatsKeyFromDate(today)]: transformedData,
  };
};

module.exports = {
  transformStatesData: transformStatesData,
  getStatsKeyFromDate: getStatsKeyFromDate,
};
