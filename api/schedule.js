import evaluateData from '../schedule.js';

export default async function handler(request, response) {
  const { today_intervals, tomorrow_intervals } = await evaluateData();
  response.setHeader('Content-Type', 'application/json');
  response.status(200).send({ today_intervals, tomorrow_intervals });
}
