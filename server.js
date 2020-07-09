const express = require('express')
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
// const router = express().router;
const db = require('./queries');
const cursos = require('./db/Cursos');
const cadeiras = require('./db/Cadeiras');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://me:password@db/apii')


const port = 3000;

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

var mustacheExpress = require('mustache-express');

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');


; (async function teste() {

  // ESTA FUNÇAO SERVE APENAS PARA CONECTAR À BASE DE DADOS SEM ERROS.
  let retries = 5;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
      console.log("ACERTOU");
      break;
    } catch (err) {
      console.log("Errou.");
      retries -= 1;
      console.log(`retries left: ${retries}`);
      // wait 5 seconds
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  // QUANDO É CONECTADO COM SUCESSO, CORRE A SEGUINTE FUNÇAO, SE TIVER A BASE DE DADOS VAZIA VAI CORRER O SCRAPE E CRIAR PORTANTO A BASE DE DADOS, CASO CONTRARIO SEGUE EM FRENTE
  await db.createTable();

  if (await cursos.count() == 0) {
    const scrapper = require('./scrapeUal');
    const users = await cursos.findAll();

    console.log(`There are ${await cursos.count()} projects`);

  } else {

    const arrayCursos = await cursos.findAll({
      attributes: ['id','nome', 'escolasid']
    });

    const arrayCadeiras = await cadeiras.findAll({
      attributes: ['id','nome', 'cursosid']
    });

    const arrayJSONCursos = JSON.stringify(arrayCursos, null, 2);
    const arrayJSONCadeiras = JSON.stringify(arrayCadeiras, null, 2);

    const arrayParseCursos = JSON.parse(arrayJSONCursos);
    const arrayParseCadeiras = JSON.parse(arrayJSONCadeiras);

    app.use(express.static(path.join(__dirname, '/views')));
    app.get('/', function (req, res) {

      //ESTES CICLOS FOR MANDAM LISTAS DE CURSOS E/OU CADEIRAS PARA AS SUAS RESPETIVAS LISTAS. FICANDO PORTANTO UMA LISTA DE LISTAS PARA SEREM ACEDIDAS MAIS ABAIXO NO render.
      let curso
      var cursosLista = []
      var cursosCadeiras = []
      for (let m = 0; m < 3; m++) {
        // const arrayArrayEscolas = arrayParseCursos.filter((arrayParseCursos) => arrayParseCursos.escolasid == m + 1).map((arrayParseCursos) => arrayParseCursos.nome)
        const arrayArrayCursos = arrayParseCursos.filter((arrayParseCursos) => arrayParseCursos.escolasid == m + 1).map((arrayParseCursos) => arrayParseCursos.nome)
        cursosLista.push(arrayArrayCursos)
        for (let b = 0; b < cursosLista.length; b++) {
          const arrayArrayCadeiras = arrayParseCadeiras.filter((arrayParseCadeiras) => arrayParseCadeiras.cursosid == b + 1).map((arrayParseCadeiras) => arrayParseCadeiras.nome)
          cursosCadeiras.push(arrayArrayCadeiras)
          
        }
        // cursosLista.push(cursosCadeiras)
      }

      // ESTAS DUAS FUNÇOES listaTeste e listaTeste2 SAO APENAS TESTES E NAO ESTAO A FAZER NADA DE MOMENTO.

      function listaTeste2() {
        for (let i = 0; i < 3; i++){
          for (let k = 0; k < cursosLista[i].length; k++) {
            console.log("Curso: " + cursosLista[i][k])
            for (let j = 0; j < cursosCadeiras[k].length; j++) {
              console.log('Cadeira: ' + cursosCadeiras[k][j])
            }
          }
        }
      }
      
      
      // listaTeste(cursosLista, cursosCadeiras)
      // listaTeste2()
      //É ESTE render QUE ENVIA AS COISAS PARA O HTML SEGUINDO A LOGICA DO Mustache. NESTE MOMENTO DIVIDIMOS AS ESCOLAS E CURSOS BEM, MAS AS CADEIRAS NAO ESTAO A SER BEM DISTRIBUIDAS
      res.render('uni', {
        musketeers: [
          {
            escolas: "Instituto Superior Técnico de Lisboa",
            cursos: cursosLista[0],
            cadeiras: cursosCadeiras,
            
          },

          {
            escolas: "Universidade Autónoma de Lisboa",
            cursos: cursosLista[1],
            cadeiras: cursosCadeiras,
          },

          {
            escolas: "ISCTE",
            cursos: cursosLista[2],
            cadeiras: cursosCadeiras,
          }

        ]

      });

    }

    )
  }
})();

//RESTAPI
app.get('/api/:users', db.getUsers);
app.get('/api/:users/:id', db.getUserById);
app.post('/api/:users', db.createUser);
app.put('/api/:users/:id', db.updateUser);
app.delete('/api/:users/:id', db.deleteUser);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
