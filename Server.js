var express = require('express')
var path = require('path')
var fs = require('fs')
var passport = require('passport')
var session = require('express-session')
var bodyParser = require('body-parser')
var MySQLStorage = require('express-mysql-session')(session)
var mysql = require('mysql')
var app = express()
var sessionStore = new MySQLStorage({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'product'
})
app.use(bodyParser())
app.use(session({
	secret : 'sdfghjkl',
	resave : false,
	saveUninitialized : false,
	store : sessionStore
}))
app.use(passport.initialize())
app.use(passport.session())
app.set('view engine','ejs')
app.use('/',express.static('views'))
var con = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'product'
})

// app.use('/',(req,res,next)=>{
// 	console.log(req.url)
// 	next()
// })

con.connect((err)=>{
	if (err) throw err
	// con.query('truncate table product',(err,result)=>{})
	console.log('connected...')
})

app.get('/',(req,res)=>{
	console.log(req.isAuthenticated())
	if(req.isAuthenticated()){
		return res.status(200).redirect('/login')
	}
	res.status(200).render('signin')
})

app.get('/Signup',(req,res)=>{
	res.status(200).render('Signup')
})

app.post('/verify',(req,res)=>{
	var data = req.body
	var verifyUser = `select * from users where Username = "${data.Username}" and Password = "${data.password}"`
	con.query(verifyUser,(err,result)=>{
		if(err) throw err
		if(result.length > 0){
			req.login(result[0].Username, err => {
				if(err) throw err
				res.redirect('/login')
			})
		}else{
			res.status(404).send('Invalid Username and Password')
		}
	})
})

app.get('/login',authenticationMiddleware(),(req,res)=>{
	res.status(200).render('ShopingCart',{user : req.user})
})

app.post('/addUser',(req,res)=>{
	var User = req.body
	var userAlreayExist = `select * from users where Email = "${User.Email}" or Username = "${User.username}"`
	var addUser = `insert into users(Email, Password, Username) values("${User.Email}", "${User.password}" ,"${User.username}")`
	var isValidEmail = /^\w+(\.\w+)*@[a-zA-Z]+(\.[a-zA-Z]+)*\.[a-zA-Z]+$/
	if(isValidEmail.test(User.Email)){
		if (validPassword(User.password)){
			con.query(userAlreayExist,(err,result)=>{
				if(err) throw err
				if(result.length > 0){
					res.send('User already exist try some another id')
				}else{
					con.query(addUser,(err,result)=>{
						if(err) throw err
						res.status(200).send('user created successfully...')
					})
				}
			})
		}
		else{
			res.send('Password is too weak')
		}
	}else{
		res.send('Enter a valid Email id')
	}
})

app.get('/logout',(req,res)=>{
	req.session.destroy()
	res.status(200).redirect('/')
})

app.post('/Update',(req,res)=>{
	var data1 = ''
	req.on('data',(chunk)=>{
		data1 += chunk
	})
	req.on('end',()=>{
		data1 = JSON.parse(data1)
		data1.forEach((data)=>{
			var Insert = `insert into Product(ProductId, ProductName, Quantity, Username) values('${data.id}', '${data.ProductName}', '${data.value}', '${data.Username}')`
			var productExist = `select * from Product where ProductId = '${data.id}' and Username = '${data.Username}'`
			con.query(productExist,(err,result)=>{
				if(err) throw err
				if(result.length > 0){
				    con.query(`update Product set Quantity = ${data.value} where ProductId = ${data.id} and Username = '${data.Username}'`)
				    console.log('Data Updated')
				}else{
					con.query(Insert,(err,result)=>{
						if(err) throw err
						console.log('Data Added')
					})
				}
			})
		})
	})
	res.status(200).send('data add')
})

app.post('/Delete',(req,res)=>{
	var data1 = ''
	req.on('data',(chunk)=>{
		data1 += chunk
	})
	req.on('end',()=>{
		data1 = JSON.parse(data1)
		data1.forEach((data)=>{
			var del = `delete from product where ProductId = ${data.id} and Username = '${data.Username}'`
		    con.query(del,(err,result)=>{
				if(err) throw err
				console.log('delete')
		    	res.send('deletd')
			})
		})
	})
})

app.get('/:user',(req,res)=>{
	// console.log(req.params.user)
	var getdata = `select ProductName, ProductId as id, Quantity as value from Product where Username='${req.params.user}'`
	// console.log(getdata)
	con.query(getdata,(err,result)=>{
		if(err) throw err
		if(result.length > 0){
			console.log('Data Retrived')
			res.send(result)
		}else{
			console.log('No Database Found')
			res.status(300).send('No Database Found')
		}
	})
})

passport.serializeUser((user,done)=>{
	done(null, user)
})

passport.deserializeUser((user, done)=>{
	done(null,user)
})

function validPassword(password){
	var isValidPassword1 = /[A-Z]+/
	var isValidPassword2 = /[a-z]+/
	var isValidPassword3 = /[1-9]+/
	var isValidPassword4 = /[!@#$&%_-]+/
	return isValidPassword1.test(password) && isValidPassword2.test(password) && isValidPassword3.test(password) && isValidPassword4.test(password)
}

function authenticationMiddleware(){
	return (req, res, next)=>{
		if(req.isAuthenticated()){
			return next()
		}
		res.redirect('/')
	}
}

app.listen(8000)