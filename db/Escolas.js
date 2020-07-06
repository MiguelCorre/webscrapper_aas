const { Sequelize, Model, DataTypes, Deferrable } = require("sequelize");

const sequelize = new Sequelize('postgres://me:password@db:5432/apii')

class Escolas extends Model {
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
                propinas: {
                    type: DataTypes.FLOAT,
                    allowNull: true
                },
            },
            
            {
                sequelize,
                tableName: "escolas",
                timestamps: false
            }
        );
    }

    static associate(models) { }
}

module.exports =  Escolas;