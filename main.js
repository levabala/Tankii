var svg = $("#SVGRoom");
var g = document.createElementNS("http://www.w3.org/2000/svg",'g');
svg.append(g);
var width = svg.width()-1;
var height = svg.height()-1;

var isServer = false;
var players = {};

var keymapdown1 = function(tank){
  return {
    38: function(){
      tank.toTop();
    },
    39: function(){
      tank.toRight();
    },
    40: function(){
      tank.toBottom();
    },
    37: function(){
      tank.toLeft();
    }
  }
}
var keymapup1 = function(tank){
  return {
    38: function(){
      tank.stop();
    },
    39: function(){
      tank.stop();
    },
    40: function(){
      tank.stop();
    },
    37: function(){
      tank.stop();
    },
    32: function(){
      tank.shoot();
    }
  }
}

initWebRtc();

var tr;
function initTanksRoomServer(){
  var map1 = new Map(Math.floor(svg.width()/10),Math.floor(svg.height()/10));
  map1.generateMesh(width,height);
  tr = new TanksRoomServer(g, map1)  

  var mytank = tr.createTank(new Pos(10,10),5,5,2,[1,0,0,0],0.1);
  var kd1 = keymapdown1(mytank);
  var ku1 = keymapup1(mytank);
  var k1 = new KeyBoardHandler(window, kd1, ku1);
  console.log(k1, kd1, ku1)
  mytank.setKeyBoardHandler(k1);
}

function initTanksRoomClient(){
  HostPeer.sendDataChannel.send('Hey, I am a client!')
}

function newPlayer(input,output){
  var tank = tr.createTank(new Pos(30,30),5,5,2,[1,0,0,0],0.1);
  input.onmessage = function(e){
    tank.command[e.data]();
  }
}
