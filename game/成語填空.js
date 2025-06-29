// game/成語填空.js

const idiomList = [
  { question: '一_一_（填入兩個相同字）', answer: '一模一樣' },
  { question: '畫_添_（填入兩個字）', answer: '畫蛇添足' },
  { question: '自_自_（填入兩個字）', answer: '自言自語' },
  { question: '井_之_（填入兩個字）', answer: '井底之蛙' },
  { question: '對_入_（填入兩個字）', answer: '對號入座' },
  { question: '一_不_（填入兩個字）', answer: '一成不變' },
];

function getRandomIdiom() {
  const idx = Math.floor(Math.random() * idiomList.length);
  return idiomList[idx];
}

function checkAnswer(userAnswer, correctAnswer) {
  return userAnswer.replace(/\s/g, '') === correctAnswer;
}

module.exports = {
  getRandomIdiom,
  checkAnswer,
};
