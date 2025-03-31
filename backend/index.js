const express = require('express');
const app = express();
const calculateRoute = require('./route/calculateRoute'); 

app.use(express.json());
app.use('/api', calculateRoute); 

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

//nur zum testen ob der server läuft - ausgabe auf localhost
app.get('/', (req, res) => {
  res.send('server läuft');
});