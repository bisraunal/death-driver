const canvas = document.getElementById("gameCanvas");//canvas ve 2d cizim contexti alinir
const ctx = canvas.getContext("2d");

// Assetler goruntuler htmlden alinir
const asphaltImg = document.getElementById("asphalt");  //asfalt
const carImg = document.getElementById("car"); //araba
const obstacleImg = document.getElementById("obstacle"); //engeller
const mountainImg = document.getElementById("mountain"); //daglar
const fuelImg = document.getElementById("fuel"); //yakit

//  Assetler sesler htmlden alinir
const bgMusic = document.getElementById("bgMusic"); // arka plan muzigi
const crashSound = document.getElementById("crashSound"); //araba carpma sesi
bgMusic.volume = 0.5; //muzik seviyesi ayari

let gameStarted = false;  //oyun degiskenleri
let paused = false;
let frame = 0;
let speedMultiplier = 1;  //oynanan sure arttikca arabanin hizi artiyor
//arabanin ozellikleri
const car = {

  x: 375, //baslangicta aracin x konumu
  y: 480,  //baslangicta aracin y konumu
  speed: 6, //arabanin hizi
  height: 100, //aracin boyutlari
  width: 49,

};
  //klavyede p tusuna basınca oyun duraklar
let keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === 'p' || e.key === 'P') togglePause();
});
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Engel ve Fuel kutulari
let obstacles = [];
let fuelPickups = [];

let score = 0;  // skor 0 ile baslar zamanla artar.
let fuel = 100; // fuel baslangicta 100dur.

// Fonksiyonlar

//yola random atanan engel fonksiyonu
function spawnObstacle() {
  const x = 260 + Math.random() * 250; //random fonksiyon kullanimi
  obstacles.push({ x, y: -100, width: 50, height: 95 });
}
//yola random atanan yakıt kutusu fonksiyonu
function spawnFuelPickup() {
  const x = 260 + Math.random() * 250; //random fonksiyon kullanimi
  fuelPickups.push({ x, y: -50, width: 40, height: 45 });
}
  //arkaplandaki nesneler 
function drawBackground() {
  // yolun sag ve solundaki daglar
  for (let i = 0; i < canvas.height; i += 100) {
    ctx.drawImage(mountainImg, 0, i, 200, 100);
    ctx.drawImage(mountainImg, 600, i, 200, 100);
  }

  // Asfalt
  const pattern = ctx.createPattern(asphaltImg, "repeat");
  ctx.fillStyle = pattern;
  ctx.fillRect(270, 0, 250, canvas.height);

  // Yoldaki beyaz cizgiler
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath(); 
    ctx.moveTo(400, y);
    ctx.lineTo(400, y + 20);
    ctx.stroke();
  
    
  }
}
// araba fonksiyonu
function drawCar() {
  ctx.drawImage(carImg, car.x, car.y, car.width, car.height);
}
 //engel fonksiyonu
function drawObstacles() {
  obstacles.forEach(ob => {
    ctx.drawImage(obstacleImg, ob.x, ob.y, ob.width, ob.height);
  });
}
  // yakıt fonksiyonu
function drawFuelPickups() {
  fuelPickups.forEach(fuelBox => {
    ctx.drawImage(fuelImg, fuelBox.x, fuelBox.y, fuelBox.width, fuelBox.height);
  });
}
 //engel guncelleme fonksiyonu 
function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].y += 3 * speedMultiplier;
    if (obstacles[i].y > canvas.height) {
      obstacles.splice(i, 1);
      score++;
      if (score % 5 === 0) speedMultiplier += 0.2;
    } else if (
      car.x < obstacles[i].x + obstacles[i].width &&
      car.x + car.width > obstacles[i].x &&
      car.y < obstacles[i].y + obstacles[i].height &&
      car.y + car.height > obstacles[i].y
    ) {
      crashSound.play();  //engele carpma sesi gelir
      alert("Engele çarptın! Skor: " + score); //engele carpinca ekrana uyari gelir
      resetGame(); //oyun sifirlanir
      return;
    }
  }
}
   //yakıt guncelleme fonksiyonu
function updateFuelPickups() {
  for(let i = fuelPickups.length - 1; i >= 0; i--) {
    fuelPickups[i].y += 3 * speedMultiplier;
    if (fuelPickups[i].y > canvas.height) {
      fuelPickups.splice(i, 1);
    } else if (
      car.x < fuelPickups[i].x + fuelPickups[i].width &&
      car.x + car.width > fuelPickups[i].x &&
      car.y < fuelPickups[i].y + fuelPickups[i].height &&
      car.y + car.height > fuelPickups[i].y
    ) {
      fuel = Math.min(100, fuel + 15); //yakıt miktari yuzden fazla olamaz
      fuelPickups.splice(i, 1);
    }
  }
}
    //yakit miktari gosterimi
function drawFuelBar() {
  const barX = 20, barY = 60, barWidth = 200, barHeight = 25;
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barWidth, barHeight);
  
  const fuelWidth = (fuel / 100) * barWidth;
  ctx.fillStyle = fuel > 30 ? '#0f0' : (fuel > 10 ? '#ff0' : '#f00');
  ctx.fillRect(barX, barY, fuelWidth, barHeight);

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  ctx.fillStyle = '#fff';
  ctx.font = "18px Arial";
  ctx.fillText(`Benzin: ${fuel.toFixed(0)}%`, barX + 65, barY + 20);
}
//skor gosterme 
function drawScore() {
  ctx.fillStyle = "#ffeb3b";
  ctx.font = "24px 'Comic Sans MS', cursive";
  ctx.fillText("⭐ Skor: " + score+"⭐", 20, 40); //skor 
}
  //oyun sifirlama
function resetGame() {
  obstacles = [];
  fuelPickups = [];
  score = 0;
  fuel = 100;
  speedMultiplier = 1;
  frame = 0;
  car.x = 375;
  gameStarted = false;
  bgMusic.pause();
  
}
  //oyun duraklatma
function togglePause() {
  if (!gameStarted) return;
  paused = !paused;
  if (paused) bgMusic.pause();
  else bgMusic.play();
}

// Oyun başlatma butonu
document.getElementById("startBtn").onclick = () => {
  if (!gameStarted) {
    gameStarted = true;
    paused = false;
    bgMusic.play();
  }
};
document.getElementById("pauseBtn").onclick = togglePause;
    // oyun durdurulup devam ettikten sonra guncelleme fonksiyonu
function update() {
  if (!gameStarted || paused) return;

  // Araba hareketi
  if (keys["ArrowLeft"] && car.x > 275) car.x -= car.speed;
  if (keys["ArrowRight"] && car.x + car.width < 525) car.x += car.speed;

  if (frame % 90 === 0) spawnObstacle();
  if (frame % 300 === 0) spawnFuelPickup();

  updateObstacles();  //engel guncelleme fonksiyonu
  updateFuelPickups(); //yakit guncelleme fonksiyonu

  // Arabanin benzini zamanla azalir
  if (frame % 60 === 0) {
    fuel -= 3;
    if (fuel <= 0) {
      alert("Arabanin benzini bitti... Skor: " + score); //yakit bitince uyari verir
      resetGame(); //oyun sifirlanir
    }
  }

  frame++;
}
  //oyunu duraklatma butonu
function drawPauseButton() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(680, 10, 110, 40);
  ctx.fillStyle = "#fff";
  ctx.font = "18px 'Comic Sans MS'";
  ctx.fillText(paused ? "Devam Et" : "Duraklat", 690, 37);
}
   //cizme fonksiyonu
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(); //arka plan
  drawCar();  //araba
  drawObstacles(); //engel
  drawFuelPickups();  // /yakit alma 
  drawFuelBar(); //yakıt gostergesi
  drawScore(); //skor
  drawPauseButton(); //durdurma butonu
}
//oyun dongusu fonksiyonu,oyun surekli guncellenir ve cizilir
function gameLoop() {
  update(); //oyun guncellenir
  draw(); //ekrani ciz
  requestAnimationFrame(gameLoop);  //tarayicidan surekli bu fonksiyon cagirilir
}

gameLoop(); //oyun dongusudur, oyun tekrar tekrar calisir
