// Carregando Módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin') //Pega o conteudo do arquivo 
    const path = require('path') //Permite manipular pastas
    const { Mongoose } = require('mongoose')
    const mongoose = require('mongoose')
    const session = require("express-session")
    const flash = require("connect-flash")
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")

// Configurações
    // Sessão
        app.use(session({
            secret: "CursoDeNone",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
    // Middlewares
        app.use((req, res, next) => {
            //Variaveis Globais
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next()
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    // Mongoose]
        mongoose.Promise = global.Promise; //Evita erros
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
            console.log("Conectado ao Mongo")
        }).catch((err) =>{
            console.log("Erro ao se Conectar: " + err)
        })
    // Public
        app.use(express.static(path.join(__dirname, "public"))) //Diz qual pasta esta guardando os arquivos estaticos
// Rotas 
    app.get('/', (req, res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem não existe caralho")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            req.redirect("/")
        })
    })

    app.get("/categorias", (req, res) =>{
        Categoria.find().lean().then((categorias) => {

            res.render("categorias/index", {categorias: categorias})

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as caregorias")
            req.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => { //Busca os Posts cuja a categoria sega a passado pelo slug
                    
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})

                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts@")
                    req.redirect("/")
                }) 
            }else{
                req.flash("error_msg", "Essa categoria não existe")
                res.redirect("/")
            }

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categorias")
            req.redirect("/")
        })
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })

    app.use('/admin', admin)
    app.use("/usuarios", usuarios)
// Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor Rodando!")
})