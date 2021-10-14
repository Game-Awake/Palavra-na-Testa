class Main extends Phaser.Scene
{

    constructor ()
    {
        super('main');
    }

    init(data) {
        this.name = data.name;
        this.word  = data.word;
    }

    preload ()
    {
        this.load.html('main', 'html/main.html');
    }

    create ()
    {
        let element = this.add.dom(800 / 2, 0).createFromCache('main');
    
        element.addListener('click');

        document.getElementById("jogador").innerHTML += "Bruno";

        element.on('click', (event) => {

            if (event.target.name === 'sendButton')
            {
                let textarea = document.getElementById('chat');
                textarea.innerHTML += playerName + ":" + document.getElementById("dica").value + "\n";
                document.getElementById("dica").value = "";
                textarea.scrollTop = textarea.scrollHeight;
            }
        });

        this.tweens.add({
            targets: element,
            y: 300,
            duration: 500,
            ease: 'Power3'
        });
    }

    showMessage(isTip) {
        let back = this.add.rectangle(0,0,800,600,0x000000);
        back.alpha = 0.6;
        back.setOrigin(0);
  
        let text;
        if(isTip) {
            text = this.add.text(400, 300, this.message, { 
                backgroundColor: '#68b5e9',
                fontFamily: "Arial Black",
                fontSize: 43 , 
                wordWrap: { width: 780, useAdvancedWrap: true }
            });
            text.setOrigin(0.5);
            text.setPadding(64, 16);
        } else {
            text = this.add.text(400, 300, this.message, { fontFamily: "Arial Black", fontSize: 82 });
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
            text.setFill(gradient);
        }
  
        back.setInteractive();
        back.on(
            "pointerdown",
            () => {
                text.destroy();
                back.destroy();
            });
      }

}