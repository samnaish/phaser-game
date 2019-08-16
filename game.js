var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: function () {
            this.load.image('sky', 'assets/sky.png');
            this.load.image('ground', 'assets/platform.png');
            this.load.image('star', 'assets/star.png');
            this.load.image('bomb', 'assets/bomb.png');
            this.load.spritesheet('dude', 'assets/dude.png',
                { frameWidth: 32, frameHeight: 48 }
            );
            this.load.audio('Jump', 'assets/Jump.wav');
            this.load.audio('background-music', 'assets/background-music.ogg');
            this.load.audio('sacre', 'assets/sacre-bleu.ogg');
        },
        create: function () {           
            const background = this.sound.add('background-music');
            background.loop = true;
            background.volume = 0.2;
            background.play();

            const sacre = this.sound.add('sacre');
            this.jumpSound = this.sound.add('Jump');
            const platforms = this.physics.add.staticGroup();
            


            let score = 0;

            this.add.image(400, 300, 'sky');
            const scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
            const timerText = this.add.text(600, 16, '0', { fontSize: '32px', fill: '#000' });
            platforms.create(400, 568, 'ground').setScale(2).refreshBody();
            platforms.create(600, 400, 'ground');
            platforms.create(50, 250, 'ground');
            platforms.create(750, 220, 'ground');

            let seconds = 0;
            const timer = setInterval(() => {
                seconds++;
                const hours = Math.floor(seconds / (60 * 60))
                const minutes = Math.floor(seconds / 60);
                const secondsRemainder = seconds % 60;
                timerText.setText(`${hours}h:${minutes}m:${secondsRemainder}s`); 
            }, 1000)

            this.player = this.physics.add.sprite(100, 450, 'dude');

            this.player.setBounce(0.2);
            this.player.setCollideWorldBounds(true);

            this.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        
            this.anims.create({
                key: 'turn',
                frames: [ { key: 'dude', frame: 4 } ],
                frameRate: 20
            });
        
            this.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
                frameRate: 10,
                repeat: -1
            });

            this.physics.add.collider(this.player, platforms);
            
            this.cursors = this.input.keyboard.createCursorKeys();          
            const stars = this.physics.add.group({
                key: 'star',
                repeat: 11,
                setXY: {
                    x: 12,
                    y: 0,
                    stepX: 70
                }
            });
            stars.children.iterate(function (child) {
                child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            }); 
            this.physics.add.collider(stars, platforms);

            this.physics.add.overlap(this.player, stars, (player, star) => {
                star.disableBody(true, true);

                score += 15;
                scoreText.setText(`Score: ${score}`);

                if (stars.countActive(true) === 0) {
                    stars.children.iterate((child) => {
                        child.enableBody(true, child.x, 0, true, true)
                    });
                }

                // if player's X coordinate is less than 400 - gnerate a number between 400 and 800 - else generate a number 0 and 400
                const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
                const bomb = bombs.create(x, 16, 'bomb');
                bomb.setCollideWorldBounds(true);
                bomb.setBounce(1);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

            }, null, this);

            const bombs = this.physics.add.group();

            this.physics.add.collider(bombs, platforms);

            this.physics.add.collider(this.player, bombs, (player, bomb) => {
                this.physics.pause();
                this.player.setTint(0xff0000);
                this.player.anims.play('turn');
                this.gameOver = true;
                clearInterval(timer);
                sacre.play();
            }, null, this)
        },
        update: function () {
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                this.player.anims.play('left', true);
            }
            else if (this.cursors.right.isDown) {
                this.player.setVelocityX(160);
                this.player.anims.play('right', true);
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('turn');
            }
        
            if (this.cursors.up.isDown && this.player.body.touching.down) {
                this.player.setVelocityY(-330);
                this.jumpSound.play();
            }

        }
    }
};

var game = new Phaser.Game(config);