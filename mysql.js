let http = require('http');
let url = require('url');
let qs = require('querystring');

// 连接数据库
let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '100810',
    database: 'nodesql'
});

connection.connect();
//end

let server = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'PUT,GET,POST,DELETE,OPITIONS')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    let body = '';
    if (req.url === '/getUserInfo') {
        connection.query(`select * from user_info`, (err, result) => {
            if (err) {
                console.log(err)
            }
            let arr = []
            if (result) {
                for (let i of result) {
                    arr.push(i)
                }
                res.write(JSON.stringify(arr) + '')
                res.end()
            }
        })
    }
    req.on('data', function (chunk) {
        body += chunk
        body = qs.parse(body)
        if (req.url === '/login') {
            connection.query(`select count(*) from user_info where user_name='${body.user_name}'`, function (err, result) {
                console.log(result);
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                if (result) {
                    if (result[0]['count(*)'] === 0) {
                        res.end('用户名不存在');
                    } else {
                        connection.query(`select * from user_info where user_name='${body.user_name}'`, function (err, result) {
                            if (result[0].user_name === body.user_name && result[0].user_password === ~~(body.user_password)) {
                                res.end('ok')
                            } else {
                                res.end('用户名或密码不正确')
                            }
                        })
                    }
                }
            });
        }
        if (req.url === '/register') {
            connection.query(`select * from user_info where user_name='${body.user_name}'`, function (err, result) {
                if (err) {
                    console.log('err', err)
                    return
                }
                if (result.length === 0) {
                    console.log(result.length)
                    connection.query(`insert into  user_info(user_name,user_password) values("${body.user_name}",${body.user_password})`, function (err, result) {
                        if (err) {
                            console.log('[SELECT ERROR] - ', err.message);
                            return;
                        }
                        if (result) {
                            res.end('注册成功')
                        }
                        console.log(result);
                    });
                } else {
                    res.end('用户名重复');
                }
            });
        }
        if (req.url === '/editUserInfo') {
            connection.query(`update user_info set user_name = '${body.user_name}', user_password = '${body.user_password}' where user_id = '${body.user_id}'`, (err, result) => {
                if(err){
                    console.log(err)
                    return
                }
                if(result){
                    res.end('ok')
                    console.log(result, 'res')
                }
            })
        }
    })
    // connection.end();
}).listen(3000, 'localhost', function () {
})