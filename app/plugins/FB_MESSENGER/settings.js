export default {
  name: 'FB_MESSENGER',
  author: 'Simo Elalj <hi@tonoid.com>',
  version: '1.0.0',
  schema: `
    PRAGMA encoding = "UTF-8"; 
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT,
      receiver TEXT,
      content TEXT,
      countEmoji INTEGER,
      countGif INTEGER,
      countPhoto INTEGER,
      timestamp INTEGER,
      day INTEGER,
      weekNumber INTEGER,
      weekDay INTEGER,
      year INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages (receiver);
    CREATE INDEX IF NOT EXISTS idx_messages_countEmoji ON messages (countEmoji);
    CREATE INDEX IF NOT EXISTS idx_messages_countGif ON messages (countGif);
    CREATE INDEX IF NOT EXISTS idx_messages_countPhoto ON messages (countPhoto);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages (timestamp);
    CREATE INDEX IF NOT EXISTS idx_messages_day ON messages (day);
    CREATE INDEX IF NOT EXISTS idx_messages_weekNumber ON messages (weekNumber);
    CREATE INDEX IF NOT EXISTS idx_messages_weekDay ON messages (weekDay);
    CREATE INDEX IF NOT EXISTS idx_messages_year ON messages (year);
  `
};
