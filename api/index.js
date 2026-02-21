import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import evaluateData from '../schedule.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(request, response) {
  const { today_intervals, tomorrow_intervals } = await evaluateData();

  const formatRows = (interval) => {
    if (interval.length === 0) {
      return '<tr class="no-schedule-row"></tr>';
    }

    return interval.map(({ start, end }) => `
      <tr class="time-row">
        <td>${start}</td>
        <td>${end}</td>
      </tr>
    `).join('');
  };

  const formatTomorrow = (interval) => {
    if (interval.length === 0) {
      return `
        <div class="no-schedule">
          <div class="icon">💡</div>
          <p>Немає графіку на цей день</p>
        </div>
      `;
    }
    
    return `
      <table class="schedule-table">
        <thead>
          <tr>
            <th>Початок</th>
            <th>Кінець</th>
          </tr>
        </thead>
        <tbody>
          ${interval.map(({ start, end }) => `
            <tr>
              <td>${start}</td>
              <td>${end}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  const templatePath = join(__dirname, '..', 'public', 'template.html');
  const template = readFileSync(templatePath, 'utf-8');

  const formatted = template
    .replace('{{today}}', formatRows(today_intervals))
    .replace('{{tomorrow}}', formatTomorrow(tomorrow_intervals));

  response.setHeader('Content-Type', 'text/html');
  response.status(200).send(formatted);
}
