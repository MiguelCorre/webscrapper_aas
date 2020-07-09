const Pool = require('pg').Pool
const { Sequelize, Model, DataTypes, Deferrable } = require("sequelize");
const cursos = require('./db/Cursos')
const cadeiras = require('./db/Cadeiras')
const escolas = require('./db/Escolas')

const sequelize = new Sequelize('postgres://me:password@db/apii')


const pool = new Pool({
  // user: 'me',
  // host: '0.0.0.0',
  // database: 'apii',
  // password: 'password',
  // port: 5432,
  connectionString: 'postgres://me:password@db/apii'
})



async function createTable() {

  cursos.init(sequelize)
  cadeiras.init(sequelize)
  escolas.init(sequelize)
  cursos.associate(sequelize.models)
  cadeiras.associate(sequelize.models)
  escolas.associate(sequelize.models)

  cursos.hasMany(cadeiras, {
    as: 'Cadeiras',
    foreignKey: "cursosid",
  });

  cadeiras.belongsTo(cursos, {
    
    foreignKey: "cursosid"})

  escolas.hasMany(cursos, {
    foreignKey: "escolasid",
    timestamps: false
  });


  await sequelize.sync();
  // { force: true } QUANDO QUEREMOS REFAZER AS TABELAS METER ISTO DENTRO DO SYNC

}

const getUsers = (request, response) => {

  const tabela = request.params.users;

  pool.query('SELECT * FROM ' + tabela + ' ORDER BY id ASC', (error, results) => {
    if (error) {
      response.status(200).send("Tabela ou ID inválidos")
    } else {
      response.status(200).json(results.rows)
    }

  })
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);
  const tabela = request.params.users;

  pool.query('SELECT * FROM ' + tabela + ' WHERE id = $1', [id], (error, results) => {
    if (error) {
      response.status(200).json("Tabela ou ID inválidos")
    } else {
      response.status(200).json(results.rows)

    }
  })
}

const createUser = (request, response) => {
  const { name } = request.body;
  const tabela = request.params.users;

  pool.query('INSERT INTO ' + tabela + ' (nome) VALUES ($1)', [name], (error, results) => {
    if (error) {
      response.status(200).json("Tabela ou ID inválidos")
    } else {
      response.status(201).send(`User added with name: ${name}`)

    }
  })
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const tabela = request.params.users;
  const { name } = request.body

  pool.query(
    'UPDATE ' + tabela + ' SET nome = $1 WHERE id = $2',
    [name, id],
    (error, results) => {
      if (error) {
        response.status(200).json("Tabela ou ID inválidos")
      } else {
        response.status(200).send(`User modified with ID: ${id}`)

      }
    }
  )
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)
  const tabela = request.params.users;

  pool.query('DELETE FROM ' + tabela + ' WHERE id = $1', [id], (error, results) => {
    if (error) {
      response.status(200).json("Tabela ou ID inválidos")
    } else {
      response.status(200).send(`User deleted with ID: ${id}`)

    }
  })
}


module.exports = {
  createTable,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}



