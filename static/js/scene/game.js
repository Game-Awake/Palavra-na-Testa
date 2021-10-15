class Game extends Phaser.Scene
{
    constructor ()
    {
        super('game');
    }

    preload ()
    {
        this.load.html('start', '/html/start.html');
    }

    create ()
    {
        let element = null;
        element = this.add.dom(800 / 2, 0).createFromCache('start');

        element.addListener('click');

        if(sala != null) {
            let text = element.getChildByName("sala");
            text.value = sala;
            text.disabled = true;
            sala = null;
        }

        element.on('click', (event) => {

            if (event.target.name === 'startButton')
            {
                socket.once('no rooms', function(msg) {
                    alert("Limite de sala atingida! Aguarde ou acesse a versão de um jogador");
                });
                socket.once('invalid room', function(msg) {
                    alert("Sala inválida!");
                });
                socket.once('room not active', function(msg) {
                    alert("Sala inativa!");
                });
                socket.once('wrong password', function(msg) {
                    alert("Senha incorreta!");
                });
                socket.once('open', (msg) => {
                    playerName = document.getElementById("nome").value;
                    this.scene.start('main',{isMain:msg.isMain,playerList:msg.playerList});
                });

                socket.emit("join", {
                    room: document.getElementById("sala").value,                    
                    password: document.getElementById("senha").value,
                    playerName: document.getElementById("nome").value,                    
                    word: document.getElementById("palavra").value.toUpperCase()
                });
            } else if (event.target.name === 'roomButton')
            {
                this.scene.start('create');
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

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent:"game",
        width: 800,
        height: 600
    },
    dom: {
        createContainer: true
    },
    scene: [Game, Create, Main, Register]
};

const options = {
    feelingSize: 48,
    plotSize: 64,
    cardWidth: 60,
    cardHeight: 124,
    marginY : (600 - 64 * 5)  / 2
}

var game = new Phaser.Game(config);

var playerName = "";
var sala = null;

function checkUserAgent(name)
{
	if (navigator.userAgent.indexOf(name) != -1)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function isMobile ()
{
	'use strict';
	
	let device = false;
	
	function checkUserAgent (name)
	{
		if (navigator.userAgent.indexOf(name) != -1)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	
	if (checkUserAgent('Android'))
	{
		device	= true;
	}
	else if (checkUserAgent('iPhone') && !window.MSStream)
	{
		device	= true;
	}
	else if (checkUserAgent('Mac OS') || checkUserAgent('Macintosh'))
	{
		device = false;
	}
	else if (checkUserAgent('Windows'))
	{
		device = false;
	}

	return device;
}