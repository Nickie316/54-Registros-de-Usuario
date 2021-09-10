const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId, //Dia que esse campo vai armazenar um ID de uma categoria
        ref: "categorias", //Come do Model
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("postagens", Postagem)