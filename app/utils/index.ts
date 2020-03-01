import moment from 'moment';
import emojiRegexLib from 'emoji-regex';
import { ipcRenderer } from 'electron';

export const emojiRegex = emojiRegexLib();

export function numberToStr(nbr) {
  return `${nbr < 10 ? '0' : ''}${nbr}`;
}

export function enumerateDaysBetweenDates(startDate, endDate) {
  const mStartDate = moment(startDate);
  const mEndDate = moment(endDate);

  const now = mStartDate;
  const dates = [];

  while (now.isBefore(mEndDate) || now.isSame(mEndDate)) {
    dates.push(Number(now.format('YYYYMMDD')));
    now.add(1, 'days');
  }
  return dates;
}

export function dbDateConvert(nbr) {
  const fullNbr = String(nbr);
  const y = fullNbr.substr(0, 4);
  const m = fullNbr.substr(4, 2);
  const d = fullNbr.substr(6, 2);
  return new Date(`${y}-${m}-${d}`);
}

export function dbDateRevert(date) {
  return Number(
    date
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '')
  );
}

export function dateToWeekCode(date) {
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return Number(`${date.getUTCFullYear()}${numberToStr(weekNo)}`);
}

export function getCurrentWeekCode() {
  const localDate = new Date();
  const UTCDate = new Date(
    Date.UTC(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate()
    )
  );
  UTCDate.setUTCDate(UTCDate.getUTCDate() + 4 - (UTCDate.getUTCDay() || 7));
  return dateToWeekCode(UTCDate);
}

export async function detectDatasetName(files) {
  const firstFile = await ipcRenderer.invoke('readJSON', files[0].path);
  if (firstFile) {
    if (firstFile.participants && firstFile.messages) return 'FB_MESSENGER';
  }
  return null;
}
