// app.ts

import * as PIXI from 'pixi.js'

interface EngineParams {
    containerId: string,
    canvasW: number,
    canvasH: number
}

class Engine {
    public container: HTMLElement;
    public loader: PIXI.Loader;
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    public graphics: PIXI.Graphics;

    constructor(params: EngineParams) {
        this.loader = PIXI.Loader.shared;
        this.renderer = PIXI.autoDetectRenderer({
            width: params.canvasW,
            height: params.canvasH,
            antialias: true
        });
        this.stage = new PIXI.Container();
        this.graphics = new PIXI.Graphics();

        this.container = params.containerId ? document.getElementById(params.containerId) || document.body : document.body;
        this.container.appendChild(this.renderer.view);
    } // constructor
} // Engine

const engine = new Engine({
    containerId: 'game',
    canvasW: 800,
    canvasH: 450,
});

let ballsPerRow = 10;

let radiusBall = ((engine.renderer.width / ballsPerRow) / 2) - 5 > 20 ? 20 : ((engine.renderer.width / ballsPerRow) / 2) - 5;
let ballsTracker = fillBallsTracker(59);
let ballsArray = fillBallsArray(ballsTracker);
let winningBallTracker = [0, 0, 0, 0, 0, 0];
let winningBallArray: PIXI.Graphics[] = [];
let pickedBallTracker = [0, 0, 0, 0, 0, 0];
let resetButton = createButton('Reset', engine.renderer.width - 200, 50, reset)
let luckyDipButton = createButton('Lucky Dip', engine.renderer.width - 200, 100, randomPick)
let startGameButton = createButton('Start Game', engine.renderer.width - 200, 150, startGame)
engine.stage.addChild(resetButton);
engine.stage.addChild(luckyDipButton);
engine.stage.addChild(startGameButton);

// ==============
// === STATES ===
// ==============

window.onload = load;

function fillBallsTracker(max: number) {
    let arrayTracker = [];
    for (let i = 0; i < max; i++) {
        arrayTracker.push(false);
    }
    return arrayTracker
}

function fillBallsArray(arrayTracker: boolean[]) {
    let arrayFilled = []
    for (let i = 0; i < arrayTracker.length; i++) {
        let ball = new PIXI.Graphics();
        ball.beginFill(0xFFFFFF);
        ball.lineStyle(0);
        ball.drawCircle(radiusBall + 5, radiusBall + 5, radiusBall);
        ball.endFill();
        let text = new PIXI.Text((i + 1).toString(),
            {
                font: '12px Arial',
                fill: 0x666666,
            });
        text.anchor.set(0.25);
        text.width = i > 8 ? radiusBall * (2 / 3) : radiusBall / 2;
        text.height = radiusBall * (2 / 3);
        text.x = ball.width / 2;
        text.y = ball.height / 2;
        ball.addChild(text);
        ball.interactive = true;
        ball.on('pointerdown', () => { handleBallClick(ball, i) });
        arrayFilled.push(ball);
    }
    return arrayFilled
}

function handleBallClick(ball: PIXI.Graphics, i: number) {
    if (pickedBallTracker.indexOf(i + 1) >= 0) {
        pickedBallTracker[pickedBallTracker.indexOf(i + 1)] = 0;
        ball.clear();
        ball.beginFill(0xFFFFFF);
        ball.lineStyle(0);
        ball.drawCircle(radiusBall + 5, radiusBall + 5, radiusBall);
        ball.endFill();
        return
    }
    for (let j = 0; j < pickedBallTracker.length; j++) {
        if (pickedBallTracker[j] === 0) {
            pickedBallTracker[j] = i + 1;
            ball.clear();
            ball.beginFill(0xff9900, 1)
            ball.lineStyle(0);
            ball.drawCircle(radiusBall + 5, radiusBall + 5, radiusBall);
            ball.endFill();
            break
        }
    }
    if (pickedBallTracker.indexOf(0) < 0) {
        activateDeactivateButton(startGameButton)
    }
}

function displayStandardBalls() {
    let yTracker = ballsArray[0].y
    let columnTracker = 0;
    for (let i = 0; i < ballsArray.length; i++) {
        //set ball position + set ball functions
        ballsArray[i].x = 10 * columnTracker + (columnTracker) * (2 * radiusBall);
        ballsArray[i].y = yTracker;
        columnTracker++;
        if ((i + 1) % ballsPerRow == 0) {
            columnTracker = 0;
            yTracker = yTracker + 10 + 2 * radiusBall;
        }

        engine.stage.addChild(ballsArray[i]);
    }
}

function randomPick() {
    for (let i = 0; i < pickedBallTracker.length; i++) {
        let randomNumber = Math.floor(Math.random() * 58 + 1);
        if (pickedBallTracker[i] !== 0) {
            continue;
        }
        if (pickedBallTracker.indexOf(randomNumber) >= 0) {
            i--;
            continue
        }
        pickedBallTracker[i] = randomNumber;
        ballsArray[randomNumber - 1].clear();
        ballsArray[randomNumber - 1].beginFill(0xff9900, 1)
        ballsArray[randomNumber - 1].lineStyle(0);
        ballsArray[randomNumber - 1].drawCircle(radiusBall + 5, radiusBall + 5, radiusBall);
        ballsArray[randomNumber - 1].endFill();
    }

    if (pickedBallTracker.indexOf(0) < 0) {
        activateDeactivateButton(startGameButton)
    }
}

function randomDraw() {
    if (winningBallTracker.indexOf(0) < 0) return
    for (let i = 0; i < winningBallTracker.length; i++) {
        let randomNumber = Math.floor(Math.random() * 58 + 1);
        if (winningBallTracker.indexOf(randomNumber) >= 0) {
            i--;
            continue
        }
        winningBallTracker[i] = randomNumber;
    }

    for (let i = 0; i < winningBallTracker.length; i++) {
        let ball = new PIXI.Graphics();
        ball.beginFill(0x9fff80);
        ball.lineStyle(0);
        ball.drawCircle(radiusBall + 5, radiusBall + 5, radiusBall);
        ball.endFill();
        let text = new PIXI.Text(winningBallTracker[i].toString(),
            {
                font: '12px Arial',
                fill: 0x666666,
            });
        text.anchor.set(0.25);
        text.width = winningBallTracker[i] > 8 ? radiusBall * (2 / 3) : radiusBall / 2;
        text.height = radiusBall * (2 / 3);
        text.x = ball.width / 2;
        text.y = ball.height / 2;
        ball.addChild(text);
        winningBallArray.push(ball);
    }

    let columnTracker = 0;
    for (let i = 0; i < winningBallArray.length; i++) {
        //set ball position + set ball functions
        winningBallArray[i].x = 10 * columnTracker + (columnTracker) * (2 * radiusBall);
        winningBallArray[i].y = engine.renderer.height - 100;
        columnTracker++;
        engine.stage.addChild(winningBallArray[i]);
    }
}

function createButton(text: string, x: number, y: number, callback: Function) {

    let button = new PIXI.Graphics();
    button.beginFill(0xFFFFFF);
    button.lineStyle(0);
    button.drawRoundedRect(x, y, 150, 40, 20);
    button.endFill();
    let textPixi = new PIXI.Text(text,
        {
            font: '12px Arial',
            fill: 0x666666,
        });
    textPixi.anchor.set(0.5);
    textPixi.x = x + 75;
    textPixi.y = y + 20;
    if (textPixi.width > button.width) {
        let proportion = textPixi.width / textPixi.height
        textPixi.width = button.width - 20
        textPixi.height = textPixi.width * (1 / proportion)
    }
    button.addChild(textPixi);
    button.interactive = false;
    button.buttonMode = false;
    button.on('pointerdown', callback);
    return button
}

function getAmountNumberMatched() {
    let amountNumberMatched = 0;
    for (let i = 0; i < winningBallTracker.length; i++) {
        pickedBallTracker.indexOf(winningBallTracker[i]) >= 0 ? amountNumberMatched++ : null
    }
    return amountNumberMatched
}

function winPopUpDisplay(amountMatched: number) {
    let amountWon = 0;
    switch (amountMatched) {
        case 3: amountWon = 50; break
        case 4: amountWon = 100; break
        case 5: amountWon = 200; break
        case 6: amountWon = 500; break
        default: amountWon = 0;
    }

    if (amountWon > 0) {
        alert('You matched ' + amountMatched + ' numbers and won ' + amountWon);
    } else {
        alert('I\'m sorry you didn\'t won. Better luck next time')
    }
}

function reset() {
    for (let i = 0; i < pickedBallTracker.length; i++) {
        if (pickedBallTracker[i] === 0) {
            continue
        }
        let ball = ballsArray[pickedBallTracker[i] - 1]
        pickedBallTracker[i] = 0;
        ball.clear();
        ball.beginFill(0xffffff, 1)
        ball.lineStyle(0);
        ball.drawCircle(radiusBall + 5, radiusBall + 5, radiusBall);
        ball.endFill();
    }
    for (let i = 0; i < winningBallArray.length; i++) {
        if (winningBallArray[i]) {
            winningBallArray[i].destroy();
        }
        winningBallTracker[i] = 0;
    }
    winningBallArray = [];
    activateDeactivateButton(resetButton);
    activateDeactivateButton(luckyDipButton);
}

function activateDeactivateButton(button: PIXI.Graphics) {
    button.interactive = !button.interactive
    button.buttonMode = !button.buttonMode
}

function startGame() {
    randomDraw();
    let amountMatched = getAmountNumberMatched();
    activateDeactivateButton(resetButton);
    activateDeactivateButton(luckyDipButton);
    activateDeactivateButton(startGameButton);
    setTimeout(() => {
        winPopUpDisplay(amountMatched);
        reset()
    }, 1500);
}


function load() {
    create();
} // load

function create() {
    /* ***************************** */
    /* Create your Game Objects here */
    /* ***************************** */

    displayStandardBalls();
    activateDeactivateButton(resetButton);
    activateDeactivateButton(luckyDipButton);

    render();
} // create

// function update() {

/* ***************************** */
/* Update your Game Objects here */
/* ***************************** */

// } // update

function render() {
    requestAnimationFrame(render);

    /* ***************************** */
    /* Render your Game Objects here */
    /* ***************************** */

    engine.renderer.render(engine.stage);
} // render
