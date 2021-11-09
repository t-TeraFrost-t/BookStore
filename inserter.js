const {Client} = require('pg');
fs = require('fs');
const client = new Client({
    user: 'mincho',
    host: 'localhost',
    database: 'testbookstore',
    password: 'PALEsedem1@'
  });
  client.connect();
fs.readFile('data-young-adult-hardcover.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }else{
    data = JSON.parse(data);
  data.forEach(book => {
      //console.log(book);
      let query = `insert into books(isbn,name,autor,price,cover,amount,id_gener,description)
      values ('${book.isbn}','${book.title.replace('\\','').replace('\'','*')}','${book.author.replace('\\','').replace('\'','*')}',${book.price},'${book.cover}',${book.number_of_books},${parseInt(book.gener)+1},'${book.description.replace('\'','*')}')
      ON CONFLICT (isbn) DO NOTHING;`;
      //console.log(query);
      client.query(query,(err,result)=>{
        if(err){
               console.log(err.message);
                console.log(query);
                return ;
           }else{
               console.log(book.isbn);
           }
       });
    });     
  }
  console.log("done");
    
  
});