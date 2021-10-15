class Register extends Phaser.Scene
{

    constructor ()
    {
        super('register');
    }

    init() {
    }

    preload ()
    {
        this.load.html('register', '/html/register.html');
    }

    create ()
    {
        let scene = this;

        this.items = [];
        
        let element = this.add.dom(400, 600).createFromCache('register');

        element.addListener('click');

        element.on('click', function(event) {

            if (event.target.name === 'saveButton')
            {
                let result = this.getChildByID('output').value;

                result = "a:a\nac:ac\nabc:abc";

                let items = result.split("\n");
                for(let i=0;i<items.length;i++) {
                    let parts = items[i].split(":");
                    scene.items.push({word:parts[0],tip:parts[1]});
                }
                //  Turn off the click events
                element.removeListener('click');

                //  Hide the login element
                element.setVisible(false);

                this.scene.showResult();
            }
            if(event.target.name === 'addButton') {
                let word = this.getChildByName('word');
                let tip = this.getChildByName('tip');
                let result = this.getChildByID('output');

                scene.items.push({
                    word:word.value,
                    tip:tip.value
                });

                result.value += word.value + ":" + tip.value + "\n";
                word.value = "";
                tip.value = "";
                word.focus();
            }
        });

        this.tweens.add({
            targets: element,
            y: 300,
            duration: 3000,
            ease: 'Power3'
        });

        return;
    }

    showResult() {
        if(!this.validateInput()) {
            return;
        }
    }

    validateInput() {
        this.words = [];
        this.words[0] = {x:0,y:1,direction:Main.direction.UP,word:this.items[0].word,tip:this.items[0].tip}
        let maxX = 14;
        let maxY = 12;

        let minX = 0;
        let minY = 1;
        for(let i=1;i<this.items.length;i++) {
            let hasFound = false;
            for(let j=0;j<i;j++) {
                let letters = this.items[j].word.split("");
                for(let index in letters) {
                    let indexOf = this.items[i].word.indexOf(letters[index]);
                    index = parseInt(index);
                    while(indexOf > -1) {
                        let direction;
                        let word = {};
                        if(this.words[j].direction==Main.direction.UP) {
                            direction=Main.direction.RIGHT;
                            word.x = this.words[j].x - (1 + indexOf);
                            this.words[j].y += index-1;
                            word.y = index + 1;
                            minX = Math.min(minX,word);
                            minY = Math.min(minY,this.words[j].y);
                            minY = Math.min(minY,word.y);
                        } else {
                            direction=Main.direction.UP;
                            word.y = this.words[j].y - (1 + indexOf);
                            this.words[j].x += index-1;
                            word.x = index + 1;                            
                        }
                        word.word = this.items[i].word;
                        word.tip = this.items[i].tip;
                        word.direction = direction;
                        if(!this.inside(word)) {
                            this.words.push(word);
                            hasFound = true;
                            break;
                        }
                        indexOf = this.items[i].word.indexOf(letters[index],indexOf+1);
                    }
                }

                if(hasFound) {
                    break;
                }
            }
        }
        this.scene.start('main', {
            words:this.words,
            grid: {
                x:maxX,y:maxY
            }
        });
    }

    inside(word) {
        for(let i=0;i<this.words.length;i++) {
            let letters = this.words[i].word.split("");
            if(this.words[i].x >= word.x && 
                this.words[i].x <= word.x+letters.length &&
                this.words[i].y >= word.y && 
                this.words[i].y <= word.y+letters.length &&
                this.words[i].direction == word.direction) {
                return true;
            }
        }
        return false;
    }

    keyPress(key) {
        return function() {
            if(this.selected) {
                this.selected.setText(key);
            }
        }
    }

    moveDirection(x,y) {
        this.collection
            [x+Main.directionMove[this.position].x]
            [y+Main.directionMove[this.position].y].select();
    }

    showMessage() {
        let back = this.add.rectangle(0,0,800,600,0x000000);
        back.alpha = 0.6;
        back.setOrigin(0);
  
        const text = this.add.text(400, 300, this.message, { fontFamily: "Arial Black", fontSize: 82 });
        text.setOrigin(0.5);
  
        text.setStroke('#000000', 4);
        //  Apply the gradient fill.
        const gradient = text.context.createLinearGradient(0, 0, 0, text.height);
  
        if(this.hasWon) {
          gradient.addColorStop(0, '#111111');
          gradient.addColorStop(.5, '#00ff00');
          gradient.addColorStop(.5, '#11aa11');
          gradient.addColorStop(1, '#111111');
        } else {
          gradient.addColorStop(0, '#111111');
          gradient.addColorStop(.5, '#ffffff');
          gradient.addColorStop(.5, '#aaaaaa');
          gradient.addColorStop(1, '#111111');
        }
  
        back.setInteractive();
        back.on(
            "pointerdown",
            () => {
                text.destroy();
                back.destroy();
            });
        text.setFill(gradient);
      }

}