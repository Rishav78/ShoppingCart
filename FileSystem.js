var express = require('express')
var path = require('path')
var fs = require('fs')
var app = express()
var bodyParser = require('body-parser')
app.use(bodyParser())
app.use('/',express.static('views'))
app.set('view engine','ejs')

app.get('/',(req,res)=>{
	res.status(200).render('signin')
})

app.post('/LoginUser',(req,res)=>{
	var data = req.body
	var allUser =JSON.parse(fs.readFileSync(path.join(__dirname,'User'),'utf8'))
	var data2 = allUser.find((value)=>{return (value.Email===data.Email && value.password===data.password)})
	if(data2){
		res.render('ShopingCart',{user : data2.username})
	}else{
		res.status(300).send('Invalid Username and Password')
	}
})

// app.get('/Signup',(req,res)=>{
// 	res.status(200).render('Signup')
// })

app.post('/addUser',(req,res)=>{
	var User = req.body
	var isValidEmail = /^\w+(\.\w+)*@[a-zA-Z]+(\.[a-zA-Z]+)*\.[a-zA-Z]+$/
	if(isValidEmail.test(User.Email)){
		if (validPassword(User.password)){
			var allUser =JSON.parse(fs.readFileSync(path.join(__dirname,'User'),'utf8'))
			var userAlreayExist = allUser.find((value)=>{
				return value.Email === User.Email || value.username === User.username
			})
			if(userAlreayExist){
				res.send('User already exist try some another id')
			}else{
				allUser.push(User)
				fs.writeFileSync(path.join(__dirname,'User'),JSON.stringify(allUser))
				fs.writeFile(path.join(__dirname,'Users',User.username), '[]', function (err) {
				  if (err) throw err;
				  console.log('File is created successfully.');
				});
				res.status(200).render('Shoping Cart',{user : User.username})
			}
		}
		else{
			res.send('Password is too weak')
		}
	}else{
		res.send('Enter a valid Email id')
	}
})

app.post('/:user',(req,res)=>{
	var data = ''
	req.on('data',(chunk)=>{
		data += chunk
	})
	req.on('end',()=>{
		fs.writeFileSync(path.join(__dirname,'Users',req.params.user),data)
	})
	res.status(200).send('data add')
})

app.get('/:user',(req,res)=>{
	var data = fs.readFileSync(path.join(__dirname,'Users',req.params.user),'utf8')
	if(data!=''){
		data = JSON.parse(data)
		if(data.length > 0){
			res.status(200)
		}else{
			res.status(300)
		}
	}else{ 
		res.status(300)
	}
	res.send(data)
})

function validPassword(password){
	var isValidPassword1 = /[A-Z]+/
	var isValidPassword2 = /[a-z]+/
	var isValidPassword3 = /[1-9]+/
	var isValidPassword4 = /[!@#$&%_-]+/
	return isValidPassword1.test(password) && isValidPassword2.test(password) && isValidPassword3.test(password) && isValidPassword4.test(password)
}

app.listen(8000)