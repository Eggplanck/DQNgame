'use strict';

async function loadmodel(){
    let dqnmodel = await tf.loadLayersModel("https://eggplanck.github.io/DQNgame/model.json");
    return dqnmodel
}

const dqnmodel = loadmodel()

let pafield = new parentField([UserChoice, DQN, RandomWalk, RandomWalk, RandomWalk]);

let field = document.getElementById("field");
window.addEventListener("load", function() {
    for (let j = 0; j < 5; j++) {
        let column = document.createElement("tr");
        for (let i = 0; i < 5; i++) {
            let point = document.createElement("td");
            point.setAttribute('id', `p${5*j+i}`);
            point.className = "point";
            column.appendChild(point);
        }
        field.appendChild(column);
    }
    pafield.makeField();
    pafield.show();
    pafield.show_score();
    let up = document.getElementById("up");
    let right = document.getElementById("right");
    let down = document.getElementById("down");
    let left = document.getElementById("left");
    up.addEventListener('click', pafield.playOneTurn.bind(pafield, 0));
    right.addEventListener('click', pafield.playOneTurn.bind(pafield, 1));
    down.addEventListener('click', pafield.playOneTurn.bind(pafield, 2));
    left.addEventListener('click', pafield.playOneTurn.bind(pafield, 3));
});


function parentField(actionFunctions) {
    this.turn = 0;
    this.agents = [];
    for (let i = 0; i < 5; i++) {
        this.agents.push(new Agent(this, i, actionFunctions[i]));
    }
    this.redField = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ];
    this.greenField = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ];
    this.blueField = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ];
    this.makeField = function() {
        this.redField = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ];
        this.greenField = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ];
        this.blueField = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
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
            }
        }
    };
    this.relativeField = function(posx, posy) {
        let reRedField = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ];
        let reGreenField = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ];
        let reBlueField = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                reRedField[i][j] = this.redField[(5 + i + posy) % 5][(5 + j + posx) % 5];
                reGreenField[i][j] = this.greenField[(5 + i + posy) % 5][(5 + j + posx) % 5];
                reBlueField[i][j] = this.blueField[(5 + i + posy) % 5][(5 + j + posx) % 5];
            }
        }

        return [
            reRedField,
            reGreenField,
            reBlueField
        ];
    };

    this.setColor = function() {
        for (let agent of this.agents) {
            agent.colorState = (3 + agent.colorState + 1) % 3;
        }
    };

    this.reward = function() {
        for (let agent of this.agents) {
            switch (agent.colorState) {
                case 0:
                    agent.score += this.greenField[agent.posy][agent.posx] * 1;
                    agent.score += this.blueField[agent.posy][agent.posx] * 2;
                    break;
                case 1:
                    agent.score += this.blueField[agent.posy][agent.posx] * 1;
                    agent.score -= this.redField[agent.posy][agent.posx] * 1;
                    break;
                case 2:
                    agent.score -= this.redField[agent.posy][agent.posx] * 2;
                    agent.score -= this.greenField[agent.posy][agent.posx] * 1;
                    break;
            }
        }
    };


    this.show = function() {
        let point = 0;
        let red = 0;
        let green = 0;
        let blue = 0;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                red = this.redField[i][j];
                green = this.greenField[i][j];
                blue = this.blueField[i][j];
                point = document.getElementById(`p${5*i+j}`);
                if (!(red == 0 && green == 0 && blue == 0)) {
                    point.style.backgroundColor = `rgb(${100*red/(red+green+blue)}%,${100*green/(red+green+blue)}%,${100*blue/(red+green+blue)}%)`;
                } else {
                    point.style.backgroundColor = `rgb(100%,100%,100%)`;
                }
                point.innerHTML = ""
            }
        }
        let primal = this.agents[0];
        let primals_point = document.getElementById(`p${primal.posy*5+primal.posx}`);
        primals_point.innerHTML = "Yours"
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
        this.show_score.call(this)
        this.turn += 1;
    };

}

function Agent(parentField, number, actionFunction) {
    this.number = number;
    this.parentField = parentField;
    this.posx = Math.round(Math.random() * 4);
    this.posy = Math.round(Math.random() * 4);
    this.colorState = Math.round(Math.random() * 2);
    this.score = 0;
    this.actionFunction = actionFunction;
    this.action = function(relativeField, choice) {
        let action = this.actionFunction(relativeField, this.colorState, choice);
        switch (action) {
            case 0:
                this.posy = (5 + this.posy - 1) % 5;
                break;
            case 1:
                this.posx = (5 + this.posx + 1) % 5;
                break;
            case 2:
                this.posy = (5 + this.posy + 1) % 5;
                break;
            case 3:
                this.posx = (5 + this.posx - 1) % 5;
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
    let color = [0, 0, 0];
    color[colorState] = 1;
    let line_field = [];
    line_field.concat(color);
    for (let each_field of relativeField) {
        for (let line of each_field) {
            line_field.concat(line);
        }
    }
    line_field = line_field.map((value) => value * 0.2);
    let vector = tf.Tensor([line_field]);
    let predicted_value = tf.dataSync(dqnmodel.predict(vector))[0];
    let action = predicted_value.indexOf(Math.max.apply(null, predicted_value));
    return action
}
