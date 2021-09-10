const express = require("express")
const router = express.Router() //CriaRotas em Arquivos separados

//Uso de Model de forma externa
const mongoose = require("mongoose") //Importa o Mongoose
require("../models/Categoria") // Chama o Arquivo do Model
const Categoria = mongoose.model("categorias") // Chama a Função de referencia para o Model para uma Variavel

require('../models/Postagem')
const Postagem = mongoose.model("postagens")

router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/posts', (req, res) => {
    res.send("Página de Posts")
})

router.get('/categorias', (req, res) => {
    Categoria.find().lean().sort({date: 'desc'}).then((categorias) => { //Lista todas as categorias
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erros ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', (req, res) => {
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){ //Vazio ou Indefinido ou Nulo
        erros.push({texto: "Nome Inválido"}) //Insere dado no Array
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da Categoria muito pequena"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com Sucesso!")
            res.redirect("/admin/categorias") //Se tiver sucesso redireciona para a página Categorias
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao slavar a categoria, tente novamente")
            res.redirect("/admin")
        })
    }
})

router.get("/categorias/edit/:id", (req, res) => {
    //res.send("Página de edição de categoria")
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Esta Categoria não Existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", (req, res) => {

    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com Sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error+msg", "Houve um erro interno ao salvar a edição da categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro aoeditar a categoria")
        res.redirect("/admin/categorias")
    })

})

router.post("/categorias/deletar", (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria Deletada com Sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar a Categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", (req, res) => {

    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => { //Tras informações da Categoria da Postagem
        res.render("admin/postagens", {postagens: postagens})
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as pstagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", (req, res) => { 
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias}) //Aqui as Categorias vão pra View
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Carregar o Formulário")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", (req, res) => {
    
    var erros = []

    if(req.body.categoria == 0){
        erros.push({texto: "Categoria inválida, Registre uma Categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagens", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })

    }

})

router.get("/postagens/edit/:id", (req, res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            res.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })

})

router.post("/postagem/edit", (req, res) => {
   
    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        postagem.data = new Date

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })

})

router.get("/postagens/deletar/:id", (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/admin/postagens")
    })
})

module.exports = router