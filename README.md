# game-biubiubiu
原生js开发的小游戏：飞机大战

## 核心源码

```

//不同模式的数据
const data = [{
  model: "easy",
  biuSpeed: 6,
  biuNum: 250,
  enemyNum: 450,
  enemySpeed: 2
}, {
  model: "dif",
  biuSpeed: 8,
  biuNum: 200,
  enemyNum: 350,
  enemySpeed: 3
},
{
  model: "hell",
  biuSpeed: 10,
  biuNum: 150,
  enemyNum: 250,
  enemySpeed: 4
}];

//用到的函数
const { floor, random, max, min } = Math;
//主战场
let
  battleGround = document.getElementsByClassName('battle-ground')[0],
  //我的飞机
  plane = document.getElementsByClassName('my-plane'),
  //敌机
  enemy = document.getElementsByClassName('enemy'),
  //战场左定位
  battleoffsetleft = battleGround.offsetLeft,
  //视口的高
  battleheight = battleGround.offsetHeight,
  //奖励盒子
  biuPropDiv = document.getElementsByClassName("biu-prop"),
  //计分板
  scoreText = document.querySelector(".score span"),
  //最高分
  mostScore = document.querySelector('.most-score span'),
  //爆炸音效
  boomAudio = document.getElementsByClassName('boomAudio');

//计分板
let score = 0;

//初始化
init()

//初始化界面函数
function init() {
  //打扫战场
  battleGround.innerHTML = ''
  let startGame = document.createElement('div');
  startGame.className = 'start-game'
  battleGround.appendChild(startGame)
  //历史记录分数
  mostScore.innerText = (localStorage.getItem("historyScore") ? localStorage.getItem("historyScore") : "无历史最高分")
  startGame.onclick = modelChoice
}

//模式选择
function modelChoice() {
  battleGround.innerHTML = ''
  let easy = document.createElement('div');
  easy.className = 'model';

  let diff = easy.cloneNode(),
    hell = easy.cloneNode();

  easy.innerText = '简单模式';
  diff.innerText = '困难模式';
  hell.innerText = '地狱模式';
  battleGround.appendChild(easy)
  battleGround.appendChild(diff)
  battleGround.appendChild(hell)
  battleGround.style.backgroundImage = 'url(./img/bg.jpg)'
  easy = diff = hell = null;
  let whichModel = document.getElementsByClassName('model');
  //选择模式
  battleGround.onclick = function (e) {
    //获取选择难度
    for (let i = 0; i < whichModel.length; i++) {
      if (whichModel[i] == e.target) {
        gameStart(i, e);
        whichModel = null
        break;
      }
    }
  }
}

//页面跳转
function gameStart(model, e) {
  battleGround.innerHTML = '';
  battleGround.style.backgroundImage = `url(./img/bg${model}.jpg)`
  //背景音效
  let startAudio = document.createElement('audio');
  startAudio.autoplay = true;
  startAudio.loop = true;
  startAudio.volume = 0.5;
  startAudio.src = './img/game_music.mp3'
  startAudio.className = 'startAudio'
  battleGround.appendChild(startAudio)
  //敌机出现音效
  let overAudio = startAudio.cloneNode()
  overAudio.src = './img/enemy_out.mp3';
  overAudio.className = 'overAudio'
  battleGround.appendChild(overAudio)
  //爆炸音效
  let boomAudio = document.createElement('audio');
  boomAudio.autoplay = true;
  boomAudio.volume = 0.8;
  boomAudio.className = 'boomAudio';
  battleGround.appendChild(boomAudio)

  //生成敌机, 我的战机, 子弹奖励, 
  creatmyPlane(model, e)
  creatEnmey(model)
  //参数为生成奖励间隔
  biuCountAndFire(4000)
}

//生成我方战机
function creatmyPlane(model, e) {
  let
    myPlane = document.createElement('div'),
    planeBlood = document.createElement('div');
  myPlane.className = 'my-plane';
  planeBlood.className = 'my-plane-blood';
  myPlane.style.cssText = `background-image: url(./img/plane_${model}.png);left: ${e.clientX - battleoffsetleft - 42}; top: ${e.clientY - 33}; cursor: none`;

  myPlane.appendChild(planeBlood)
  battleGround.appendChild(myPlane)
  plane[0].count = 1;
  plane[0].fire = 1;
  plane[0].blood = 3;
  //鼠标移动函数
  movePlane();
  //生成子弹
  creatBiu(model)
  myPlane = null;
  planeBlood = null;
}

//鼠标移动飞机
function movePlane() {
  //鼠标移动
  let
    left,
    top;
  //吃到奖励的音效
  let chidaole = document.createElement('audio');
  chidaole.autoplay = true;
  chidaole.volume = 1;
  battleGround.appendChild(chidaole)

  document.onmousemove = function (e) {
    if (!plane[0]) return
    left = e.clientX - battleoffsetleft - 34;
    top = e.clientY - 26;
    left = max(left, -4)
    left = min(left, 408)
    top = max(top, 0)
    top = min(top, battleheight - 52)
    plane[0].style.left = left + 'px';
    plane[0].style.top = top + 'px'
    // if (plane[0].count >= 3 && plane[0].fire >= 3) {
    //   battleGround.removeChild(chidaole)
    //   chidaole = null;
    //   return
    // }
    if (biuPropDiv[0] && testCrash(biuPropDiv[0], plane[0])) {
      chidaole.src = './img/chidaoju.mp3'
      battleGround.removeChild(biuPropDiv[0])
      switch (plane[0].a) {
        case 0:
          plane[0].count++
          plane[0].count = min(3, plane[0].count)
          break;
        case 1:
          plane[0].fire++
          plane[0].fire = min(3, plane[0].fire)
          break;
        case 2:
          plane[0].blood++
          plane[0].firstElementChild.style.backgroundSize = `${plane[0].blood * 33}% 100%`
          plane[0].blood = min(3, plane[0].blood)
          break;
      }
    }
  }
}

/* 原生创建 */

//生成子弹
//子弹计时器
let biuTimer = null;
function creatBiu(model) {
  let { biuNum, biuSpeed } = data[model];
  //我的飞机定位置, 避免后边重复查询
  let planeLeft = '';
  biuTimer = setInterval(() => {
    //如果坠机
    if (!plane[0]) return
    //有几个子弹就生成几个
    for (let i = 0; i < plane[0].count; i++) {
      creat(i)
    }
    function creat(i) {
      let biu = document.createElement('div');
      biu.style.top = `${plane[0].offsetTop - 30}px`
      planeLeft = plane[0].offsetLeft;
      //根据子弹数量动态改变子弹的位置
      switch (plane[0].count) {
        case 1:
          biu.style.left = `${planeLeft + 19}px`
          break;
        case 2:
          biu.style.left = [`${planeLeft}px`, `${planeLeft + 38}px`][i]
          break;
        case 3:
          biu.style.left = [`${planeLeft}px`, `${planeLeft + 19}px`, `${planeLeft + 38}px`][i]
          break;
      }
      biu.className = 'biu-biu'
      //子弹威力
      biu.fire = plane[0].fire
      battleGround.appendChild(biu)

      biuRun()
      function biuRun() {
        biu.style.top = biu.offsetTop - biuSpeed + "px";
        if (biu.offsetTop <= 0) {
          battleGround.removeChild(biu)
          biu = null;
        } else {
          //飞机碰撞检测
          for (let i = 0; i < enemy.length; i++) {
            if (enemy[i] && testCrash(enemy[i], biu)) {
              enemy[i].blood -= biu.fire;
              //血条消失术
              enemy[i].firstElementChild.style.backgroundSize = `${(enemy[i].blood * 50)}% 100%`
              battleGround.removeChild(biu)
              biu = null
              //飞机没血了
              if (enemy[i].blood <= 0) {
                score += (enemy[i].type == 1) ? 10000 : 5000;
                boom(enemy[i], enemy[i].type)
                scoreText.innerHTML = score
              }
              //只要碰撞就return 不用取消 动画帧  不用担心子弹消失
              return
            }
          }
          requestAnimationFrame(biuRun)
        }
      }
    }
  }, biuNum);
}


//生成敌方战机
//敌机计时器
let enemyTimer = null;
function creatEnmey(model) {
  let { enemyNum, enemySpeed } = data[model],
    //难度不同, 生成大飞机的概率不同
    bigPro = 4 - model;

  enemyTimer = setInterval(() => {
    if (!plane[0]) return
    let left = randomNum(0, 420);
    let enemy = document.createElement('div');
    let blood = document.createElement('div');
    enemy.style.cssText = `top: ${-40}px;left: ${left}px`;
    blood.className = 'blood';
    //大小飞机
    if ((randomNum(0, bigPro) == 0)) {
      enemy.classList = 'enemy-big enemy';
      enemy.blood = 3;
      //1是大飞机  用来判断飞机大小
      enemy.type = 1
    } else {
      enemy.classList = 'enemy-small enemy';
      enemy.blood = 2;
      //1是小飞机
      enemy.type = 0
    }
    enemy.appendChild(blood)
    battleGround.appendChild(enemy)
    blood = null

    //敌机运动
    enemyRun()
    //大飞机子弹运动  left 固定, 传进去
    enemyBiu(enemy, left)
    left = null

    function enemyRun() {
      //用来检测飞机有没有坠毁, 要不然会一直调用下去,  哈哈哈 ! 终于想到了!!
      if (!enemy.parentElement) {
        enemy = null;
        return
      }

      enemy.style.top = enemy.offsetTop + enemySpeed + "px";
      //消失提前一点
      if (enemy.offsetTop >= battleheight - 40) {
        battleGround.removeChild(enemy);
        enemy = null
      } else {
        if (plane[0] && testCrash(enemy, plane[0])) {
          myPlaneBoom(enemy, true)
          enemy = null;
          return
        }
        requestAnimationFrame(enemyRun)
      }
    }
  }, enemyNum);
}

//飞机扣血函数  参数 : 目标,  是否是敌机 true 是敌机 false 是敌机子弹
function myPlaneBoom(enemy, bol) {
  plane[0].blood--;
  plane[0].firstElementChild.style.backgroundSize = `${plane[0].blood * 33}% 100%`;
  boomAudio[0].src = "./img/game_over.mp3";
  //敌机爆炸 或者是 大飞机子弹消失
  bol ? boom(enemy, enemy.type) : battleGround.removeChild(enemy)

  if (plane[0].blood > 0) return
  //我方爆炸, 游戏结束
  boom(plane[0], true, gameOver)
}

//大飞机子弹函数
function enemyBiu(enemy, left) {
  //小飞机返回
  if (enemy.type == 0 || !enemy.parentElement) return
  if (!plane[0]) return

  let
    eB = document.createElement('div'),
    randomS = randomNum(-2, 2);
  eB.className = 'enemy-biu';
  eB.style.cssText = `left:${left}px; top:${enemy.offsetTop}px`;
  battleGround.appendChild(eB);

  enemyBiuRun()
  function enemyBiuRun() {
    if (!eB.parentElement) {
      eB = null;
      return
    }
    eB.style.top = eB.offsetTop + 5 + 'px';
    eB.style.left = eB.offsetLeft + randomS + 'px';

    //消失提前
    if (eB.offsetTop >= battleheight - 23 || eB.offsetLeft <= 0 || eB.offsetLeft >= 451) {
      battleGround.removeChild(eB)
      randomS = null;
      eB = null
    } else {
      if (plane[0] && testCrash(eB, plane[0])) {
        //敌机子弹, 第二个传输不传
        myPlaneBoom(eB);
        randomS = null;
        eB = null;
        return
      }
      requestAnimationFrame(enemyBiuRun)
    }
  }
}

//原生检测
function testCrash(a, b) {
  if (!a || !b) return false
  var aTop = a.offsetTop,
    aLeft = a.offsetLeft,
    aRight = aLeft + a.offsetWidth,
    aBottom = aTop + a.offsetHeight,
    bTop = b.offsetTop,
    bLeft = b.offsetLeft,
    bRight = bLeft + b.offsetWidth,
    bBottom = bTop + b.offsetHeight;
  let bol = !(aTop > bBottom || aLeft > bRight || aBottom < bTop || aRight < bLeft);
  aTop = aLeft = aRight = aBottom = bTop = bLeft = bRight = bBottom = null;
  return bol
}

//奖励生成函数
//奖励计时器
let biuCountAndFireTimer = null;
function biuCountAndFire(time) {
  biuCountAndFireTimer = setInterval(() => {
    //上限为3个
    if (plane[0].count >= 3 && plane[0].fire >= 3 && plane[0].blood >= 3) return;
    let
      biuProp = document.createElement('div'),
      randomN = randomNum(0, 2),
      bgI = '';
    biuProp.className = 'biu-prop';
    switch (randomN) {
      case 0:
        bgI = 'url(./img/biucount.png)'
        //0是加子弹
        plane[0].a = 0
        break;
      case 1:
        bgI = 'url(./img/biufire.png)'
        //1是加威力
        plane[0].a = 1
        break;
      case 2:
        //2是加血
        bgI = 'url(./img/addblood.png)'
        plane[0].a = 2
        break;
    }
    biuProp.style.cssText = `top: ${randomNum(0, battleheight - 40)}px;left: ${randomNum(0, 435)}px;background-image: ${bgI}`;
    bgI = null;
    battleGround.appendChild(biuProp)
    //奖励消失
    setTimeout(() => {
      //如果没被吃的话, 删除节点
      if (biuProp.parentElement) {
        battleGround.removeChild(biuProp)
      }
      biuProp = null
      randomN = null
    }, 1500);
  }, time);
}

//爆炸函数  true是bigboom
function boom(enemy, bol, fn) {
  //如果有传gameover 先清空定时器, 以免出错
  if (fn) {
    clearInterval(enemyTimer)
    clearInterval(biuTimer)
    clearInterval(biuCountAndFireTimer)
  }

  let
    left = enemy.offsetLeft,
    top = enemy.offsetTop;
  battleGround.removeChild(enemy)

  let boomDiv = document.createElement('div')
  boomDiv.className = bol ? 'boom-big' : 'boom-small';
  boomDiv.style.cssText = `left:${left}px; top:${top}px`;
  battleGround.appendChild(boomDiv)
  //动画结束
  boomDiv.addEventListener('webkitAnimationEnd', () => {
    battleGround.removeChild(boomDiv)
    left = top = boomDiv = null;
    fn && fn()
  })
  //jq的淡出
  // $boom.fadeOut(2000, function () {
  //   this.remove()
  //   pos = left = top = $boom = null
  //   fn && fn()
  // })
}

//游戏结束
function gameOver() {
  //清除定时器
  clearInterval(enemyTimer)
  clearInterval(biuTimer)
  clearInterval(biuCountAndFireTimer)
  //清理战场
  battleGround.innerHTML = ''
  //重新开始
  oneMore()
  //记录分数
  if (score > localStorage.getItem("historyScore")) {
    localStorage.setItem("historyScore", `${score}`)
    mostScore.innerText = score;
    score = 0
  }
}

//再来一局
function oneMore() {
  battleGround.style.backgroundImage = "url(./img/over.jpg)"
  let
    more = document.createElement('div'),
    lastscore = document.createElement('div');
  more.className = 'more';
  lastscore.className = 'last-score';
  lastscore.innerText = score
  battleGround.appendChild(more)
  battleGround.appendChild(lastscore)
  lastscore = null
  more.onclick = modelChoice
}

//esc退出
document.onkeydown = function (e) {
  if (e.keyCode != 27) return
  if (!plane[0]) return
  document.getElementsByClassName('overAudio')[0].src = "./img/game_over.mp3";
  boom(plane[0], true, gameOver)
}

//只有视口大小
window.onresize = () => {
  battleoffsetleft = battleGround.offsetLeft;
  battleheight = battleGround.offsetHeight;
}

//随机数
function randomNum(a, b) {
  let val = Math.floor(Math.random() * (b + 1 - a) + a);
  return val;
}
```
