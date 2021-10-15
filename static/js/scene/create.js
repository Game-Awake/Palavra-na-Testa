class Create extends Phaser.Scene
{
    constructor ()
    {
        super('create');
    }

    preload ()
    {
        this.load.html('create', '/html/create.html');
    }

    create ()
    {
        let element = null;
        element = this.add.dom(800 / 2, 0).createFromCache('create');

        element.addListener('click');

        socket.once("on create", (msg) => {
            sala = msg.sala;
            //this.scene.remove("game");
            this.scene.start("game");

        });

        element.on('click', (event) => {

            if (event.target.name === 'createButton')
            {
                socket.emit("creator",{password:document.getElementById("senha").value});
                socket.once('no rooms', function(msg) {
                    alert("Limite de sala atingida! Aguarde ou acesse a versão de um jogador");
                });
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
