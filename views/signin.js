var next = document.querySelector('#Next')
var lEmail = document.querySelector('.lEmail')
var lpassword = document.querySelector('.lpassword')
var back = document.querySelector('.back')
next.onclick = ()=>{
    lEmail.style.display = 'none'
    lpassword.style.display = 'block'
}
back.onclick = ()=>{
    lEmail.style.display = 'block'
    lpassword.style.display = 'none'
}