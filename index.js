import Fastify from 'fastify';
import evaluateData from './schedule.js';
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

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});