import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'zhouli1118',
  database: 'arakawa_book_club',
  connectionLimit: 10,
});
