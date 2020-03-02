import moment from 'moment';
import emojiRegexLib from 'emoji-regex';

export const emojiRegex = emojiRegexLib();

export function returnSorted(obj, sortFn) {
  const output = [];
  Object.keys(obj).forEach(k => {
    if (sortFn) obj[k].sort(sortFn);
    obj[k].forEach(d => {
      output.push(d);
    });
  });
  return output;
}

export function enumerateDaysBetweenDates(startDate, endDate) {
  const mStartDate = moment(startDate);
  const mEndDate = moment(endDate);

  const now = mStartDate;
  const dates = [];

  while (now.isBefore(mEndDate) || now.isSame(mEndDate)) {
    dates.push(now.format('YYYY-MM-DD'));
    now.add(1, 'days');
  }
  return dates;
}
