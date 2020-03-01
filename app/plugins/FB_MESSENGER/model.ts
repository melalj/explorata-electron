import { ipcRenderer } from 'electron';
import { dateToWeekCode, emojiRegex } from '../../utils';
import settings from './settings';

export async function queryActivity(year) {
  if (year) {
    const result = await ipcRenderer.invoke(
      'dbFetchMany',
      'SELECT day, COUNT(id) as count FROM messages WHERE year = @year GROUP BY day ORDER BY day ASC',
      { year }
    );
    return result;
  }
  const result = await ipcRenderer.invoke(
    'dbFetchMany',
    'SELECT year, COUNT(id) AS count FROM messages GROUP BY year ORDER BY year'
  );
  return result;
}

export async function queryChatList(filters) {
  const params = {};
  let cond = '';

  if (filters.day) {
    cond += 'AND day = @day ';
    params.day = filters.day;
  }
  const result = await ipcRenderer.invoke(
    'dbFetchMany',
    `SELECT IFNULL(sender, receiver) AS person, timestamp, COUNT(id) as count FROM messages WHERE 1=1 ${cond} GROUP BY person ORDER BY count DESC`,
    params
  );
  return result;
}

export async function queryChatMessages(filters) {
  const params = {};
  let cond = '';

  if (filters.person) {
    cond += 'AND IFNULL(sender, receiver) = @person ';
    params.person = filters.person;
  }

  if (filters.day) {
    cond += 'AND day = @day ';
    params.day = filters.day;
  }
  const result = await ipcRenderer.invoke(
    'dbFetchMany',
    `SELECT sender, receiver, timestamp, content FROM messages WHERE 1=1 ${cond} ORDER BY timestamp ASC LIMIT 2000`,
    params
  );
  return result;
}

export async function queryMostMessaged(year) {
  const yearCond = year ? ` WHERE year = @year` : '';
  const params = year ? { year } : {};
  const result = await ipcRenderer.invoke(
    'dbFetchMany',
    `SELECT IFNULL(sender, receiver) AS person, COUNT(id) as count FROM messages${yearCond} GROUP BY person ORDER BY count DESC LIMIT 100`,
    params
  );
  return result;
}

export async function queryYears() {
  const result = await ipcRenderer.invoke(
    'dbFetchMany',
    'SELECT year FROM messages GROUP BY year ORDER BY year ASC'
  );
  return result.map(d => d.year);
}

export async function queryChattiest(year) {
  const yearCond = year ? ` WHERE year = @year` : '';
  const params = year ? { year } : {};
  const result = await ipcRenderer.invoke(
    'dbFetchMany',
    `SELECT day, COUNT(id) AS count FROM messages${yearCond} GROUP BY day ORDER BY count DESC LIMIT 8`,
    params
  );
  return result;
}

export async function queryFriendProfile(person) {
  const minResult = await ipcRenderer.invoke(
    'dbFetchOne',
    'SELECT MIN(timestamp) as val FROM messages WHERE receiver = @person OR sender = @person',
    { person }
  );

  const countSentResult = await ipcRenderer.invoke(
    'dbFetchOne',
    'SELECT COUNT(id) as val FROM messages WHERE receiver = @person',
    { person }
  );

  const countReceivedResult = await ipcRenderer.invoke(
    'dbFetchOne',
    'SELECT COUNT(id) as val FROM messages WHERE sender = @person',
    { person }
  );

  const countGifSentResult = await ipcRenderer.invoke(
    'dbFetchOne',
    'SELECT SUM(countGif) as val FROM messages WHERE receiver = @person',
    { person }
  );

  const countGifReceivedResult = await ipcRenderer.invoke(
    'dbFetchOne',
    'SELECT SUM(countGif) as val FROM messages WHERE sender = @person',
    { person }
  );

  const messagesEmojiResult = await ipcRenderer.invoke(
    'dbFetchMany',
    'SELECT sender, receiver, content FROM messages WHERE (receiver = @person OR sender = @person) AND countEmoji > 0',
    { person }
  );

  const emojiSentDict = {};
  const emojiReceivedDict = {};

  messagesEmojiResult.forEach(d => {
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

  const consecutiveResult = await ipcRenderer.invoke(
    'dbFetchOne',
    `
      WITH
      dates(date) AS (
        SELECT DISTINCT strftime('%Y-%m-%d', timestamp / 1000, 'unixepoch') AS date
      FROM messages
      WHERE receiver = @person OR sender = @person
      ORDER BY 1
      ),
        groups AS (
          SELECT
            ROW_NUMBER() OVER (ORDER BY date) AS rn,
      date(date, '-' || ROW_NUMBER() OVER (ORDER BY date) || ' day') AS grp,
            date
          FROM dates
        )
      SELECT
        COUNT(*) AS consecutiveDates,
        MIN(date) AS minDate,
        MAX(date) AS maxDate
      FROM groups
      GROUP BY grp
      ORDER BY 1 DESC, 2 DESC
      `,
    { person }
  );

  return {
    firstMessage: minResult.val,
    messagesSent: countSentResult.val,
    messagesReceived: countReceivedResult.val,
    gifSent: countGifSentResult.val,
    gifReceived: countGifReceivedResult.val,
    mostSentEmoji,
    mostReceivedEmoji,
    streak: consecutiveResult.consecutiveDates,
    streakFrom: consecutiveResult.minDate,
    streakTo: consecutiveResult.maxDate
  };
}

export async function queryRatioSent(year, type, isGhosters) {
  const yearCond = year ? ` AND year = @year` : '';
  const params = year ? { year } : {};

  const column = {
    messages: '1',
    gifs: 'countGif',
    photos: 'countPhoto',
    emoji: 'countEmoji'
  };

  const ratioCol = isGhosters
    ? 'SUM(total_sent) * 1.00 /SUM(total_received)'
    : 'SUM(total_received) * 1.00 /SUM(total_sent)';

  const filterCond =
    type === 'messages' ? 'WHERE total_sent > 30 AND total_received > 30' : '';

  const result = await ipcRenderer.invoke(
    'dbFetchMany',
    `
      SELECT ${ratioCol} as ratio, r.person
      FROM (
        SELECT sender as person, SUM(${column[type]}) AS total_received FROM messages WHERE sender IS NOT NULL AND ${column[type]} > 0${yearCond} GROUP BY person
      ) r
      LEFT JOIN (
        SELECT receiver as person, SUM(${column[type]}) AS total_sent FROM messages WHERE receiver IS NOT NULL AND ${column[type]} > 0${yearCond} GROUP BY person
      ) s ON s.person = r.person
      ${filterCond}
      GROUP BY r.person
      ORDER BY ratio DESC
      `,
    params
  );
  return result;
}

export async function init(files) {
  // Init DB
  await ipcRenderer.invoke('dbInit', settings);

  // Work on files
  const allConversations = await Promise.all(
    files.map(f => ipcRenderer.invoke('readFile', f.path, 'latin1'))
  );
  const conversations = allConversations
    .map(d => JSON.parse(d))
    .filter(
      c => c.thread_type !== 'RegularGroup' && c.participants.length === 2
    );

  await Promise.all(
    conversations.map(conversation => {
      const person = decodeURIComponent(
        escape(String(conversation.participants[0].name))
      );
      const me = decodeURIComponent(
        escape(String(conversation.participants[1].name))
      );
      const messages = conversation.messages.filter(d => d.type === 'Generic');

      const columns = [
        'sender',
        'receiver',
        'content',
        'countEmoji',
        'countGif',
        'countPhoto',
        'timestamp',
        'day',
        'weekNumber',
        'weekDay',
        'year'
      ];

      return ipcRenderer.invoke(
        'dbInsertMany',
        'messages',
        columns,
        messages.map(m => {
          const senderName = decodeURIComponent(escape(String(m.sender_name)));
          const content = decodeURIComponent(escape(String(m.content)));
          const emojiMatch = (content || '').match(emojiRegex);
          const date = new Date(m.timestamp_ms);
          return {
            sender: senderName === me ? null : person,
            receiver: senderName !== me ? null : person,
            content,
            countEmoji: emojiMatch && emojiMatch.length ? emojiMatch.length : 0,
            countGif: Array.isArray(m.gifs) ? m.gifs.length : 0,
            countPhoto: Array.isArray(m.photos) ? m.photos.length : 0,
            timestamp: m.timestamp_ms,
            day: date
              .toISOString()
              .split('T')[0]
              .replace(/-/g, ''),
            weekNumber: dateToWeekCode(date),
            weekDay: date.getDay(),
            year: date.getFullYear()
          };
        })
      );
    })
  );
}
