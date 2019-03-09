var wrap = document.getElementById("wrap"),
  speedEnemy = [400, 350, 300, 200],
  wrapWidth = wrap.clientWidth,
  wrapHeight = wrap.clientHeight,
  enePlane = document.getElementsByClassName('enemy'),
  plane = document.getElementsByClassName("plane"),
  prize = document.getElementsByClassName('prize'),
  //存储敌机信息
  defaultEne = {
    big: {
      width: 260,
      height: 200,
      strong: 5 // 大家伙的血量
    },
    small: {
      width: 108,
      height: 80,
      strong: 1 // 小家伙的血量
    }
  },
  defaultPlane = {
    big: {
      width: 97,
      height: 97,
      filename: 'plane_1.png'
    },
    small: {
      width: 122,
      height: 95,
      filename: 'plane_0.png'
    }
  };


init() // 初始化界面

function init() {
  var optArr = ['简单模式', '一般模式', '困难模式', '地狱模式'];

  wrap.innerHTML = "";

  var h1 = document.createElement('h1'),
    div = document.createElement('div');
  div.className = 'footer';
  h1.innerHTML = '飞机大战进化版';
  wrap.appendChild(h1)
  wrap.appendChild(div)

  for (var i = 0, len = optArr.length; i < len; i++) {
    var div = document.createElement('div');
    div.className = 'option';
    div.innerHTML = optArr[i];
    div.i = i;
    div.onclick = function (e) {
      startGame(this.i, e)
    }
    wrap.appendChild(div)
  }
}


// startGame 开始游戏
function startGame(idx, e) {
  var mod = ['small', 'big', 'small', 'small'];
  wrap.innerHTML = "";
  wrap.className = 'bg' + (idx + 1);
  // 创建敌军函数  
  wrap.eneTime = setInterval(function () {
    enemy(idx, mod[randomArea(0, 3)]) // 
  }, speedEnemy[idx])

  // 创建我军函数
  myPlane(e, idx, 'small')

  // 开启随机生成奖品的功能
  wrap.prizeTime = setInterval(function () {

    createPrize(['火', '风'][randomArea(0, 1)])
  }, 5000);


  // 开启积分
  showScore();

  // 开启背景音乐
  var audio = document.createElement('audio');
  audio.src = 'img/game_music.mp3';
  audio.autoplay = true;
  audio.loop = true;
  audio.volume = 0.5;

  wrap.appendChild(audio)

}



// 创建敌军函数
function enemy(idx, model) {
  // 敌军

  var ene = document.createElement('div'),
    bloodBorder = document.createElement('div'),
    blood = document.createElement('p'),
    img = document.createElement('img');

  ene.className = 'enemy ' + model;
  // 预存敌机身份 以便于跟子弹威力进行计算
  ene.model = model;

  bloodBorder.className = 'blood';

  img.src = 'img/enemy_' + model + '.png';

  img.width = defaultEne[model].width;
  img.height = defaultEne[model].height;

  // 敌机出生的位置
  ene.style.top = 0;

  // 敌机威力
  ene.strong = defaultEne[model].strong;

  // 敌机的下落速度
  ene.speed = randomArea(2, 4);

  //
  wrap.appendChild(ene).appendChild(bloodBorder).appendChild(blood);
  ene.appendChild(img)


  ene.style.left = randomArea(0, wrapWidth - ene.clientWidth) + "px"




  eneLanding(); // 敌机生成结束 开始下降


  function eneLanding() {
    ene.style.top = ene.offsetTop + ene.speed + "px";
    if (ene.offsetTop >= wrapHeight - ene.offsetHeight) {
      // 到底部时，中途没有发生碰撞，那删除自己
      wrap.removeChild(ene);
    } else {
      // 没有到底部，需要跟我军检测是否碰撞
      if (plane[0] && isDuang(plane[0], ene)) {

        boom(ene);
        // 结束游戏
        // 1: 我军要爆炸
        // 2：画面要静止
        gg();

      } else {
        plane[0] && requestAnimationFrame(eneLanding)
      }


    }
  }

}

// 创建我军函数
function myPlane(e, idx, model) {
  /*
  <div class='plane big'>
  <img src="img/plane_1.png" alt="">
  </div>
  */
  var maxTop, maxLeft, minLeft;
  var plane = document.createElement('div'),
    img = document.createElement('img');

  img.src = 'img/' + defaultPlane[model].filename;
  img.width = defaultPlane[model].width;
  img.height = defaultPlane[model].height;

  plane.className = "plane " + model;
  // 用来记录吃了多少增加威力的奖品‘火’
  plane.strong = 0;

  // 用来记录 吃了 多少增加子弹条数 的奖品： ‘风’
  plane.count = 0;

  plane.model = model;

  wrap.appendChild(plane).appendChild(img);


  img.onload = function () {
    plane.style.top = e.pageY - wrap.offsetTop - plane.clientHeight / 2 + 'px';
    plane.style.left = e.pageX - wrap.offsetLeft - plane.clientWidth / 2 + 'px';


    // 限定我军移动的最大范围
    maxTop = wrap.clientHeight - plane.offsetHeight,
      minLeft = -plane.offsetWidth / 2,
      maxLeft = wrap.clientWidth + minLeft;
  }



  document.onmousemove = function (e) {
    var top = e.pageY - wrap.offsetTop - plane.offsetHeight / 2,
      left = e.pageX - wrap.offsetLeft - plane.offsetWidth / 2;

    top = Math.max(0, top)
    top = Math.min(maxTop, top)
    left = Math.max(minLeft, left)
    left = Math.min(maxLeft, left)

    plane.style.top = top + 'px'
    plane.style.left = left + 'px';

    // 每次移动时  跟 prize 检测是否发生碰撞（有碰撞就吃掉它）

    for (var i = 0, len = prize.length; i < len; i++) {
      if (isDuang(plane, prize[i])) {
        // 撞上了就吃掉它 增加属性
        if (prize[i].attr === '火') {
          // 增加威力
          plane.strong++;
        } else if (prize[i].attr === '风') {
          // 增加子弹数量
          plane.count++;

          if (plane.count > 2) {
            alert('知足者常乐');
            gg(); // 游戏结束
          }
        }
        // 移除奖品  关闭奖品自动消失的定时器
        clearTimeout(prize[i].time)
        wrap.removeChild(prize[i])
      }
    }
  };


  // 生成子弹
  var speed = [300, 250, 200, 150][idx], //这是不同模式生成子弹的速度
    biuSpd = [4, 5, 6, 7][idx]; // 子弹移动的速度


  var audio = document.createElement('audio');
  audio.loop = true;
  audio.autoplay = true;
  wrap.appendChild(audio)




  plane.time = setInterval(function () {
    // 0  1  2

    for (var i = 0; i <= plane.count; i++) {
      Biu({
        strong: plane.strong,
        count: plane.count,
        i: i // 用来确定子弹的left位置
      })

      audio.src = plane.count > 0 ? 'img/enemy2_out.mp3' : 'img/bullet.mp3';

    }


  }, speed)

  function Biu(obj) {
    var biu = document.createElement('img');
    biu.src = 'img/fire.png';
    biu.className = 'biu strong1';
    biu.strong = 1 + plane.strong; // 子弹的威力
    biu.count = 1 + plane.count; // 子弹的条数

    wrap.appendChild(biu);
    biu.style.top = plane.offsetTop + 'px';


    if (obj.count === 0) {
      // 中间 
      biu.style.left = plane.offsetLeft + plane.offsetWidth / 2 - biu.offsetWidth / 2 + "px";
    } else if (obj.count === 1) {
      // 左边 右边
      biu.style.left = [plane.offsetLeft, plane.offsetLeft + plane.offsetWidth - biu.offsetWidth][obj.i] + 'px';
    } else if (obj.count === 2) {
      // 左边 中间 右边
      biu.style.left = [plane.offsetLeft, plane.offsetLeft + plane.offsetWidth / 2 - biu.offsetWidth / 2, plane.offsetLeft + plane.offsetWidth - biu.offsetWidth][obj.i] + 'px';
    }
    runBiu();

    function runBiu() {
      biu.style.top = biu.offsetTop - biuSpd + "px";
      if (biu.offsetTop <= 0) {
        wrap.removeChild(biu);
      } else {

        // 检测跟敌军的身体  是否发生碰撞
        plane.parentNode && (biu.time = requestAnimationFrame(runBiu))

        for (var i = 0, len = enePlane.length; i < len; i++) {

          if (enePlane[i] && isDuang(biu, enePlane[i])) {

            cancelAnimationFrame(biu.time)
            // 删除子弹
            wrap.removeChild(biu);
            enePlane[i].strong -= biu.strong;
            // 被击中的飞机 血量减少

            enePlane[i].children[0].children[0].style.width = enePlane[i].strong / defaultEne[enePlane[i].model].strong * enePlane[i].children[0].clientWidth + "px";

            if (enePlane[i].strong <= 0) {
              if (enePlane[i].model === 'small') {
                wrap.score++;
              } else if (enePlane[i].model === 'big') {
                wrap.score += 4;

              }
              boom(enePlane[i]);

              document.getElementsByClassName('score')[0].innerHTML = wrap.score;
            }


          }
        }



      }
    }


  }
}

function boom(obj) {
  var img = document.createElement('img');
  img.src = 'img/boom_' + obj.model + '.png';
  img.width = obj.clientWidth;
  img.height = obj.clientHeight;
  img.className = 'boom';
  img.style.top = obj.offsetTop + "px";
  img.style.left = obj.offsetLeft + "px";


  wrap.removeChild(obj);


  wrap.appendChild(img);
  // css的animation动画执行结束
  img.addEventListener('webkitAnimationEnd', function () {
    wrap.removeChild(this)
  })

  var audio = document.createElement('audio');
  audio.loop = false;
  audio.autoplay = true;
  audio.src = obj.className === 'enemy' ? 'img/enemy3_down.mp3' : 'img/game_over.mp3'
  audio.volume = 0.5;

  audio.addEventListener('ended', function () {
    wrap.removeChild(this);
  });

  wrap.appendChild(audio)
}


function isDuang(obj1, obj2) { // true 碰撞  false 不碰撞
  var top1 = obj1.offsetTop,
    left1 = obj1.offsetLeft,
    right1 = left1 + obj1.offsetWidth,
    bottom1 = top1 + obj1.offsetHeight,

    top2 = obj2.offsetTop,
    left2 = obj2.offsetLeft,
    right2 = left2 + obj2.offsetWidth,
    bottom2 = top2 + obj2.offsetHeight;

  return !(top1 > bottom2 || left1 > right2 || bottom1 < top2 || right1 < left2)
}


// random [0,20]   5 , 17  [5,17]    [0,1)*13 = [0,13) + 5 = [5,17]
function randomArea(a, b) {
  return Math.floor(Math.random() * (b + 1 - a) + a);
}

// GG 游戏结束
function gg() {
  // 注销document的move事件
  document.onmousemove = null;
  // 关闭生产敌军的定时器
  clearInterval(wrap.eneTime)
  // 关闭生成子弹的定时器
  clearInterval(plane[0].time)
  // 清除生成奖品的定时器
  clearInterval(wrap.prizeTime)
  // 我军的爆炸效果 && 删除我军
  boom(plane[0])
  // 统计得分情况
  setTimeout(ggView, 1000)
}
//  火 = 增加威力   风 = 增加子弹的条数

function createPrize(inner) {
  var div = document.createElement('div');
  div.innerHTML = inner;
  div.className = 'prize';
  // js对象的自定义属性来标记吃的是啥
  div.attr = inner;

  div.style.top = randomArea(0, wrapHeight - 50) + 'px';
  div.style.left = randomArea(0, wrapWidth - 50) + 'px';

  wrap.appendChild(div);
  div.time = setTimeout(function () {
    wrap.removeChild(div)
  }, 5000)
}


// ggView
// wrap.score += 1;
// wrap.score += 4;
function ggView() {
  // 清屏
  wrap.innerHTML = "";
  // 创建游戏结束画面的两个对象
  /*
  <div class="record">最终得分：<p>1000</p></div>
  <div class="btn">再来一次</div> 
  */
  var div = document.createElement('div'),
    div2 = document.createElement('div');

  div.className = 'record';
  div.innerHTML = "最终得分：<p>" + wrap.score + "</p>"
  div2.className = "btn";
  div2.innerHTML = '再来一次';
  div2.onclick = function () {
    init();
  }
  wrap.appendChild(div)
  wrap.appendChild(div2)


}

// showScore  初始化开始几分
function showScore() {

  var span = document.createElement('span');
  span.innerHTML = wrap.score = 0;
  span.className = 'score';
  wrap.appendChild(span);

}
