const { Sequelize, Model, DataTypes, Deferrable } = require("sequelize");

const sequelize = new Sequelize('postgres://me:password@db/apii')

class Cadeiras extends Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                nome: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                cursosid: {
                    type: DataTypes.INTEGER,
                    allowNull:false,
                    references: {
                        model: 'cursos', // 'persons' refers to table name
                        key: 'id', // 'id' refers to column name in persons table
                     }
                }
            },
            
            {
                sequelize,
                tableName: "cadeiras",
                timestamps: false,
            }
        );
    }

    static associate(models) { }
}

module.exports =  Cadeiras;