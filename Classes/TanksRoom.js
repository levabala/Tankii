function TanksRoom(container, map){
  var objects = [];
  var tr = this;
  this.map = map;
  this.ground = document.createElementNS("http://www.w3.org/2000/svg",'rect');
  setAttr(this.ground, 'x', 0);
  setAttr(this.ground, 'y', 0);
  setAttr(this.ground, 'width', this.map.width);
  setAttr(this.ground, 'height', this.map.height);
  setAttr(this.ground, 'fill', 'lightgreen');
  setAttr(this.ground, 'style', 'fill-opacity: 0.3');
  container.append(this.ground)

  this.addObject = function(obj){
    container.append(obj.body);
    objects[objects.length] = obj;
  }

  this.removeObject = function(obj){
    //console.log(obj,objects.indexOf(obj), objects)
    var j = $(obj.body);
    j.remove();
    objects.splice(objects.indexOf(obj),1);
  }

  //test objects
  var w1 = new Wall(new Pos(20,5),3,8,10);
  this.addObject(w1);

  //this.map borders
  var leftWall = new Wall(new Pos(0,0),2,this.map.height,999);
  var rightWall = new Wall(new Pos(this.map.width-2,0),2,this.map.height,999);
  var topWall = new Wall(new Pos(2,0),this.map.width-2,2,999);
  var bottomWall = new Wall(new Pos(2,this.map.height-2),this.map.width-2,2,999);

  //this.map scaling
  setAttr(container, 'transform','scale('+this.map.xcoeff+','+this.map.ycoeff+')');

  //game ticking
  var ticktick = setInterval(function(){
    for (var o in objects)
      objects[o].move();
  },3)

  //logging
  /*var loginterval = setInterval(function(){
    var str = '';
    for (var y = 0; y < tr.map.field[0].length; y++){
      for (var x = 0; x < tr.map.field.length; x++)
        str += (tr.map.field[x][y].obj.hp) ? 1 : 0;
      str += '\n';
    }
    console.log(str);
  },300);*/

  //refresh interval
  setInterval(function(){
    $(container).hide().show(0);
  },16);

  //create functions
  this.createTank = function(){
    var tank = {};
    Tank.apply(tank,arguments);
    this.addObject(tank);
    return tank;
  }

  this.createWall = function(){
    var wall = {};
    Wall.apply(wall,arguments);
    this.addObject(wall);
    return wall;
  }

  function PhysicObject(pos,width,height,hp,rotation,speed){
    var phobj = this;
    this.pos = pos.clone();
    this.cellP = this.pos.clone();
    this.width = width;
    this.height = height;
    this.maxhp = hp;
    this.hp = this.maxhp;
    this.deathless = (hp >= 999) ? 1 : 0;
    this.stopping = false;
    this.isobstacle = true;

    var r = (this.rotation) ? this.rotation[0] * 180 + this.rotation[1] * 270 + this.rotation[3] * 90 : 0;
    this.body = document.createElementNS("http://www.w3.org/2000/svg",'g');
    setAttr(this.body, 'transform', 'translate(' + this.pos.X + ',' + this.pos.Y  + ') rotate(' + r + ',' + this.width/2 + ',' + this.height/2 + ')');
    setAttr(this.body, 'width', this.width);
    setAttr(this.body, 'height', this.height);

    //set it to the tr.map
    for (var dx = 0; dx < phobj.width; dx++)
      for (var dy = 0; dy < phobj.height; dy++)
        tr.map.field[pos.X + dx][pos.Y + dy].obj = phobj;


    this.damaged = function(damage){
      if (phobj.deathless) return;

      phobj.hp -= damage;
      console.log(phobj.hp)
      if (phobj.hp < 4)
        phobj.killSelf();

      phobj.body.setAttributeNS(null,'fill-opacity', phobj.hp / phobj.maxhp)
    }

    this.move = function(){

    }

    this.killSelf = function(){
      //remove svg element
      phobj.body.setAttributeNS(null,'width','0');
      phobj.body.setAttributeNS(null,'height','0');
      tr.removeObject(phobj);

      //remove from the tr.map
      for (var dx = 0; dx < phobj.width; dx++)
        for (var dy = 0; dy < phobj.height; dy++)
          tr.map.field[phobj.cellP.X + dx][phobj.cellP.Y + dy].obj = {isobstacle: false};

      //disable keyboard or mouse event listener
      if (phobj.handler) handler.disable();
    }
  }




  function MobilePhysicObject(pos,width,height,hp,rotation,speed){
    PhysicObject.apply(this,arguments)
    var phobj = this;
    this.nextRotation = this.rotation;

    this.rotation = rotation;
    this.speed = speed;
    this.moveOn = 0;

    this.isVeryNear = function(){
      return ((phobj.pos.X - Math.floor(phobj.pos.X) <= phobj.speed*1.1 || Math.ceil(phobj.pos.X) - phobj.pos.X <= phobj.speed*1.1) && (phobj.pos.Y - Math.floor(phobj.pos.Y) <= phobj.speed*1.1 || Math.ceil(phobj.pos.Y) - phobj.pos.Y <= phobj.speed*1.1))
    }

    this.IWantToDoSmth = function(){

    }

    var checkCollisionFuns = {
      0: function(){
        for (var x = 0; x < phobj.width; x++)
          if (tr.map.field[phobj.cellP.X+x][phobj.cellP.Y-1].obj.isobstacle) return tr.map.field[phobj.cellP.X+x][phobj.cellP.Y-1].obj;
        return false;
      },
      1: function(){
        for (var y = 0; y < phobj.height; y++)
          if (tr.map.field[phobj.cellP.X+phobj.width][phobj.cellP.Y+y].obj.isobstacle) return tr.map.field[phobj.cellP.X+phobj.width][phobj.cellP.Y+y].obj;
        return false;
      },
      2: function(){
        for (var x = 0; x < phobj.width; x++)
          if (tr.map.field[phobj.cellP.X+x][phobj.cellP.Y+phobj.height+1].obj.isobstacle) return tr.map.field[phobj.cellP.X+x][phobj.cellP.Y+phobj.height+1].obj;
        return false;
      },
      3: function(){
        for (var y = 0; y < phobj.height; y++)
          if (tr.map.field[phobj.cellP.X-1][phobj.cellP.Y+y].obj.isobstacle) return tr.map.field[phobj.cellP.X-1][phobj.cellP.Y+y].obj;
        return false;
      },
      '-1': function(){
        return false;
      }
    }

    this.collisionCaseAction = function(){

    }

    this.move = function(){
      var collResult = checkCollisionFuns[phobj.rotation.indexOf(1)]();
      if (collResult){
        phobj.collisionCaseAction(collResult);
      }
      phobj.IWantToDoSmth();
      phobj.pos.X += (phobj.rotation[1] * phobj.speed - phobj.rotation[3] * phobj.speed) * phobj.moveOn;
      phobj.pos.Y += (phobj.rotation[2] * phobj.speed - phobj.rotation[0] * phobj.speed) * phobj.moveOn;
      var newcellP = new Pos((phobj.pos.X - Math.floor(phobj.pos.X) < Math.ceil(phobj.pos.X) - phobj.pos.X) ? Math.floor(phobj.pos.X) : Math.ceil(phobj.pos.X), ((phobj.pos.Y - Math.floor(phobj.pos.Y) < Math.ceil(phobj.pos.Y) - phobj.pos.Y)) ? Math.floor(phobj.pos.Y) : Math.ceil(phobj.pos.Y));
      if (!phobj.cellP.compareWith(newcellP)){
        updatemapPosition(phobj.cellP, newcellP)
        phobj.cellP = newcellP;
      }

      updateView()
    }

    this.toTop = function(){
      initWaitingToRotate([1,0,0,0])
    }

    this.toRight = function(){
      initWaitingToRotate([0,1,0,0])
    }

    this.toBottom = function(){
      initWaitingToRotate([0,0,1,0])
    }

    this.toLeft = function(){
      initWaitingToRotate([0,0,0,1])
    }

    this.stop = function(){
      if (phobj.moveOn == 0) return;
      phobj.stopping = true;
      phobj.IWantToDoSmth = function(){
        if (phobj.isVeryNear()){
          phobj.pos = new Pos((phobj.pos.X - Math.floor(phobj.pos.X) < Math.ceil(phobj.pos.X) - phobj.pos.X) ? Math.floor(phobj.pos.X) : Math.ceil(phobj.pos.X), ((phobj.pos.Y - Math.floor(phobj.pos.Y) < Math.ceil(phobj.pos.Y) - phobj.pos.Y)) ? Math.floor(phobj.pos.Y) : Math.ceil(phobj.pos.Y));
          phobj.moveOn = 0;
          phobj.IWantToDoSmth = function(){};
        }
      }
    }

    this.setKeyBoardHandler = function(kbh){
      phobj.kbhandler = kbh;
    }

    function updateView(){
      var r = phobj.rotation[0] * 180 + phobj.rotation[1] * 270 + phobj.rotation[3] * 90;
      phobj.body.setAttributeNS(null,'transform', 'translate(' + (phobj.pos.X) + ',' + (phobj.pos.Y) + ') rotate(' + r + ',' + phobj.width/2 + ',' + phobj.height/2 + ')');
    }

    function updatemapPosition(oldP, newP){
      for (var dx = 0; dx < phobj.width; dx++)
        for (var dy = 0; dy < phobj.height; dy++)
          tr.map.field[oldP.X + dx][oldP.Y + dy].obj = {isobstacle: false};

      for (var dx = 0; dx < phobj.width; dx++)
        for (var dy = 0; dy < phobj.height; dy++)
          tr.map.field[newP.X + dx][newP.Y + dy].obj = phobj;

      /*var str = '';
      for (var x = 0; x < tr.map.field.length; x++){
        for (var y = 0; y < tr.map.field[0].length; y++)
          str += (tr.map.field[x][y].obj != null) ? 1 : 0;
        str += '\n';
      }
      console.log(str);*/
    }

    function initWaitingToRotate(rotation){
      if (phobj.rotation == rotation) return;
      if (!checkCollisionFuns[rotation.indexOf(1)]())
        phobj.IWantToDoSmth = function(){
          if (phobj.isVeryNear()){
            phobj.rotation = rotation
            phobj.moveOn = 1;
            phobj.IWantToDoSmth = function(){};
          }
        }
      else
        phobj.IWantToDoSmth = function(){
          if (phobj.isVeryNear()){
            phobj.rotation = rotation
            phobj.IWantToDoSmth = function(){};
          }
        }
    }
  }

  function Tank(pos,width,height,hp,rotation,speed){
    pos = new Pos(Math.floor(pos.X), Math.floor(pos.Y));
    MobilePhysicObject.apply(this,arguments)

    var tank = this;
    this.deltaP = new Pos(pos.X - Math.floor(pos.X), pos.Y - Math.floor(pos.Y))
    this.kbhandler = false;

    var rect = document.createElementNS("http://www.w3.org/2000/svg",'rect');
    setAttr(rect, 'x', 0);
    setAttr(rect, 'y', 0);
    setAttr(rect, 'width', this.width);
    setAttr(rect, 'height', this.height);
    setAttr(rect, 'fill', 'brown');
    var turret = document.createElementNS("http://www.w3.org/2000/svg",'rect');
    setAttr(turret, 'x', 1);
    setAttr(turret, 'y', 1);
    setAttr(turret, 'width', this.width-2);
    setAttr(turret, 'height', 2);
    setAttr(turret, 'fill', 'darkred');
    var gun = document.createElementNS("http://www.w3.org/2000/svg",'rect');
    setAttr(gun, 'x', 2);
    setAttr(gun, 'y', 2);
    setAttr(gun, 'width', 1);
    setAttr(gun, 'height', this.height-2);
    setAttr(gun, 'fill', 'red');

    this.body.appendChild(rect);
    this.body.appendChild(turret);
    this.body.appendChild(gun);

    this.collisionCaseAction = function(){
      tank.stop();
    }

    this.shoot = function(){
      var x = tank.pos.X+tank.rotation[3]*-1+tank.rotation[1]*tank.width+(1-(tank.rotation[1]+tank.rotation[3]))*Math.floor(tank.width/2);
      var y = tank.pos.Y+tank.rotation[0]*-1+tank.rotation[2]*tank.height+(1-(tank.rotation[0]+tank.rotation[2]))*Math.floor(tank.height/2);
      var shell = new Shell(new Pos(x, y), 1, 1, 1, tank.rotation, 0.4, 5);
      tr.addObject(shell);
    }
  }

  function Shell(pos,width,height,hp,rotation,speed,deathAmount){
    pos = new Pos(Math.floor(pos.X), Math.floor(pos.Y));
    MobilePhysicObject.apply(this,arguments)

    var shell = this;
    this.isobstacle = false;
    this.moveOn = 1;
    this.deathAmount = deathAmount;

    var rect = document.createElementNS("http://www.w3.org/2000/svg",'rect');
    setAttr(rect, 'x', 0);
    setAttr(rect, 'y', 0);
    setAttr(rect, 'width', this.width);
    setAttr(rect, 'height', this.height*1.5);
    setAttr(rect, 'fill', 'darkgreen');
    this.body.appendChild(rect);

    this.collisionCaseAction = function(obj){
      obj.damaged(shell.deathAmount);
      shell.killSelf();
    }
  }

  function Wall(pos,width,height,hp){
    pos = new Pos(Math.floor(pos.X), Math.floor(pos.Y));
    PhysicObject.apply(this,arguments)

    var rect = document.createElementNS("http://www.w3.org/2000/svg",'rect');
    setAttr(rect, 'x', 0);
    setAttr(rect, 'y', 0);
    setAttr(rect, 'width', this.width);
    setAttr(rect, 'height', this.height);
    setAttr(rect, 'fill', 'darkgray');

    this.body.append(rect);

  }

  this.TurnOnMapDrawing = function(){
    
  }
}
