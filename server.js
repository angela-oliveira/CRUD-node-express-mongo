const porta = 3003

const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient 
const ObjectId = require('mongodb').ObjectID

const uri = "mongodb://localhost:27017/test"

const app = express()

MongoClient.connect(uri, (err, client) => {
    if (err) return console.log(err)
    db = client.db('words')
    
    app.listen(porta, () => {
        console.log(`Servidor executando na porta ${porta}.`)
    })
})

app.use(bodyParser.urlencoded({ extended:true }))

app.set('view engine', 'ejs')

//Adicionar
app.route('/')
    .get((req,res) => {
        const cursor = db.collection('data').find()
        res.render('index.ejs')
    })
    
    .post((req, res) => {
        db.collection('data').save(req.body, (err, result) => {
            if (err) return console.log(err)

            console.log('Salvo no Banco')
            res.redirect('/show')
        })
    })

//Listar
app.route('/show')
    .get((req, res) => {
        db.collection('data').find().sort({ ingles:1 }).toArray((err, results) => {
            if (err) return console.log(err)
            res.render('show.ejs', { data: results })
        })
    })

//Editar
app.route('/edit/:id')
    .get((req, res) => {
        let id = req.params.id
        db.collection('data').find(ObjectId(id)).toArray((err, result) => {
            if (err) return res.send(err)
            res.render('edit.ejs', { data: result })
        })
    })
    .post((req, res) => {
        let id = req.params.id
        let ingles = req.body.ingles
        let portugues = req.body.portugues

        db.collection('data').updateOne({_id: ObjectId(id)}, {
            $set: {
                ingles: ingles,
                portugues: portugues
            }
        }, (err, result) => {
            if (err) return res.send(err)
            res.redirect('/show')
            console.log('Atualizado no Banco')
        })
    })

//Deletar
app.route('/delete/:id')
    .get((req, res) => {
        let id = req.params.id

        db.collection('data').deleteOne({_id: ObjectId(id)}, (err, result) => {
            if (err) return res.send(500, err)
            console.log('Deletado do Banco')
            res.redirect('/show')
        })
    })
