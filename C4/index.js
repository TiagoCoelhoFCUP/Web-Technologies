"use strict"
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const stream = require('stream');
const conf = require('./conf.js');
const crypto = require('crypto');
const updater = require('./updater.js');
const headers = {
  plain: {
    'Content-Type': 'application/javascript',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  },
  sse: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
    'Connection': 'keep-alive'
  }
};

http.createServer((request,response) => {
  switch(request.method) {
    case 'POST':
      let body = '';
      request.setEncoding('utf8');
      request.on('data', (chunk) => { body += chunk; });
      request.on('end', () => {
          try {
            const query = JSON.parse(body);
            doPostRequest(request,response,query);
          }
          catch(err) {console.log(err)} });
      break;
    default:
      response.writeHead(501,headers["plain"]); // 501 Not Implemented
      response.end(JSON.stringify({ "error": "Method Not Implemented"}));
    }
}).listen(conf.port);


function doPostRequest(request,response,query) {
  const preq = url.parse(request.url,true);
  const pathname = preq.pathname;
  switch(pathname){
    case '/register':
      let nick = query.nick;
      let pass = crypto.createHash('md5')
                      .update(query.pass)
                      .digest('hex');

      fs.readFile('users.txt',function(err,data) {
        if(err) {
          response.writeHead(404),headers["plain"]; // Not Found
          response.end(JSON.stringify({ "error": "File not found"}));
          return;
        }
        var users = parseString(data);
        if(users === null){
          let user = {[nick] : pass};
          fs.writeFile('users.txt',JSON.stringify(user),function(err) {
            if(err) {
              response.writeHead(404,headers["plain"]); // Not Found
              response.end(JSON.stringify({ "error": "File not found"}));
              return;
            }
            response.writeHead(200,headers["plain"]); //Sucessfull
            response.end(JSON.stringify({}));
            return;
          });
          return;
        }
        if(!(nick in users)){
          users[nick] = pass;
          fs.writeFile('users.txt',JSON.stringify(users),function(err) {
            if(err) {
              response.writeHead(404,headers["plain"]); // Not Found
              response.end(JSON.stringify({ "error": "File not found"}));
              return;
            }
            response.writeHead(200,headers["plain"]); //Sucessfull
            response.end(JSON.stringify({}));
            return;
          });
        }
        if (nick in users){
          if (users[nick] === pass){
            response.writeHead(200,headers["plain"]); // Sucessfull
            response.end(JSON.stringify({}));
            return;
          }
          else{
            response.writeHead(401,headers["plain"]); //Unauthorized
            response.end(JSON.stringify({ "error": "User registered with a different password"}));
            return;
          }
        }
     });
    break;
  case '/ranking':
    let size = query.size;
    if(size == undefined){
      response.writeHead(400,headers["plain"]); // Erro de argumentos
      response.end(JSON.stringify({ "error": "Undefined size" } ));
      return;
    }
    let rows = size.rows;
    let cols = size.columns;
    fs.readFile('ranking.txt',function(err,data) {
      if(err) {
        response.writeHead(404,headers["plain"]); // Not Found
        response.end(JSON.stringify({ "error": "File not found"}));
        return;
      }
      var ranking = parseString(data);
      if(ranking === null){
        response.writeHead(400,headers["plain"]);
        response.end(JSON.stringify({ "error": "Internal Server Error"}));
        return;
      }
      if(!(rows+"x"+cols in ranking)){
        response.writeHead(400,headers["plain"]);
        response.end(JSON.stringify({ "error": "Invalid size" } ));
        return;
      }
      let stats = ranking[rows+"x"+cols].sort(function(obj1, obj2) {
         // Ordena a o ranking de rows/cols de forma descrescente por vitorias
	       return obj2.victories - obj1.victories;
       });
       stats = stats.slice(0,11);
       if(!Array.isArray(stats) || !stats.length) {
         response.writeHead(200,headers["plain"]);
         response.end(JSON.stringify({}));
         return;
       }
       response.writeHead(200,headers["plain"]);
       response.end(JSON.stringify({"ranking": stats}));
    });
    break;
  case '/join':
    let nick1 = query.nick;
    let size1 = query.size;
    let rows1 = size1.rows;
    let cols1 = size1.columns;
    fs.readFile('onhold.txt',function(err,data) {
      if(err) {
        response.writeHead(404,headers["plain"]); // Not Found
        response.end(JSON.stringify({ "error": "File not found"}));
        return;
      }
      var onhold = parseString(data);
      if(onhold === null){
        let time = new Date().getTime();
        let id = crypto.createHash('md5')
                        .update(query.group+nick1+query.pass+rows1+cols1+time)
                        .digest('hex');
        let game = [{"nick1":nick1,"nick2":null,"id":id,"rows":rows1,"cols":cols1}];
        fs.writeFile('onhold.txt',JSON.stringify(game),function(err) {
          if(err) {
            response.writeHead(404,headers["plain"]); // Not Found
            response.end(JSON.stringify({ "error": "File not found"}));
            return;
          }
          response.writeHead(200,headers["plain"]); // Not Found
          response.end(JSON.stringify({ "game": id }));
          return;
        });
        return;
      }
      for(var i = 0; i < onhold.length; i++) {
        let game = onhold[i];
        if(game.nick2 === null && game.rows == rows1 && game.cols == cols1 && nick1 != game.nick1){
          let id = game.id;
          onhold.splice(i, 1);
          if(!Array.isArray(onhold) || !onhold.length) {
            fs.writeFile('onhold.txt','',function(err) {
              if(err) {
                response.writeHead(404,headers["plain"]); // Not Found
                response.end(JSON.stringify({ "error": "File not found"}));
                return;
              }
            });
          }
          else{
            fs.writeFile('onhold.txt',JSON.stringify(onhold),function(err) {
              if(err) {
                response.writeHead(404,headers["plain"]); // Not Found
                response.end(JSON.stringify({ "error": "File not found"}));
                return;
              }
            });
          }
          fs.readFile('games.txt',function(err,data) {
            if(err) {
              response.writeHead(404,headers["plain"]); // Not Found
              response.end(JSON.stringify({ "error": "File not found"}));
              return;
            }
            var games = parseString(data);
            if(games === null){
              let matrix = createMatrix(game.rows,game.cols);
              let json = {[id]:{"nick1":game.nick1,"nick2":nick1,"board":matrix,"turn":game.nick1,"rows":game.rows,"cols":game.cols}};
              fs.writeFile('games.txt',JSON.stringify(json),function(err) {
                if(err) {
                  response.writeHead(404,headers["plain"]); // Not Found
                  response.end(JSON.stringify({ "error": "File not found"}));
                  return;
                }
              });
            }
            else{
              let matrix = createMatrix(game.rows,game.cols);
              games[id] = {"nick1":game.nick1,"nick2":nick1,"board":matrix,"turn":game.nick1};
              fs.writeFile('games.txt',JSON.stringify(games),function(err) {
                if(err) {
                  response.writeHead(404,headers["plain"]); // Not Found
                  response.end(JSON.stringify({ "error": "File not found"}));
                  return;
                }
              });
            }
          });
          response.writeHead(200,headers["plain"]); // Not Found
          response.end(JSON.stringify({ "game": id }));
          return;
        }
      }
      let time = new Date().getTime();
      let id = crypto.createHash('md5')
                      .update(query.group+nick1+query.pass+rows1+cols1+time)
                      .digest('hex');
      let game = {"nick1":nick1,"nick2":null,"id":id,"rows":rows1,"cols":cols1};
      onhold.push(game);
      fs.writeFile('onhold.txt',JSON.stringify(onhold),function(err) {
        if(err) {
          response.writeHead(404,headers["plain"]); // Not Found
          response.end(JSON.stringify({ "error": "File not found"}));
          return;
        }
        response.writeHead(200,headers["plain"]); // Not Found
        response.end(JSON.stringify({ "game": id }));
        return;
      });
    });
    break;
  case '/leave':
    let nick2 = query.nick;
    let id = query.game;
    fs.readFile('onhold.txt',function(err,data) {
      if(err) {
        response.writeHead(404,headers["plain"]); // Not Found
        response.end(JSON.stringify({ "error": "File not found"}));
        return;
      }
      var onhold = parseString(data);
      if(onhold != null){
        for(var i = 0; i < onhold.length; i++) {
          let game = onhold[i];
          if(game.id == id){
            onhold.splice(i, 1);
            if(!Array.isArray(onhold) || !onhold.length) {
              fs.writeFile('onhold.txt','',function(err) {
                if(err) {
                  response.writeHead(404,headers["plain"]); // Not Found
                  response.end(JSON.stringify({ "error": "File not found"}));
                  return;
                }
              });
            }
            else{
              fs.writeFile('onhold.txt',JSON.stringify(onhold),function(err) {
                if(err) {
                  response.writeHead(404,headers["plain"]); // Not Found
                  response.end(JSON.stringify({ "error": "File not found"}));
                  return;
                }
              });
            }
            response.writeHead(200,headers["plain"]); // Sucessfull
            response.end(JSON.stringify({}));
            return;
          }
        }
      }
    });
    fs.readFile('games.txt',function(err,data) {
      if(err) {
        response.writeHead(404,headers["plain"]); // Not Found
        response.end(JSON.stringify({ "error": "File not found"}));
        return;
      }
      var games = parseString(data);
      if(games != null){
        if(id in games){
          let current = games[id];
          delete games[id];
          if(isEmpty(games)) {
            fs.writeFile('games.txt','',function(err) {
              if(err) {
                response.writeHead(404,headers["plain"]); // Not Found
                response.end(JSON.stringify({ "error": "File not found"}));
                return;
              }
            });
          }
          else{
            fs.writeFile('games.txt',JSON.stringify(games),function(err) {
              if(err) {
                response.writeHead(404,headers["plain"]); // Not Found
                response.end(JSON.stringify({ "error": "File not found"}));
                return;
              }
            });
          }
          if(current.nick1 === nick2){
            UpdateGameStats(current.nick2,current.nick1,current.rows,current.cols);
          }
          else{
            UpdateGameStats(current.nick1,current.nick2,current.rows,current.cols);
          }
          response.writeHead(200,headers["plain"]); // Not Found
          response.end(JSON.stringify({}));
          return;
        }
        else{
          response.writeHead(400,headers["plain"]); // Not Found
          response.end(JSON.stringify({"error":"Not a valid game"}));
          return;
        }
      }
      else{
        response.writeHead(400,headers["plain"]); // Not Found
        response.end(JSON.stringify({"error":"Not a valid game"}));
        return;
      }
    });
  }
}

function parseString(data){
    try {
      return JSON.parse(data.toString());
    } catch(ex){
      return null;
    }
}

function UpdateGameStats(winner,loser,rows,cols){

}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)){
      return false;
    }
  }
  return true;
}

function createMatrix(rows,cols) {
  var matrix = new Array(rows);
  for (let row=0; row<rows; row++) {
    matrix[row] = new Array(cols);
    for (let col=0; col<cols; col++) {
    }
  }
  return matrix;
}
