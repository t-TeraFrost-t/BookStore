const {Client} = require('pg');
fs = require('fs');
const client = new Client({
    user: 'mincho',
    host: 'localhost',
    database: 'testbookstore',
    password: 'PALEsedem'
  });
  client.connect();
  password = 'asdf';
  sal = getRandomString(20);
  user = getRandom(5);
    ema = `${user}@gmail.com`;
let query = ` insert into users (username,email,password,salt) values ('${user}','${ema}',MD5(CONCAT('asdf','${sal}')),'${sal}') `
for(let i=0;i<=100000;i++){
    username = getRandom(7);
    email = `${username}@gmail.com`;
    salt = getRandomString(20);
    query += `,('${username}','${email}',MD5(CONCAT('${password}','${salt}')),'${salt}')`;
}
query+= 'ON CONFLICT username DO NOTHING;'
//console.log(query);
client.query(query,(err,resu)=>{
    if(err){
        console.log(err.message);
    }else{
         client.query('select id from users where id>933188',(error,re)=>{
             if(error){
                 console.log(error.message);
             }else{
                 let q = `insert into validated_users (key,id_user,valid,time_of_creation) values ('123123123123',15,True,NOW()) `
                 re.rows.forEach((el)=>{
                     q+=`, ('${getRandomString(50)}',${el.id},True,NOW()) `
                 })
                
                 console.log(q);
                 client.query(q,(erro,res)=>{
                     if(erro){
                         console.log(erro.message);
                     }else{
                         console.log('done');
                     }

                 })
             }
         })   
    }
})
function getRandomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
function getRandom(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}