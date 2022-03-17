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
        books = r.rows;
        
        client.query(`select * from orders where price = 0`,(er,re)=>{
            if(er){
                console.log(e.message);
            }else{
                orders = re.rows;
                query = `insert into books_in_order(id_order,id_book,number_of_books,current_price,id_currency) values `
                orders.forEach(order => {
                  
                  
                      let book = books[Math.floor(books.length*Math.random())]
                      query += `(${order.id},'${book.isbn}',${Math.random()*10},${book.price},1),`
                  
                     
                     
                     
                        
                     
                  });
                  let book = books[Math.floor(books.length*Math.random())]
                  query += `(1010011,'${book.isbn}',${Math.random()*10},${book.price},1)`
                  client.query(query,(s,p)=>{
                    console.log(query);
                    if(s){
                      console.log(s.message);
                  }else{
                      console.log('added order')
                  }
                });
            }
        })
    }
});

1 - 100
2 - 67 -
3 - 100 -
4 - 0
5 - 100
6 - 60 -
7 - 50 - 