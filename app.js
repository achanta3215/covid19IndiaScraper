#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const { transformStatesData, getStatsKeyFromDate } = require('./processData');
const homedir = require('os').homedir();
const path = require('path');

/** @type {import('./definitions').StatsObj} */
let statsObjData = {};
let isStatsLoaded = false;

const covidStatsDir = './covidScrapper';
const covidStatsFile = `${covidStatsDir}/covidIndiaStats.json`;
fs.readFile(
  covidStatsFile,
  { encoding: 'utf8', flag: 'a+' },
  (err, jsonString) => {
    if (err) {
      console.log('File read failed:', err);
      return;
    }
    try {
      statsObjData = JSON.parse(jsonString || '{}');
      isStatsLoaded = true;
    } catch (e) {
      console.log(`Error parsing ${e}`);
    }
  },
);

/**
 * @param {import("puppeteer").Page} page
 */
const preparePageForTests = async (page) => {
  // Pass the User-Agent Test.
  const userAgent =
    'Mozilla/5.0 (X11; Linux x86_64)' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
  await page.setUserAgent(userAgent);
};

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    // devtools: true,
  });
  try {
    const page = await browser.newPage();
    await preparePageForTests(page);
    await page.goto('https://www.mygov.in/covid-19');
    await page.waitForSelector('#state-covid-data tr');
    const statesData = await page.evaluate(async () => {
      const statesQuery = document.querySelectorAll('#state-covid-data tr');
      console.log(Array.from(statesQuery));
      return Array.from(statesQuery)
        .map((states) => ({
          state: states.children[0] && states.children[0].innerHTML,
          active: states.children[2] && states.children[2].innerHTML,
          discharged: states.children[3] && states.children[3].innerHTML,
          deceased: states.children[4] && states.children[4].innerHTML,
          total: states.children[1] && states.children[1].innerHTML,
        }))
        .map((states) => {
          const stateKeys = ['state', 'active', 'discharged', 'deceased', 'total'];
          const returnData = (/** @type {{state: string, active: string, discharged: string, deceased: string, total: string }} */ (stateKeys.reduce((_sanitizedStates, stateKey) => ({
            ..._sanitizedStates,
            // @ts-ignore
            [stateKey]: states[stateKey].replace(/,/g, ''),
          }), {})));
          return returnData;
        })
        .filter((data) => Boolean(data.state));
    });
    const today = new Date();
    const statsObjTodayKey = getStatsKeyFromDate(today);
    if (!isStatsLoaded) {
      console.log('Unable to load stats file');
      process.exit(0);
    }
    if (statsObjData[statsObjTodayKey]) {
      console.log(`Data for today ${statsObjTodayKey} already exists`);
      console.log('Exiting');
      process.exit(0);
    }
    const transformedStatsObj = transformStatesData(
      statesData,
      today,
      statsObjData,
    );
    fs.writeFile(covidStatsFile, JSON.stringify(transformedStatsObj), () => {});
    const newStatsObj = transformedStatsObj[statsObjTodayKey];
    fs.writeFile(
      `${covidStatsDir}/dateWiseStats_${statsObjTodayKey}.json`,
      JSON.stringify(newStatsObj),
      () => {},
    );
  } catch(e){
    console.log(e);
  }
  finally {
    browser.close();
  }
})();

module.exports = {
  transformStatesData,
};
