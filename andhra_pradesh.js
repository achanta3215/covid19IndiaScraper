#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const { transformStatesData, getStatsKeyFromDate } = require('./processData');
const homedir = require('os').homedir();
const path = require('path');

/** @type {import('./definitions').StatsObj} */
let statsObjData = {};
let isStatsLoaded = false;

const suffix = 'andhra_pradesh';
const covidStatsDir = `./covidScrapper/${suffix}`;
const covidStatsFile = `${covidStatsDir}/covidStats.json`;
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
  const page = await browser.newPage();
  await preparePageForTests(page);
  await page.goto('http://hmfw.ap.gov.in/covid_dashboard.aspx');
  await page.waitForSelector('#section5 tbody tr');
  const districtsData = await page.evaluate(async () => {
    const districtsQuery = document.querySelectorAll('#section5 tbody tr');
    const [_, ...districts] = Array.from(districtsQuery);
    return districts
      .map((district) => {
        const districtDetails = district.querySelectorAll('td span');
        return {
          entityName: district.children[0] && district.children[0].innerHTML,
          total: districtDetails[0] && districtDetails[0].innerHTML,
          discharged: districtDetails[1] && districtDetails[1].innerHTML,
          deceased: districtDetails[2] && districtDetails[2].innerHTML,
          active: '0',
        };
      })
      .filter((data) => Boolean(data.entityName));
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
    districtsData,
    today,
    statsObjData,
    'entityName',
  );
  console.log(transformedStatsObj);
  fs.writeFile(covidStatsFile, JSON.stringify(transformedStatsObj), () => {});
  const newStatsObj = transformedStatsObj[statsObjTodayKey];
  fs.writeFile(
    `${covidStatsDir}/dateWiseStats_${statsObjTodayKey}.json`,
    JSON.stringify(newStatsObj),
    () => {},
  );
  browser.close();
})();

module.exports = {
  transformStatesData,
};
