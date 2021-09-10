const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Categoria = new Schema({
    nome: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now() // Data do Registro
    }
})

mongoose.model("categorias", Categoria)