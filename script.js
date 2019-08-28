'use strict';

let dqnmodel;

async function loadmodel() {
    dqnmodel = await tf.loadLayersModel("https://eggplanck.github.io/DQNgame/DQNmodel1/model.json");
    await dqnmodel.summary();
}

loadmodel();

let pafield;

let field = document.getElementById("field");
window.addEventListener("load", function() {
    for (let j = 0; j < 3; j++) {
        let column = document.createElement("tr");
        for (let i = 0; i < 3; i++) {
            let point = document.createElement("td");
            point.setAttribute('id', `p${3*j+i}`);
            point.className = "point";
            column.appendChild(point);
        }
        field.appendChild(column);
    }
    pafield = new parentField([UserChoice, DQN, DQN, DQN, DQN], [0, 1, 2, 3, 4]);
    pafield.makeField();
    pafield.show();
    pafield.show_score();
    alert("エージェントは１手毎に色が 赤→緑→青→黄→黒→赤→... の順に変化します。\n同じ場所にいるエージェントの間で得点の与奪が起こります。\n各エージェントは｛（自分の色の強さ）－（相手の色の強さ）｝だけポイントを奪います。\n１００手後に最も多くのポイントを持っていたエージェントの勝ちです。")
    let up = document.getElementById("up");
    let right = document.getElementById("right");
    let down = document.getElementById("down");
    let left = document.getElementById("left");
    up.addEventListener('click', play_turn.bind(null, 0));
    right.addEventListener('click', play_turn.bind(null, 1));
    down.addEventListener('click', play_turn.bind(null, 2));
    left.addEventListener('click', play_turn.bind(null, 3));
});

function play_turn(choice) {
    pafield.playOneTurn.call(pafield, choice)
    if (pafield.turn >= 100) {
        let WL = true;
        let you = pafield.agents[0].score;
        for (let s = 1; s < 5; s++) {
            if (pafield.agents[s].score > you) {
                WL = false;
                break;
            }
        }
        if (WL) {
            alert("YOU WIN");
        } else {
            alert("YOU LOSE");
        }
        pafield = new parentField([UserChoice, DQN, DQN, DQN, DQN], [0, 1, 2, 3, 4]);
        pafield.makeField();
        pafield.show();
        pafield.show_score();
    }
}

function parentField(actionFunctions, init_color = [null, null, null, null, null]) {
    this.turn = 0;
    this.agents = [];
    for (let i = 0; i < 5; i++) {
        this.agents.push(new Agent(this, i, actionFunctions[i], init_color[i]));
    }
    this.redField = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    this.greenField = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    this.blueField = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    this.yellowField = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    this.blackField = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    this.makeField = function() {
        this.redField = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        this.greenField = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        this.blueField = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        this.yellowField = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        this.blackField = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        for (let agent of this.agents) {
            switch (agent.colorState) {
                case 0:
                    this.redField[agent.posy][agent.posx] += 1;
                    break;
                case 1:
                    this.greenField[agent.posy][agent.posx] += 1;
                    break;
                case 2:
                    this.blueField[agent.posy][agent.posx] += 1;
                    break;
                case 3:
                    this.yellowField[agent.posy][agent.posx] += 1;
                    break;
                case 4:
                    this.blackField[agent.posy][agent.posx] += 1;
                    break;
            }
        }
    };
    this.relativeField = function(posx, posy) {
        let reRedField = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        let reGreenField = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        let reBlueField = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        let reYellowField = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        let reBlackField = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                reRedField[i][j] = this.redField[(3 + i + posy) % 3][(3 + j + posx) % 3];
                reGreenField[i][j] = this.greenField[(3 + i + posy) % 3][(3 + j + posx) % 3];
                reBlueField[i][j] = this.blueField[(3 + i + posy) % 3][(3 + j + posx) % 3];
                reYellowField[i][j] = this.yellowField[(3 + i + posy) % 3][(3 + j + posx) % 3];
                reBlackField[i][j] = this.blackField[(3 + i + posy) % 3][(3 + j + posx) % 3];
            }
        }

        return [
            reRedField,
            reGreenField,
            reBlueField,
            reYellowField,
            reBlackField
        ];
    };

    this.setColor = function() {
        for (let agent of this.agents) {
            agent.colorState = (5 + agent.colorState + 1) % 5;
        }
    };

    this.reward = function() {
        for (let agent of this.agents) {
            switch (agent.colorState) {
                case 0:
                    agent.score += this.greenField[agent.posy][agent.posx] * 0.5;
                    agent.score += this.yellowField[agent.posy][agent.posx] * 1;
                    agent.score -= this.blackField[agent.posy][agent.posx] * 1;
                    agent.score -= this.blueField[agent.posy][agent.posx] * 0.5;
                    break;
                case 1:
                    agent.score += this.yellowField[agent.posy][agent.posx] * 0.5;
                    agent.score -= this.blackField[agent.posy][agent.posx] * 1.5;
                    agent.score -= this.blueField[agent.posy][agent.posx] * 1;
                    agent.score -= this.redField[agent.posy][agent.posx] * 0.5;
                    break;
                case 2:
                    agent.score += this.redField[agent.posy][agent.posx] * 0.5;
                    agent.score += this.greenField[agent.posy][agent.posx] * 1;
                    agent.score += this.yellowField[agent.posy][agent.posx] * 1.5;
                    agent.score -= this.blackField[agent.posy][agent.posx] * 0.5;
                    break;
                case 3:
                    agent.score -= this.blackField[agent.posy][agent.posx] * 2;
                    agent.score -= this.blueField[agent.posy][agent.posx] * 1.5;
                    agent.score -= this.redField[agent.posy][agent.posx] * 1;
                    agent.score -= this.greenField[agent.posy][agent.posx] * 0.5;
                    break;
                case 4:
                    agent.score += this.blueField[agent.posy][agent.posx] * 0.5;
                    agent.score += this.redField[agent.posy][agent.posx] * 1;
                    agent.score += this.greenField[agent.posy][agent.posx] * 1.5;
                    agent.score += this.yellowField[agent.posy][agent.posx] * 2;
                    break;
            }
        }
    };


    this.show = function() {
        let point = 0;
        let red = 0;
        let green = 0;
        let blue = 0;
        let yellow = 0;
        let black = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                red = this.redField[i][j];
                green = this.greenField[i][j];
                blue = this.blueField[i][j];
                yellow = this.yellowField[i][j];
                black = this.blackField[i][j];
                point = document.getElementById(`p${3*i+j}`);
                if (!(red == 0 && green == 0 && blue == 0 && yellow == 0 && black == 0)) {
                    point.style.backgroundColor = `rgb(${100*(red+yellow)/(red+green+blue+yellow+black)}%,${100*(green+yellow)/(red+green+blue+yellow+black)}%,${100*blue/(red+green+blue+yellow+black)}%)`;
                } else {
                    point.style.backgroundColor = `rgb(100%,100%,100%)`;
                }
                point.innerHTML = ""
            }
        }
        let primal = this.agents[0];
        let primals_point = document.getElementById(`p${primal.posy*3+primal.posx}`);
        primals_point.innerHTML += "Yours,"
        for (let t = 1; t < 5; t++) {
            let agent = this.agents[t];
            let agents_point = document.getElementById(`p${agent.posy*3+agent.posx}`);
            agents_point.innerHTML += `Agent${t},`
        }
    };

    this.show_score = function() {
        let score = document.getElementById("score");
        let str_score = "";
        str_score += `You&nbsp&nbsp&nbsp&nbsp&nbsp:${this.agents[0].score}pt<br>`
        let i = 1;
        for (let k = 1; k < 5; k++) {
            str_score += `Agent${i}:${this.agents[k].score}pt<br> `;
            i++;
        }
        str_score += `Turn: ${this.turn}`
        score.innerHTML = str_score;
    };

    this.playOneTurn = function(choice) {
        for (let agent of this.agents) {
            let reField = this.relativeField.call(this, agent.posx, agent.posy);
            agent.action.call(agent, reField, choice);
        }
        this.setColor.call(this);
        this.makeField.call(this);
        this.reward.call(this);
        this.show.call(this);
        this.turn += 1;
        this.show_score.call(this)
    };

}

function Agent(parentField, number, actionFunction, initColor = null) {
    this.number = number;
    this.parentField = parentField;
    this.posx = Math.round(Math.random() * 2);
    this.posy = Math.round(Math.random() * 2);
    if (initColor == null) {
        this.colorState = Math.round(Math.random() * 4);
    } else {
        this.colorState = initColor
    }
    this.score = 0;
    this.actionFunction = actionFunction;
    this.action = function(relativeField, choice) {
        let action = this.actionFunction(relativeField, this.colorState, choice);
        switch (action) {
            case 0:
                this.posy = (3 + this.posy - 1) % 3;
                break;
            case 1:
                this.posx = (3 + this.posx + 1) % 3;
                break;
            case 2:
                this.posy = (3 + this.posy + 1) % 3;
                break;
            case 3:
                this.posx = (3 + this.posx - 1) % 3;
                break;
        }
    };
}






function RandomWalk(relativeField, colorState, choice) {
    let action = Math.round(Math.random() * 3);
    return action;
}

function UserChoice(relativeField, colorState, choice) {
    return choice
}

function DQN(relativeField, colorState, choice) {
    if (Math.random() < 0.9) {
        let line_field = [0, 0, 0, 0, 0];
        line_field[colorState] = 1;
        for (let each_field of relativeField) {
            for (let line of each_field) {
                line_field = line_field.concat(line);
            }
        }
        line_field = line_field.map((value) => value * 0.2);
        line_field = [line_field];
        let vector = tf.tensor(line_field);
        let predicted_value = dqnmodel.predict(vector).dataSync();
        let action = predicted_value.indexOf(Math.max.apply(null, predicted_value));
        return action
    } else {
        let action = Math.round(Math.random() * 3);
        return action
    }
}
