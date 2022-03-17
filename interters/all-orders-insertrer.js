const {Client} = require('pg');
fs = require('fs');
const client = new Client({
    user: 'mincho',
    host: 'localhost',
    database: 'testbookstore',
    password: 'PALEsedem'
  });
  let start = new Date('2007-01-01');
  let end = new Date('2022-01-01')
  client.connect();
client.query(`select * from books;`,(e,r)=>{
    if(e){
        console.log(e.message);
    }else{
        books = r.rows
        client.query(`select * from users where id > 929211`,(er,re)=>{
            if(er){
                console.log(er.message);
            }else{
                users = re.rows;
                users.forEach(user => {
                    or = Math.random()*10 +1;
                    for(let i=0;i<or;i++){
                        console.log(user.id);
                        client.query(`insert into orders (id_user,id_status,creation_date,id_currency,price) values
                                                          (${user.id},${Math.random()*5+1},'${randomDate(start, end)}',1,0)`,(q,p)=>{
                                                              if(q){
                                                                  console.log(q.message);
                                                              }else{
                                                                query = `insert into books_in_order(id_order,id_book,number_of_books,current_price,id_currency) values `
                                                                ran = Math.random()*10+1;
                                                                for(let j=0;j<ran;j++){
                                                                    let book = books[books.length*Math.random()]
                                                                    query += `(${resu.id},'${book.isbn}',${Math.random()*10},${book.price},1),`
                                                                }
                                                                   let book = books[books.length*Math.random()]
                                                                    query += `(${resu.id},'${book.isbn}',${Math.random()*10},${book.price},1)`
                                                                client.query(query,(s,p)=>{
                                                                    if(s){
                                                                        console.log(s.message);
                                                                    }else{
                                                                        console.log('added order')
                                                                    }
                                                                });                      client.query('select * from orders order by desc limit 1',(err,resu)=>{
                                                                    if(err){
                                                                        console.log(err.message)
                                                                    }else{
                                                                        
                                                                    }
                                                                }) 
                                                              }
                                                          })
                                                         
                    }
                    
                });
            }
        })   
    }
});

function randomDate(start, end) {
    dt =  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return `${dt.getFullYear()}-${dt.getMonth() < 8 ? '0' + (dt.getMonth()+1).toString() : (dt.getMonth()+1).toString() }-${dt.getDate() < 8 ? '0' + dt.getDate().toString() : dt.getDate().toString() }`
}