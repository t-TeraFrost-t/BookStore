const {Client} = require('pg');
fs = require('fs');
const client = new Client({
    user: 'mincho',
    host: 'localhost',
    database: 'testbookstore',
    password: 'PALEsedem1@'
  });
  client.connect();
client.query(`select * from books;`,(e,r)=>{
    if(e){
        console.log(e.message);
    }else{
        let dt = new Date("2007-01-01");
        let stop = new Date('2022-01-01');
        let query = `insert into orders (id_user,id_status,creation_date,id_currency,price) values`;
        for(dt;dt< stop;dt.setDate(dt.getDate()+1)){ 
            query +=  `(16,${Math.floor(Math.random()*6)+1},'${dt.getFullYear()}-${dt.getMonth() < 8 ? '0' + (dt.getMonth()+1).toString() : (dt.getMonth()+1).toString() }-${dt.getDate() < 8 ? '0' + dt.getDate().toString() : dt.getDate().toString() }',1,0 ),`
        }
            client.query(query.slice(0,-1)+';',(er,re)=>{
                               if(er){
                                   console.log(dt);
                                   console.log(er.message,0);
                               }else{
                                client.query(`select * from orders order by id asc`,(errr,resp)=>{
                                    if(errr){
                                      console.log(errr.message,1);
                                    }else{
                                        let queryO = `insert into books_in_order(id_order,id_book,number_of_books,current_price,id_currency) values `
                                        resp.rows.forEach((row)=>{
                                            let rand = Math.floor(Math.random()*11);
                                            
                                            for( let i =0;i<rand;i++){
                                                let index = Math.floor(Math.random()*r.rows.length);
                                                queryO+= `(${row.id},'${r.rows[index].isbn}',${Math.floor(Math.random()*12)+1},${r.rows[index].price},1),`;
                                                
                                            }
                                            

                                        })
                                        console.log(queryO.slice(0,-1)+';');
                                            client.query(queryO.slice(0,-1)+';',(err,result)=>{
                                                if(err){
                                                    console.log(err.message);
                                                }else{
                                                    console.log('done');
                                                }
                                            });
                                        client.query(`update orders
                                                        set price = ords.sum
                                                            from (select id_order, sum(current_price*number_of_books) as sum 
                                                                    from books_in_order
                                                                         group by id_order) as ords
                                                                where orders.id = ords.id_order ;
                                        `,(ero,resu)=>{
                                                                    if(ero){
                                                                        console.log(ero.message);
                                                                    }else{
                                                                        console.log('done more');
                                                                    }
                                                                })
                                        client.query(`delete from orders where price = 0`,(bla,blu)=>{
                                            if(bla){
                                                console.log(bla.message);
                                            }else{
                                                console.log('triple done');
                                            }
                                        })      
                                    }
                                })
                               }
                            })
        
    }
});