var svg = $("#SVGRoom");
var g = document.createElementNS("http://www.w3.org/2000/svg",'g');
svg.append(g);
var width = svg.width()-1;
var height = svg.height()-1;

var map1 = new Map(Math.floor(svg.width()/10),Math.floor(svg.height()/10));
map1.generateMesh(width,height);
var tr = new TanksRoom(g, map1)
//svg.append(mesh);

var t1 = tr.createTank(new Pos(10,10),5,5,2,[1,0,0,0],0.1);

var keymapdown1 = {
  38: function(){
    t1.toTop();
  },
  39: function(){
    t1.toRight();
  },
  40: function(){
    t1.toBottom();
  },
  37: function(){
    t1.toLeft();
  }
}
var keymapup1 = {
  38: function(){
    t1.stop();
  },
  39: function(){
    t1.stop();
  },
  40: function(){
    t1.stop();
  },
  37: function(){
    t1.stop();
  },
  32: function(){
    t1.shoot();
  }
}

var k1 = new KeyBoardHandler(window, keymapdown1, keymapup1);
t1.setKeyBoardHandler(k1);
