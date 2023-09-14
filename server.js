const sqlite3 = require('sqlite3');
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const { render } = require('ejs');

const app = express();
const port = 3000;
const _dirname = path.resolve();
const dbpath = path.join(_dirname, 'database', 'data.db')
const db = new sqlite3.Database(dbpath);

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    const { page = 1, name, height, weight, strBirth, endBirth, married, type_search } = req.query;
    const queries = [];
    const params = [];
    const paramscount = [];
    const limit = 5;
    const offset = (page - 1) * 5;

    if (name) {
        queries.push("name like '%' || ? || '%'");
        params.push(name);
        paramscount.push(name);
    };

    if (height) {
        queries.push('height = ?');
        params.push(height);
        paramscount.push(height);
    };

    if (weight) {
        queries.push('weight = ?');
        params.push(weight);
        paramscount.push(weight);
    };

    if (strBirth && endBirth) {
        queries.push('birthdate BETWEEN ? and ?');
        params.push(strBirth, endBirth);
        paramscount.push(strBirth, endBirth);
    } else if (strBirth) {
        queries.push('birthdate >= ?');
        params.push(strBirth);
        paramscount.push(strBirth);
    } else if (endBirth) {
        queries.push('birthdate <= ?');
        params.push(endBirth);
        paramscount.push(endBirth);
    };

    if (married) {
        queries.push('married = ?');
        params.push(married);
        paramscount.push(married);
    }

    let sqlcount = 'SELECT COUNT (*) AS total FROM data';
    let sql = `SELECT * FROM data`;
    if (queries.length > 0) {
        sql += ` WHERE ${queries.join(` ${type_search} `)}`
        sqlcount += ` WHERE ${queries.join(` ${type_search} `)}`
    }
    sql += ' ORDER BY id DESC ';

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    db.get(sqlcount, paramscount, (err, data) => {
        if (err) res.send(err)
        else {
            const total = data.total;
            const pages = Math.ceil(total / limit);
            db.all(sql, params, (err, data) => {
                if (err) res.render(err)
                else res.render('main', { data, query: req.query, pages, offset, page, url: req.url })
            })
        }
    })
})


app.get('/form', (req, res) => {
    res.render('form', { data: {} })
})

app.get('/form/:index', (req, res) => {
    const index = req.params.index
    db.get('SELECT * FROM data WHERE id = ?', [index], (err, data) => {
        if (err) res.send(err)
        else res.render('form', { data })
    })
})

app.post('/form/:index', (req, res) => {
    const index = req.params.index
    const { name, height, weight, birth, married } = req.body;
    db.run('UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ? ',
        [name, height, weight, birth, married, index], (err, data) => {
            if (err) res.send(err)
            else res.redirect('/')
        })
})

app.post('/form', (req, res) => {
    db.run('INSERT INTO data (name, height, weight, birthdate, married) VALUES (?, ?, ?, ?, ?)',
        [req.body.name, req.body.height, req.body.weight, req.body.birth, req.body.married], (err) => {
            if (err) res.send(err)
            else res.redirect('/')
        })
})

app.get('/delete/:index', (req, res) => {
    const index = req.params.index
    db.run('DELETE FROM data WHERE id = ?', [index], (err) => {
        if (err) res.send(err)
        else res.redirect('/')
    })
})

app.listen(port, () => {
    console.log(`BREAD app listening on port ${port}`)
});