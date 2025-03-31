const { calculateCalories } = require('../service/calculateService');

const handleCalculate = (req, res) => {
  const { weight, height, age, gender, activity, goal, burned } = req.body;

  // billo validierung einfach kurzer check - sind alle eingaben vorhanden? 
  // TODO im frontend dann richtige Validierung

  if (!weight || !height || !age || !gender || !activity || !goal) {
    return res.status(400).json({ error: 'Missing required parameters' });
  } 
  const totalCalories = calculateCalories({
    weight: Number(weight),
    height: Number(height),
    age: Number(age),
    gender,
    activity,
    goal,
    burned: Number(burned) || 0,
  });

  res.status(200).json({ totalCalories })
};

module.exports = { handleCalculate };
