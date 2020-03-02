import { ipcMain } from 'electron';
import {
  min as d3Min,
  max as d3Max,
  sum as d3Sum,
  range as d3Range
} from 'd3-array';
import moment from 'moment';

import readJsonStream from '../../utils/readJsonStream';
import { emojiRegex } from '../../utils';

// DATASET
let fbMessengerDataset = null;
let fbMessengerDatasetByYear = null;
let fbMessengerDatasetByDay = null;
let fbMessengerDatasetByPerson = null;

// LOAD
ipcMain.handle('fbMessengerLoadDataset', async (event, files) => {
  fbMessengerDataset = [];
  // Read files using JSON Stream to detect if it's valid conversations
  // => have participants key
  const validJsonPaths = await Promise.all(
    files.map(async f => {
      const haveParticipants = await readJsonStream(
        f,
        'participants.*',
        'latin1'
      );
      const haveThreadType = await readJsonStream(f, 'thread_type', 'latin1');
      return [f, haveParticipants, haveThreadType];
    })
  );

  // Filter only the ones with 2 participants
  const validFiles = validJsonPaths.filter(
    d => d[1].length === 2 && d[2][0] !== 'RegularGroup'
  );

  await Promise.all(
    validFiles.map(async d => {
      // latin-1 because FB dataset is encoded this way
      const messages = await readJsonStream(d[0], 'messages.*', 'latin1');
      // we convert to utf-8
      const person = decodeURIComponent(escape(String(d[1][0].name)));
      const me = decodeURIComponent(escape(String(d[1][1].name)));

      // Push each message in dataset
      messages.forEach(m => {
        const senderName = decodeURIComponent(escape(String(m.sender_name)));
        const content = decodeURIComponent(escape(String(m.content)));
        const emojiMatch = (content || '').match(emojiRegex);
        const date = new Date(m.timestamp_ms);

        const row = {
          person,
          sender: senderName === me ? null : person,
          receiver: senderName !== me ? null : person,
          content,
          countEmoji: emojiMatch && emojiMatch.length ? emojiMatch.length : 0,
          countGif: Array.isArray(m.gifs) ? m.gifs.length : 0,
          countPhoto: Array.isArray(m.photos) ? m.photos.length : 0,
          timestamp: m.timestamp_ms,
          day: date.toISOString().split('T')[0],
          date,
          year: date.getFullYear()
        };
        fbMessengerDataset.push(row);
      });
    })
  );

  // Group by year
  fbMessengerDatasetByYear = {};
  fbMessengerDataset.forEach(d => {
    if (!fbMessengerDatasetByYear[d.year])
      fbMessengerDatasetByYear[d.year] = [];
    fbMessengerDatasetByYear[d.year].push(d);
  });

  // Group by day
  fbMessengerDatasetByDay = {};
  fbMessengerDataset.forEach(d => {
    if (!fbMessengerDatasetByDay[d.day]) fbMessengerDatasetByDay[d.day] = [];
    fbMessengerDatasetByDay[d.day].push(d);
  });

  // Group by person
  fbMessengerDatasetByPerson = {};
  fbMessengerDataset.forEach(d => {
    if (!fbMessengerDatasetByPerson[d.person])
      fbMessengerDatasetByPerson[d.person] = [];
    fbMessengerDatasetByPerson[d.person].push(d);
  });
});

// YEAR ACTIVITY PER DAY
ipcMain.handle('fbMessengerQueryActivityPerDay', (event, year) => {
  if (!fbMessengerDatasetByYear) return null;
  if (!fbMessengerDatasetByYear[year]) return [];

  const groupByDay = {};
  fbMessengerDatasetByYear[year].forEach(d => {
    if (!groupByDay[d.day]) groupByDay[d.day] = [];
    groupByDay[d.day].push(d);
  });

  const output = {};
  Object.keys(groupByDay).forEach(k => {
    output[k] = groupByDay[k].length;
  });

  return output;
});

// ALL ACTIVITY PER YEAR
ipcMain.handle('fbMessengerQueryActivityPerYear', () => {
  if (!fbMessengerDatasetByYear) return null;

  const years = Object.keys(fbMessengerDatasetByYear);
  years.sort();

  const output = {};
  Object.keys(fbMessengerDatasetByYear).forEach(k => {
    output[k] = fbMessengerDatasetByYear[k].length;
  });

  return output;
});

// CHAT LIST
ipcMain.handle('fbMessengerQueryChatList', (event, filters) => {
  if (!fbMessengerDatasetByDay) return null;

  const dataset =
    filters.dayFrom === filters.dayTo && filters.dayTo
      ? fbMessengerDatasetByDay[filters.dayFrom] || []
      : fbMessengerDataset;

  const filterDayFromTime = filters.dayFrom
    ? new Date(filters.dayFrom).getTime()
    : null;
  const filterDayToTime = filters.dayTo
    ? new Date(filters.dayTo).getTime()
    : null;

  const filterFn = d => {
    if (filterDayFromTime && d.timestamp < filterDayFromTime) return false;
    if (filterDayToTime && d.timestamp > filterDayToTime) return false;
    if (filters.person && d.person !== filters.person) return false;
    return true;
  };

  const groupByPerson = {};
  dataset.filter(filterFn).forEach(d => {
    if (!groupByPerson[d.person]) groupByPerson[d.person] = [];
    groupByPerson[d.person].push(d);
  });

  const output = [];
  Object.keys(groupByPerson).forEach(person => {
    output.push({ person, count: groupByPerson[person].length });
  });

  output.sort((a, b) => b.count - a.count);

  return output;
});

// CHAT MESSAGES
ipcMain.handle('fbMessengerQueryChatMessages', (event, filters) => {
  if (!fbMessengerDatasetByPerson) return null;
  if (!filters.person) return null;

  const filterDayFromTime = filters.dayFrom
    ? new Date(filters.dayFrom).getTime()
    : null;
  const filterDayToTime = filters.dayTo
    ? new Date(filters.dayTo).getTime()
    : null;

  const filterFn = d => {
    if (filterDayFromTime && d.timestamp < filterDayFromTime) return false;
    if (filterDayToTime && d.timestamp > filterDayToTime) return false;
    if (filters.person && d.person !== filters.person) return false;
    return true;
  };

  const output = fbMessengerDatasetByPerson[filters.person].filter(filterFn);

  output.sort((a, b) => a.timestamp - b.timestamp);
  return output;
});

// MOST MESSAGES
ipcMain.handle('fbMessengerQueryMostMessaged', (event, year) => {
  if (!fbMessengerDatasetByYear) return null;

  const dataset = year ? fbMessengerDatasetByYear[year] : fbMessengerDataset;

  const groupByPerson = {};
  dataset.forEach(d => {
    if (!groupByPerson[d.person]) groupByPerson[d.person] = [];
    groupByPerson[d.person].push(d);
  });

  const output = [];
  Object.keys(groupByPerson).forEach(person => {
    output.push({ person, count: groupByPerson[person].length });
  });

  output.sort((a, b) => b.count - a.count);

  return output;
});

// YEARS
ipcMain.handle('fbMessengerQueryYears', () => {
  if (!fbMessengerDatasetByYear) return null;
  const years = Object.keys(fbMessengerDatasetByYear);
  const yearMin = d3Min(years);
  return d3Range(yearMin, new Date().getFullYear() + 1, 1);
});

function getStreaks(dataset) {
  const activeDays = new Set();
  dataset.forEach(d => {
    const day = moment(d.timestamp).format('YYYYMMDD');
    if (!activeDays.has(day)) activeDays.add(day);
  });

  const activeDaysArray = Array.from(activeDays);
  activeDaysArray.sort();
  const mStartDate = moment(String(d3Min(activeDaysArray)), 'YYYYMMDD');
  const mEndDate = moment(String(d3Max(activeDaysArray)), 'YYYYMMDD');

  const now = mStartDate;
  let rowNumber = 0;
  const streaks = {};
  let firstDay = null;

  while (now.isBefore(mEndDate) || now.isSame(mEndDate)) {
    const day = now.format('YYYY-MM-DD');
    if (moment(activeDaysArray[rowNumber]).isSame(now)) {
      if (!streaks[firstDay || day]) {
        firstDay = day;
        streaks[firstDay] = 1;
      }
      streaks[firstDay] += 1;
      rowNumber += 1;
    } else {
      firstDay = null;
    }
    now.add(1, 'days');
  }

  let streak = 0;
  let streakFrom = null;
  Object.keys(streaks).forEach(d => {
    if (streaks[d] > streak) {
      streak = streaks[d];
      streakFrom = d;
    }
  });
  return { streak, streakFrom, streaks };
}

// BEST STREAKS
ipcMain.handle('fbMessengerQueryBestStreaks', (event, year) => {
  if (!fbMessengerDatasetByPerson) return null;

  const output = [];
  Object.keys(fbMessengerDatasetByPerson).forEach(person => {
    const dataset = fbMessengerDatasetByPerson[person].filter(d =>
      year ? d.year === year : true
    );
    const { streaks } = getStreaks(dataset);
    Object.keys(streaks).forEach((d, i) => {
      output.push({
        key: `${person}-${i}`,
        person,
        streak: streaks[d],
        streakFrom: d
      });
    });
  });

  output.sort((a, b) => b.streak - a.streak);

  return output.slice(0, 20);
});

// FRIEND PROFILE
ipcMain.handle('fbMessengerQueryFriendProfile', (event, person) => {
  if (!fbMessengerDatasetByPerson) return null;
  if (!fbMessengerDatasetByPerson[person]) return null;

  const dataset = fbMessengerDatasetByPerson[person];

  const emojiSentDict = {};
  const emojiReceivedDict = {};

  dataset
    .filter(d => d.countEmoji > 0)
    .forEach(d => {
      const emojiMatch = (d.content || '').match(emojiRegex);
      if (emojiMatch) {
        emojiMatch.forEach(e => {
          if (d.receiver) {
            if (!emojiReceivedDict[e]) emojiReceivedDict[e] = 0;
            emojiReceivedDict[e] += 1;
          }
          if (d.sender) {
            if (!emojiSentDict[e]) emojiSentDict[e] = 0;
            emojiSentDict[e] += 1;
          }
        });
      }
    });

  const emojiSentSorted = Object.keys(emojiSentDict).sort(
    (a, b) => emojiSentDict[b] - emojiSentDict[a]
  );

  const mostSentEmoji = emojiSentSorted.map(k => [k, emojiSentSorted[k]]);

  const emojiReceivedSorted = Object.keys(emojiReceivedDict).sort(
    (a, b) => emojiReceivedDict[b] - emojiReceivedDict[a]
  );

  const mostReceivedEmoji = emojiReceivedSorted.map(k => [
    k,
    emojiReceivedSorted[k]
  ]);

  const { streak, streakFrom } = getStreaks(dataset);

  return {
    firstMessage: d3Min(dataset.map(d => d.timestamp)),
    messagesSent: dataset.filter(d => !d.sender).length,
    messagesReceived: dataset.filter(d => !d.receiver).length,
    gifSent: d3Sum(dataset.filter(d => !d.sender).map(d => d.countGif)),
    gifReceived: d3Sum(dataset.filter(d => !d.receiver).map(d => d.countGif)),
    mostSentEmoji,
    mostReceivedEmoji,
    streak,
    streakFrom
  };
});

// RATIO SENT
ipcMain.handle('fbMessengerQueryRatioSent', (event, year, type, isGhosters) => {
  if (!fbMessengerDataset) return null;

  const column = {
    gifs: 'countGif',
    photos: 'countPhoto',
    emoji: 'countEmoji'
  };

  const threshold = {
    messages: 30,
    gifs: 1,
    photos: 1,
    emoji: 1
  };

  const dataset = year ? fbMessengerDatasetByYear[year] : fbMessengerDataset;

  const groupByPerson = {};
  dataset.forEach(d => {
    if (!groupByPerson[d.person]) groupByPerson[d.person] = [];
    groupByPerson[d.person].push(d);
  });

  const output = [];
  Object.keys(groupByPerson).forEach(person => {
    let ratio = 0;

    const totalIsSent = isSent =>
      type === 'messages'
        ? groupByPerson[person].filter(d => (isSent ? !d.sender : !d.receiver))
            .length
        : d3Sum(
            groupByPerson[person]
              .filter(d => (isSent ? !d.sender : !d.receiver))
              .map(d => d[column[type]])
          );

    const sent = totalIsSent(true);
    const received = totalIsSent(false);

    if (sent > threshold[type] && received > threshold[type]) {
      if (isGhosters) ratio = sent / received;
      if (!isGhosters) ratio = received / sent;
      output.push({ person, ratio });
    }
  });

  output.sort((a, b) => b.ratio - a.ratio);

  return output;
});
