class Main extends Phaser.Scene
{

    constructor ()
    {
        super('main');
    }

    init(data) {
        this.isMain = data.isMain;
        this.playerList = data.playerList;
        this.started = false;
    }

    preload ()
    {
        this.load.html('main', 'html/main.html');
    }

    create ()
    {
        let element = this.add.dom(800 / 2, 0).createFromCache('main');

        if(!this.isMain) {
            document.getElementById("startButton").style.display = 'none';
        }

        let list = this.add.text(30, 30, this.playerList, {
            fontSize: 30,
            fontFamily: 'Arial',
            color:'#000000',
            wordWrap: { width: 200, useAdvancedWrap: true }
        });

        element.addListener('click');

        socket.on('refresh player list', (msg) => {
            list.setText(msg.playerList);
        });

        socket.on('sent player', (msg) => {
            document.getElementById("jogador").innerHTML = "Jogador Atual:" + msg.playerName;
            document.getElementById("palavra").innerHTML = "Palavra Atual:" + msg.word;
            element.setVisible(true);            
            this.started = true;
        });

        socket.on('timeout', (msg) => {
            element.setVisible(false);
            GameAwakeUtils.Counter.show(this, 400, 120, msg.word + "\nera a palavra!",1,3,() => {
                socket.emit("next player");
            });
        });

        socket.on('end game', (msg) => {
            element.setVisible(false);
            GameAwakeUtils.Counter.show(this, 400, 120, "Fim do jogo!",0,3,() => {
                window.location.reload();
            });
        });

        let textarea = document.getElementById('chat');
        let dica = document.getElementById("dica");

        socket.on('sent message', (msg) => {
            textarea.innerHTML += msg.playerName + ":" + msg.msg + "\n";
            if(msg.isCorrect) {
                element.setVisible(false);
                GameAwakeUtils.Counter.show(this, 400, 200, "Acertou!",0,3,() => {
                    socket.emit("next player");
                });
            }
            textarea.scrollTop = textarea.scrollHeight;
        });

        element.on('click', (event) => {

            if (event.target.name === 'startButton')
            {
               document.getElementById("startButton").style.display = 'none';
               socket.emit("start");
            }
            if (event.target.name === 'sendButton')
            {
                if(this.started) {
                    let dicaValue = dica.value.toUpperCase();
                    socket.emit('chat message', {playerName:playerName, msg:dicaValue});
                }
            }
        });

        this.tweens.add({
            targets: element,
            y: 200,
            duration: 500,
            ease: 'Power3'
        });
    }

}