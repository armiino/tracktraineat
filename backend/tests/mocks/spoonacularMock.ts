import nock from 'nock';

export const mockSpoonacularSuccess = () => {
  nock('https://api.spoonacular.com')
    .persist()
    .get('/recipes/findByNutrients')
    .query(true) // Ignoriert alle Query-Parameter-> matched ALLE anfragen-> bei genauer angabe kommt es zu fehlern beim test..
    .reply(200, [
      {
        id: 1,
        title: 'Mocked Recipe 1',
        calories: 1000,
        protein: '50g',
        fat: '40g',
        carbs: '60g',
        image: 'https://example.com/image1.jpg',
      },
      {
        id: 2,
        title: 'Mocked Recipe 2',
        calories: 1100,
        protein: '55g',
        fat: '45g',
        carbs: '70g',
        image: 'https://example.com/image2.jpg',
      },
      {
        id: 3,
        title: 'Mocked Recipe 3',
        calories: 1050,
        protein: '52g',
        fat: '42g',
        carbs: '65g',
        image: 'https://example.com/image3.jpg',
      },
    ]);

  console.log('Spoonacular-Mock wurde korrekt gesetzt..');
};
