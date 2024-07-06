import Phaser from "phaser";

const BOUNDRY_WIDTH = 400;
const BOUNDRY_HEIGHT = 400;

const SCENE_WIDTH = 800;
const SCENE_HEIGHT = 400;


//ui constant
const startX = BOUNDRY_WIDTH + 20;
const startY = 30;
const cellWidth = 50;
const cellHeight = 30;

let labelsList = [];

//tracking voters
let voterID = 0;

const config = {
    type: Phaser.AUTO,
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
    backgroundColor: "#2d2d2d",
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

const game = new Phaser.Game(config);
let voters = [];

function preload() {
    // 预加载资源，例如图片
    this.load.image("voter", "assets/voter.png");
}

let graphics, uiGraphics;

function create() {
    graphics = this.add.graphics();
    uiGraphics = this.add.graphics();

    this.input.mouse.disableContextMenu();

    const textStyle = {
        fontFamily: "Arial",
        fontSize: 7,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 1,
    };

    this.add.text(startX, 5, "1st Candidate", textStyle).setOrigin(0.5, 0.5);

    this.add.text(startX + (cellWidth), 5, "2nd Candidate", textStyle).setOrigin(0.5, 0.5);

    this.add.text(startX + (cellWidth) * 2, 5, "3rd Candidate", textStyle).setOrigin(0.5, 0.5)

    this.add.text(startX + (cellWidth) * 3, 5, "4th Candidate", textStyle).setOrigin(0.5, 0.5)

    //draw boundry
    drawLine(uiGraphics, BOUNDRY_WIDTH, 0, BOUNDRY_WIDTH, SCENE_HEIGHT);

    this.input.on(
        "pointerdown",
        function (pointer) {
            if (pointer.rightButtonDown()) {
                if (voterID < 13 && pointer.x < BOUNDRY_WIDTH && pointer.y < BOUNDRY_HEIGHT) {
                    initVoter(this, pointer.x, pointer.y, voterID);
                    voterID++;
                }
            }
        },
        this
    );
}

function update() {
    // 每帧处理所有voter
    let voteTable = [];

    voters.forEach((voter) => {
        voter.preferenceRank = [
            { value: voter.north, label: "north" },
            { value: voter.south, label: "south" },
            { value: voter.west, label: "west" },
            { value: voter.east, label: "east" },
        ].sort((a, b) => b.value - a.value);

        voteTable.push({
            preference: voter.preferenceRank,
            id: voter.voterID,
        });

        //  console.log("voteTable", voteTable);
        //where we process the voteTable by using some weird voting algorithms

        //ui display for the voting result

        const textStyle = {
            fontFamily: "Arial",
            fontSize: 16,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2,
        };

        
        for(let i=0; i<voteTable.length; i++){
            for(let j=0; j<voteTable[i].preference.length; j++){
                const voteToken = voteTable[i].preference[3-j].label;
                labelsList[i][j].setText(voteToken);
            }
        }
    });
}

function drawLine(graphics, x1, y1, x2, y2) {
    graphics.lineStyle(1, 0xffffff, 1); // 设置线条样式：宽度2，颜色白色，不透明度1
    graphics.beginPath();
    graphics.moveTo(x1, y1); // 起点
    graphics.lineTo(x2, y2); // 终点
    graphics.strokePath(); // 绘制路径
}

function initVoter(scene, x, y, id) {
    const voter = scene.add.sprite(x, y, "voter");

    voter.north = BOUNDRY_HEIGHT - voter.y;
    voter.south = voter.y;
    voter.west = BOUNDRY_WIDTH - voter.x;
    voter.east = voter.x;
    voter.voterID = id;

    const textStyle = {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
    };
    //voter.dragText = scene.add.text(voter.x, voter.y - 20, 'Dragging', textStyle).setVisible(false);

    voter.northLabel = scene.add
        .text(voter.x, voter.y - 30, voter.north, textStyle)
        .setVisible(false);
    voter.southLabel = scene.add
        .text(voter.x, voter.y - 30, voter.south, textStyle)
        .setVisible(false);
    voter.eastLabel = scene.add
        .text(voter.x, voter.y - 30, voter.east, textStyle)
        .setVisible(false);
    voter.westLabel = scene.add
        .text(voter.x, voter.y - 30, voter.west, textStyle)
        .setVisible(false);
    voter.preferenceRank = [
        voter.north,
        voter.south,
        voter.west,
        voter.east,
    ].sort();

    voter.setInteractive();

    scene.input.setDraggable(voter);

    // Update preference rank
    voter.preferenceRank = [
        { value: voter.north, label: "north" },
        { value: voter.south, label: "south" },
        { value: voter.west, label: "west" },
        { value: voter.east, label: "east" },
    ].sort((a, b) => b.value - a.value);

    //initialize the ui
    let tempLabels = [];
    for(let j=voter.preferenceRank.length-1; j>=0; j--){
        const voteToken = voter.preferenceRank[j].label;
        const x = startX + j * cellWidth;
        const y = startY + voter.voterID * cellHeight;
        const rankLabel = scene.add.text(x, y, voteToken, textStyle).setOrigin(0.5, 0.5);
        tempLabels.push(rankLabel);
    }
    labelsList.push(tempLabels);

    const maxPreference = voter.preferenceRank[0].label;

    // Set tint based on max preference
    if (maxPreference === "north") voter.setTint(0xff0000); // red
    else if (maxPreference === "south") voter.setTint(0xffff00); // yellow
    else if (maxPreference === "west") voter.setTint(0x00ff00); // green
    else voter.setTint(0x0000ff); // blue

    voter.on("dragstart", function (pointer) {
        //this.setTint(0xff0000);
        //this.dragText.setVisible(true);

        this.northLabel.setVisible(true);
        this.southLabel.setVisible(true);
        this.eastLabel.setVisible(true);
        this.westLabel.setVisible(true);
    });

    voter.on("drag", function (pointer, dragX, dragY) {
        graphics.clear();

        drawLine(graphics, this.x, this.y, BOUNDRY_WIDTH, this.y);
        drawLine(graphics, this.x, this.y, this.x, BOUNDRY_HEIGHT);
        drawLine(graphics, this.x, this.y, this.x, 0);
        drawLine(graphics, this.x, this.y, 0, this.y);

        this.x = Phaser.Math.Clamp(dragX, 0, BOUNDRY_WIDTH);
        this.y = Phaser.Math.Clamp(dragY, 0, BOUNDRY_HEIGHT);

        //this.dragText.setPosition(this.x, this.y - 20);

        this.northLabel.setPosition(this.x, this.y / 2).setText(this.north);
        this.southLabel
            .setPosition(this.x, (this.y + BOUNDRY_HEIGHT) / 2)
            .setText(this.south);
        this.eastLabel
            .setPosition((this.x + BOUNDRY_WIDTH) / 2, this.y - 20)
            .setText(this.east);
        this.westLabel.setPosition(this.x / 2, this.y - 20).setText(this.west);

        //set voter's preferences
        this.north = BOUNDRY_HEIGHT - this.y;
        this.south = this.y;
        this.west = BOUNDRY_WIDTH - this.x;
        this.east = this.x;

        console.log(`Voter ${this.voterID} preference: 
            north: ${this.north}, 
            south: ${this.south}, 
            east: ${this.east}, 
            west: ${this.west}
        `);

        // Update preference rank
        this.preferenceRank = [
            { value: this.north, label: "north" },
            { value: this.south, label: "south" },
            { value: this.west, label: "west" },
            { value: this.east, label: "east" },
        ].sort((a, b) => b.value - a.value);

        const maxPreference = this.preferenceRank[0].label;

        // Set tint based on max preference
        if (maxPreference === "north") this.setTint(0xff0000); // red
        else if (maxPreference === "south") this.setTint(0xffff00); // yellow
        else if (maxPreference === "west") this.setTint(0x00ff00); // green
        else this.setTint(0x0000ff); // blue
    });

    voter.on("dragend", function (pointer) {
        this.clearTint();
        //this.dragText.setVisible(false);

        this.northLabel.setVisible(false);
        this.southLabel.setVisible(false);
        this.eastLabel.setVisible(false);
        this.westLabel.setVisible(false);

        //set voter's preferences
        this.north = BOUNDRY_HEIGHT - this.y;
        this.south = this.y;
        this.west = BOUNDRY_WIDTH - this.x;
        this.east = this.x;

        //process preference
        // Update preference rank
        this.preferenceRank = [
            { value: this.north, label: "north" },
            { value: this.south, label: "south" },
            { value: this.west, label: "west" },
            { value: this.east, label: "east" },
        ].sort((a, b) => b.value - a.value);

        const maxPreference = this.preferenceRank[0].label;

        // Set tint based on max preference
        if (maxPreference === "north") this.setTint(0xff0000); // red
        else if (maxPreference === "south") this.setTint(0xffff00); // yellow
        else if (maxPreference === "west") this.setTint(0x00ff00); // green
        else this.setTint(0x0000ff); // blue
    });

    voters.push(voter);
}

