const 
    five = require("johnny-five"),
    board = new five.Board(),
    firebase = require("firebase");

const 
    http = require('http'),
    static = require('node-static'),
    localhost = ['127.0.0.1', '192.168.137.1', 'teste.com.br'],
    port = 80;

    var fileServer = new static.Server('./public');
    http.createServer(function (req, res) {
        fileServer.serve(req, res);
    }).listen(port, localhost, () => {});

    var config = {
        apiKey: "apiKey",
        authDomain: "projectId.firebaseapp.com",
        databaseURL: "https://databaseName.firebaseio.com",
        storageBucket: "bucket.appspot.com"
    };

    var grid =  Array(2).fill().map(()=>(Array(16).fill().map(()=>"empty"))),
        i = 0, walk,
        cyclopes = [
            Cyclope(1, 15, "indestructible_villain"),
            Cyclope(0, 0, "destructible_villain"),
            Cyclope(1, 15, "indestructible_villain"),
            Cyclope(0, 0, "destructible_villain"),
            Cyclope(1,  0, "indestructible_villain"),
            Cyclope(0,  0, "indestructible_villain"),
            Cyclope(1, 15, "destructible_villain"),
            Cyclope(0,  0, "destructible_villain"),
            Cyclope(1, 15, "destructible_villain"),
            Cyclope(0, 15, "destructible_villain")
        ];
board.on("ready", function() {
    firebase.initializeApp(config);
    var l = new five.LCD({ controller: "PCF8574T"}),
        Dedalo = {X: 8, Y: 0, C: "antihero", D: "parado"};

    firebase.database().ref('posição').set(Dedalo);
    grid[Dedalo.Y][Dedalo.X] = Dedalo.C;
    firebase.database().ref('oãçisop').set(cyclopes[i]);

    l.useChar("antihero").useChar("destructible_villain").useChar("indestructible_villain");
    
    firebase.database().ref('posição').on('value', function(a){
        if(i < 10){
            if(grid[0][0] != "full"){
                if(!(writePerson(a.val(), l))){
                    clearInterval(walk);
                    l.clear();
                    l.cursor(0,0).print("Game over!");
                    l.cursor(1,0).print("You Lose!");
                    grid =  Array(2).fill().map(()=>(Array(16).fill().map(()=>"full")))
                }
            }
        }else{
            if(grid[0][0] != "full"){
                clearInterval(walk);
                l.clear();
                l.cursor(0,0).print("Congratulations");
                l.cursor(1,0).print("You win!");
                grid =  Array(2).fill().map(()=>(Array(16).fill().map(()=>"full")))
            }
        }    
    }); 

    walk = setInterval(() =>{
        if(i < 10){
            if(!(writePerson(cyclopes[i], l))){
                if(grid[0][0] != "full"){
                    clearInterval(walk);
                    l.clear();
                    l.cursor(0,0).print("Game over!");
                    l.cursor(1,0).print("You Lose!");
                    grid =  Array(2).fill().map(()=>(Array(16).fill().map(()=>"full")))
                }
            }
        }else{
            if(grid[0][0] != "full"){
                clearInterval(walk);
                l.clear();
                l.cursor(0,0).print("Congratulations");
                l.cursor(1,0).print("You win!");
                grid =  Array(2).fill().map(()=>(Array(16).fill().map(()=>"full")))
            }
        }
    }, 400);
});

function writePerson(character, l){
    character = {
        X:parseInt(character.X), 
        Y:parseInt(character.Y), 
        C:character.C, 
        D:character.D
    };
    if(character.C === "antihero"){
        if(character.D === "parado"){
            l.cursor(character.Y,character.X).print(":antihero:");
            return true;           
        }else{
            if(grid[character.Y][character.X] === "empty"){
                switch(character.D){
                    case "esquerda":
                        grid[character.Y][character.X + 1] = "empty";
                        l.cursor(character.Y,character.X + 1).print(" ");               
                    break;
                    case "direita":
                        grid[character.Y][character.X - 1] = "empty";
                        l.cursor(character.Y,character.X - 1).print(" ");
                    break;
                    case "cima":
                        grid[character.Y + 1][character.X] = "empty";
                        l.cursor(character.Y + 1,character.X).print(" ");
                    break;
                    case "baixo":
                        grid[character.Y - 1][character.X] = "empty";
                        l.cursor(character.Y - 1,character.X).print(" ");
                    break;
                }
                l.cursor(character.Y,character.X).print(":antihero:");
                grid[character.Y][character.X] = "antihero";
                return true;
            }else{
                return false;
            }
        }
    }else{
        grid[character.Y][character.X] = "empty";
        l.cursor(character.Y,character.X).print(" ");
        if(character.D ==="esquerda"){
            if(0 < character.X){
                if(grid[character.Y][character.X - 1] != "empty"){
                    return false;
                }
                character.X--;
                l.cursor(character.Y,character.X).print(":"+character.C+":");
                grid[character.Y][character.X] = character.C;
                cyclopes[i] = character;
                return true;
            }else{
                i++;
                return true;
            }
        }else{
            if(character.X < 15){
                if(grid[character.Y][character.X + 1] != "empty"){ 
                    return false;
                }
                character.X++;
                l.cursor(character.Y,character.X).print(":"+character.C+":");
                grid[character.Y][character.X] = character.C;
                cyclopes[i] = character;
                return true;
            }else{
                i++;
                return true;
            }
        }
    }
}

function Cyclope(y, x, c){
    return {
        X: x,
        Y: y,
        C: c,        
        D: (x == 0)? "direita":"esquerda"
    };
}