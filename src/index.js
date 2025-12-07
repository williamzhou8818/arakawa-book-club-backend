import express from 'express';
import cors from 'cors';
import eventsRoute from './routes/events.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); // 解析 JSON body

app.get('/', (req, res) => {
  res.send('API Running');
});

// 挂载 routes
app.use('/api/events', eventsRoute);

// 使用 .env 中的 PORT，否则默认 3001
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
