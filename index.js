import Fastify from 'fastify';import evaluateData from './schedule.js';
import fs from 'fs';
const fastify = Fastify({
  logger: true,
});

fastify.get('/', async (request, reply) => {
  const { today_intervals, tomorrow_intervals } = await evaluateData();
  reply.send({ today_intervals, tomorrow_intervals });
});

fastify.get('/schedule', async (request, reply) => {
  const { today_schedule, tomorrow_schedule } = await evaluateData();
  reply.send({ today_schedule, tomorrow_schedule });
});
fastify.get('/page', async (request, reply) => {
  const template = fs.readFileSync('./static/index.html', 'utf-8');
  const stringifiedData = template.toString();
  const { today_intervals, tomorrow_intervals } = await evaluateData();
  const formatIntervals = (interval) => {
    if (interval.length === 0) return 'Немає графіку на цей день';
    const intervalStrings = interval.map(
      ({ start, end }) => `<strong>Початок:</strong> ${start} - <strong>Кінець:</strong> ${end}`,
    );

    return intervalStrings.join('<br>');
  };
  const formatted = stringifiedData
    .replace('{{today}}', formatIntervals(today_intervals))
    .replace('{{tomorrow}}', formatIntervals(tomorrow_intervals));
  reply.header('Content-Type', 'text/html');
  reply.send(formatted);
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});