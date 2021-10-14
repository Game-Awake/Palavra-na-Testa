class Game extends Phaser.Scene
{
    constructor ()
    {
        super('game');
    }

    preload ()
    {
        this.load.html('create', 'html/create.html');
        this.load.html('start', 'html/start.html');
    }

    create ()
    {
        let element = null;
        if(jogo) {
            element = this.add.dom(800 / 2, 0).createFromCache('start');
    
            element.addListener('click');
    
            element.on('click', (event) => {
    
                if (event.target.name === 'startButton')
                {
                    playerName = document.getElementById("nome").value;
                    //  Turn off the click events
                    element.removeListener('click');
    
                    //  Hide the login element
                    element.setVisible(false);
    
                    this.scene.start('main');
                }
            });
        } else {
            element = this.add.dom(800 / 2, 0).createFromCache('create');
    
            element.addListener('click');
    
            element.on('click', (event) => {
    
                if (event.target.name === 'createButton')
                {
                    //  Turn off the click events
                    element.removeListener('click');
    
                    //  Hide the login element
                    element.setVisible(false);
    
                    window.location.href = "http://127.0.0.1:5503/?jogo=1";
                }
            });
        }

        this.tweens.add({
            targets: element,
            y: 300,
            duration: 500,
            ease: 'Power3'
        });
    }
}

let url = new URL(window.location.href);
const jogo = url.searchParams.get("jogo");

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
    scene: [Game, Main, Register]
};

const options = {
    feelingSize: 48,
    plotSize: 64,
    cardWidth: 60,
    cardHeight: 124,
    marginY : (600 - 64 * 5)  / 2
}

let game = new Phaser.Game(config);
let playerName = "";

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