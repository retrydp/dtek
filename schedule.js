const API_URL = 'https://dtek-api.svitlo-proxy.workers.dev/';
const REGION = 'dnipro-dnem';
const GROUP = '3.2';

const getData = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const { body } = await response.json();
  return JSON.parse(body.replaceAll(`\"`, '"'));
};

const buildIntervals = (schedule) =>
  schedule.reduce(
    (state, { label, action }, idx, arr) => {
      const rules = [
        {
          condition: () => action === 2 && state.state === 'off',
          apply: () => ({
            ...state,
            state: 'on',
            currentStart: label,
            lastLabel: label,
          }),
        },
        {
          condition: () => action !== 2 && state.state === 'on',
          apply: () => ({
            intervals: [
              ...state.intervals,
              { start: state.currentStart, end: label },
            ],
            state: 'off',
            currentStart: null,
            lastLabel: label,
          }),
        },
        {
          condition: () =>
            idx === arr.length - 1 &&
            state.state === 'on' &&
            state.currentStart,
          apply: () => ({
            intervals: [
              ...state.intervals,
              { start: state.currentStart, end: label },
            ],
            state: 'off',
            currentStart: null,
            lastLabel: label,
          }),
        },
      ];

      const rule = rules.find((r) => r.condition());
      return rule ? rule.apply() : { ...state, lastLabel: label };
    },
    { intervals: [], state: 'off', currentStart: null, lastLabel: null },
  ).intervals;
const evaluateData = async () => {
  try {
    const data = await getData();
    const region = data.regions.find((r) => r.cpu === REGION);
    if (!region) throw new Error(`Region "${REGION}" not found`);
    const groupSchedule = region.schedule[GROUP];
    if (!groupSchedule) throw new Error(`Group "${GROUP}" not found`);

    const scheduleMapped = Object.entries(groupSchedule).map(
      ([date, value]) => ({
        date,
        schedule: Object.entries(value).map(([label, action]) => ({
          label,
          action,
        })),
      }),
    );

    const todaySchedule = scheduleMapped[0]?.schedule ?? [];
    const tomorrowSchedule = scheduleMapped[1]?.schedule ?? [];

    const todayIntervals = buildIntervals(todaySchedule);
    const tomorrowIntervals = buildIntervals(tomorrowSchedule);

    return {
      today_schedule: todaySchedule,
      tomorrow_schedule: tomorrowSchedule,
      today_intervals: todayIntervals,
      tomorrow_intervals: tomorrowIntervals,
    };
  } catch (err) {
    console.error('Error:', err.message);
    return {
      today_schedule: [],
      tomorrow_schedule: [],
      today_intervals: [],
      tomorrow_intervals: [],
    };
  }
};

export default evaluateData;