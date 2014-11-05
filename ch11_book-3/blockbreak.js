$(function() {
  var Q = window.Q = Quintus()
                     .include('Input,Sprites,Scenes,Touch,UI,Audio')
                     .setup()
                     .enableSound()
                     .touch();
  Q.input.mouseControls();
  Q.input.keyboardControls();


  Q.Sprite.extend("Paddle", {     // extend Sprite class to create Q.Paddle subclass
    init: function(p) {
      this._super(p, {
        sheet: 'paddle',
        speed: 200,
        x: 0,
      });
      this.p.x = (Q.width/2 - this.p.w/2) + 35;
      this.p.y = Q.height - this.p.h;
      if(Q.input.keypad.size) {
        this.p.y -= Q.input.keypad.size + this.p.h;
      }
    },

    step: function(dt) {
      this.p.x = Q.inputs['mouseX'];
      if(this.p.x < 0) { 
        this.p.x = 0;
      } else if(this.p.x > Q.width - this.p.w) { 
        this.p.x = Q.width - this.p.w;
      }
//      this._super(dt);	      // no need for this call anymore
    }
  });
  
   Q.UI.Text.extend("Lives",{
    init: function() {
      this._super({
        label: "lives: 3",
        align: "left",
        color: "#FF8330",
        x: 70,
        y: Q.height - (Q.height -15),
        weight: "normal",
        size:18
      });

      Q.state.on("change.lives",this,"lives");
    },

    lives: function(lives) {
      this.p.label = "lives: " + lives;
    }
  });

  Q.UI.Text.extend("Score",{
    init: function() {
      this._super({
        label: "score: 0",
        align: "right",
        color: "#FF8330",
        x: Q.width - 70,
        y: Q.height - (Q.height -15),
        weight: "normal",
        size:18
      });

      Q.state.on("change.score",this,"score");
    },

    score: function(score) {
      this.p.label = "score: " + score;
    }
  });
  

  Q.Sprite.extend("Ball", {
    init: function(p) {
      this._super({
        sheet: 'ball',
        speed: 200,
        dx: 1,
        dy: -1,
      });
      this.p.y = Q.height / 2 - this.p.h;
      this.p.x = Q.width / 2 + this.p.w / 2;
	  
	  this.on('hit', this, 'collision');  // Listen for hit event and call the collision method
	  
	  this.on('step', function(dt) {      // On every step, call this anonymous function
		  var p = this.p;
		  Q.stage().collide(this);   // tell stage to run collisions on this sprite

		  p.x += p.dx * p.speed * dt;
		  p.y += p.dy * p.speed * dt;

		  if(p.x < 0) { 
		  	Q.audio.play("powerdown.mp3");
			p.x = 0;
			p.dx = 1;
		  } else if(p.x > Q.width - p.w) { 
		  	Q.audio.play("powerdown.mp3");
			p.dx = -1;
			p.x = Q.width - p.w;
		  }

		  if(p.y < 0) {
		  	Q.audio.play("powerdown.mp3");
			p.y = 0;
			p.dy = 1;
		  } 
	      else if(p.y > Q.height) { 
	      	Q.state.dec("lives",1); 
	      	p.y = this.p.y = Q.height / 3 - this.p.h;
	      	
	      	     	
	      	   	
		  }
		  
		  if(Q.state.get("lives") <= 0)
		  	{
		  		Q.stageScene('youLose');
		  	}
	  });
    },
	collision: function(col) {                // collision method
		if (col.obj.isA("Paddle")) {
			Q.audio.play("powerup.mp3");
//			alert("collision with paddle");
			this.p.dy = -1;
		} else if (col.obj.isA("Block")) {
//			alert("collision with block");
			Q.audio.play("brickDeath.mp3");
			Q.state.inc("score",1);
			col.obj.destroy();
			this.p.dy *= -1;
			Q.stage().trigger('removeBlock');
		}
	}
  });

  Q.Sprite.extend("Block", {
    init: function(props) {
      this._super(_(props).extend({ sheet: 'block'}));
      this.on('collision',function(ball) { 
      	
        this.destroy();
        ball.p.dy *= -1;
        Q.stage().trigger('removeBlock');
       
      });
    }
  });

//  Q.load(['blockbreak.png','blockbreak.json'], function() {
  Q.load(['blockbreak.png', "brickDeath.mp3", "powerdown.mp3",
     "powerup.mp3" ], function() {
    // Q.compileSheets('blockbreak.png','blockbreak.json');  
	Q.sheet("ball", "blockbreak.png", { tilew: 20, tileh: 20, sy: 0, sx: 0 });
	Q.sheet("block", "blockbreak.png", { tilew: 40, tileh: 20, sy: 20, sx: 0 });
	Q.sheet("paddle", "blockbreak.png", { tilew: 60, tileh: 20, sy: 40, sx: 0 });	
	Q.scene('title', function(stage) {
	stage.insert(new Q.UI.Text({ 
      label: "Welcome to\n BLOCKBREAK",
      color: "#FF8330", // orange
      align: 'center',
      x: Q.width/2,
      y: 130
    }));
    stage.insert(new Q.UI.Text({
      label: "During the game:\n Use the Mouse to\n Control the Paddle",
      align: 'center',
      color: "#FF8330",
      x: Q.width/2,
      y: 300,
      weight: "normal",
      size: 20
    }));
     stage.insert(new Q.UI.Button({
      label: "Click Here to Begin",
      y: 220,
      x: Q.width/2,
      fill: "#33CC33",
      border: 5,
    
    }, function() {
    		Q.clearStage();
      		Q.stageScene('game');
    }));
        });
        
  
  
  // You Lose Scene
  
    Q.scene('youLose', function(stage) {
	 stage.insert(new Q.UI.Text({ 
      label: "You Lose!!!!",
      color: "#FF8330",
      align: 'center',
      x: Q.width/2,
      y: 150
    }));
 
     stage.insert(new Q.UI.Button({
      label: "Click Here to Return to Title",
      y: 220,
      x: Q.width/2,
      fill: "#33CC33",
      border: 5,
   
      
    }, function() {
    		Q.clearStage();
      		Q.stageScene('title');
    }));
        });   
        
        
   // You won screen     
        
    Q.scene('youWon', function(stage) {
	 stage.insert(new Q.UI.Text({ 
      label: "You Won!!!!",
      color: "#FF8330",
      align: 'center',
      x: Q.width/2,
      y: 150
    }));
 
     stage.insert(new Q.UI.Button({
      label: "Click Here to Return to Title",
      y: 220,
      x: Q.width/2,
      fill: "#33CC33",
      border: 5,
    }, function() {
    		Q.clearStage();
      		Q.stageScene('title');
    }));
        });   
	
		 		 
    Q.scene('game',new Q.Scene(function(stage) {
      Q.state.reset({ score: 0, lives: 3});
      stage.insert(new Q.Paddle());
      stage.insert(new Q.Ball());
      stage.insert(new Q.Score());
      stage.insert(new Q.Lives());
     

      var blockCount=0;
      for(var x=0;x<6;x++) {
        for(var y=0;y<5;y++) {
          stage.insert(new Q.Block({ x: x*50+35, y: (y*30+15)+20 }));
          blockCount++;
        }
      }
      stage.on('removeBlock',function() {
        blockCount--;
        
        if(blockCount == 0) {
          Q.stageScene('youWon');
        }
      });

    }));
    
    
    
    Q.stageScene('title');
  });  

  
});





	