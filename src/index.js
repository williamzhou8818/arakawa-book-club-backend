import express from 'express';
import cors from 'cors';
import eventsRoute from './routes/events.js';

const app = express();

app.use(cors());
app.use(express.json()); // 解析 JSON body

app.get('/', (req, res) => {
  res.send('API Running');
});

// 挂载 routes
app.use('/api/events', eventsRoute);

app.listen(3001, () => {
  console.log('Server running at http://localhost:3001');
});
