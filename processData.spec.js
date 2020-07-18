const { transformStatesData } = require('./processData');

const mockData = [
  {
    state: 'Andaman and Nicobar Islands',
    active: '46',
    discharged: '130',
    deceased: '0',
    total: '176',
  },
  {
    state: 'Andhra Pradesh',
    active: '16621',
    discharged: '18378',
    deceased: '452',
    total: '35451',
  },
];

const nextDayMockData = mockData.map((data) => ({
  state: data.state,
  active: String(Number(data.active) + 50),
  discharged: String(Number(data.discharged) + 20),
  deceased: String(Number(data.deceased) + 5),
  total: String(Number(data.total) + 50),
}));

const thirdDayMockDate = nextDayMockData.map((data) => ({
  state: data.state,
  active: String(Number(data.active) + 30),
  discharged: String(Number(data.discharged) + 10),
  deceased: String(Number(data.deceased) + 2),
  total: String(Number(data.total) + 25),
}));

describe('Processes input correctly', () => {
  it('Stores correctly for the first time', () => {
    const date = new Date(1594970387627);
    const newStatsObj = transformStatesData(mockData, date, {});
    expect(newStatsObj).toMatchSnapshot();
  });
  it('Appends statsObj for the next day when previous day has no delta', () => {
    const date = new Date(1594970387627);
    const dateTomorrow = new Date(1595058097304);
    const firstDayStatsObj = transformStatesData(mockData, date, {});
    const appendedStatsObj = transformStatesData(
      nextDayMockData,
      dateTomorrow,
      firstDayStatsObj,
    );
    expect(appendedStatsObj).toMatchSnapshot();
  });
  it('Appends statsObj for the next day when previous day has delta', () => {
    const date = new Date(1594970387627);
    const dateTomorrow = new Date(1595058097304);
    const dateThirdDay = new Date(1595152388171);
    const firstDayStatsObj = transformStatesData(mockData, date, {});
    const secondDayStatsObj = transformStatesData(
      nextDayMockData,
      dateTomorrow,
      firstDayStatsObj,
    );
    const thirdDayStatsObj = transformStatesData(
      thirdDayMockDate,
      dateThirdDay,
      secondDayStatsObj,
    );
    expect(thirdDayStatsObj).toMatchSnapshot();
  });
});
