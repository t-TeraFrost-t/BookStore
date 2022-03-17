module.exports = function(app,client){

    app.get("/backoffice/reports",(req,res)=>{
    
        if(req.session.idStaff){
            client.query(`select distinct permitions_for_role.id_permition as id
            from staff
                inner join roles_of_staff
                    on roles_of_staff.id_staff = staff.id
                inner join roles 
                    on roles_of_staff.id_role = roles.id
                inner join permitions_for_role 
                    on roles.id=permitions_for_role.id_role 
                     where staff.id = $1
                        order by permitions_for_role.id_permition;`,[req.session.idStaff],(eroS,resuS)=>{
                            if(eroS){
                                console.log(eroS.message);
                            }else{
                                client.query(`select * from staff where $1=id`,[req.session.idStaff],(e,r)=>{
                                    if(e){
                                     console.log(e.message);
                                    }else{
                                        console.log(r.rows);
                                     res.render('backoffice/reports/main',{user:r.rows[0],permitions:resuS.rows});
                                    }
                                     
                                 });
                            }
                        });
            
            
        }else{
            res.send('error');
        }  
    });
    app.get("/backoffice/reports/orders",(req,res)=>{
        if(req.session.idStaff){
           client.query(`select distinct permitions_for_role.id_permition as id
                               from staff
                                   inner join roles_of_staff
                                       on roles_of_staff.id_staff = staff.id
                                   inner join roles 
                                       on roles_of_staff.id_role = roles.id
                                   inner join permitions_for_role 
                                       on roles.id=permitions_for_role.id_role 
                                        where staff.id = $1
                                           order by permitions_for_role.id_permition;`,[req.session.idBook],(errS,resS)=>{
                                               if(errS){
                                                   console.log(errS.message);
                                               }else{
                                                client.query(`select * from staff where $1=id`,[req.session.idStaff],(e,r)=>{
                                                    res.render('backoffice/reports/orders',{user:r.rows[0],permitions:resS.rows});
                                                } );
                                               }
                                           }) 
            
            
        }else{
            res.send('error');
        }  
    })
    app.get("/backoffice/reports/orders/get",(req,res)=>{
        if(req.session.idStaff){
            //client.query(`select * from users where $1=id`,[req.session.idStaff],(e,r)=>{} );
            client.query(`select * from users where $1=id`,[req.session.idStaff],(e,r)=>{
                console.log(req.query);
                let query = `select `;
                let queryT = `select round(sum(price)/cast(currency.devision as decimal),2) as sum,  currency.name as currency
                                from orders inner join currency on currency.id = orders.id_currency
                                  where true `
                if(req.query.period != 'none')
                {
                    query += `to_char(creation_date, 'IYYY${req.query.period!==" "?'-'+req.query.period : req.query.period}') as period , `;
                }
                if(req.query.user === 'true'){
                    query += `users.username as user, `
                }
                if(req.query.status === 'true'){
                    query += `status_of_order.name as status, `
                }
                query += `count(*) as count, round(sum(price)/cast(currency.devision as decimal),2) as sum, currency.name as currency `;
                query += ` from orders inner join currency on currency.id = orders.id_currency`;
                if(req.query.user === 'true'){
                    query+= ` inner join users on users.id=orders.id_user `;
                }
                if(req.query.status === 'true'){
                    query+= ` inner join status_of_order on status_of_order.id=orders.id_status `;
                }
                query += ' where true '
                if(req.query.startDate){
                    query += `and orders.creation_date >= '${req.query.startDate}'::timestamp with time zone at time zone '+03'`
                    queryT += `and orders.creation_date >= '${req.query.startDate}'::timestamp with time zone at time zone '+03'`
                }
                if(req.query.endDate){
                    query += `and orders.creation_date <= '${req.query.endDate}'::timestamp with time zone at time zone '+03'`
                    queryT += `and orders.creation_date <= '${req.query.endDate}'::timestamp with time zone at time zone '+03'`
                }
                query+= ` group by currency.name, currency.devision`
                queryT+= ` group by currency.name, currency.devision`
                if(req.query.period != 'none')
                {
                
                   query+=`, period`;
                }
                if(req.query.user === 'true'){
                    query+= `, users.username`
                }
                if(req.query.status === 'true'){
                    query+= `, status_of_order.name`
                }
                if(req.query.period != 'none')
                {
                    query+= ' order by period';
                }
                
                console.log(query);
                client.query(query,(err,result)=>{
                if(err){
                    console.log(err.message);
                }else{
                    client.query(queryT,(e,r)=>{
                        if(e){
                            console.log(e.message);
                        }else{
                            res.send({res:result.rows,user:r.rows[0],total:r.rows[0]});
                        }
                    })
                    
                }
            })
            } );
               
           }else{
               res.send('error');
           } 
        
    });
    app.get("/backoffice/reports/orders-range",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select * from staff where $1=id`,[req.session.idStaff],(e,r)=>{
                res.render('backoffice/reports/orders-range',{user:r.rows[0]});
            });
            
        }else{
            res.send('error');
        }  
    })
    app.get("/backoffice/reports/geners",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select * from staff where $1=id`,[req.session.idStaff],(e,r)=>{
                res.render('backoffice/reports/geners',{user:r.rows[0]});
            } );
            
        }else{
            res.send('error');
        }  
    })
    app.get("/backoffice/reports/books",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select * from staff where $1=id`,[req.session.idStaff],(e,r)=>{
                res.render('backoffice/reports/books',{user:r.rows[0]});
            } );
            
        }else{
            res.send('error');
        }  
    })
    app.get("/backoffice/reports/books/get",(req,res)=>{
        if(req.session.idStaff){
            //client.query(`select * from users where $1=id`,[req.session.idStaff],(e,r)=>{} );
            client.query(`select * from users where $1=id`,[req.session.idStaff],(e,r)=>{
                let query = ` select sum(books_in_order.current_price*books_in_order.number_of_books) as sum, 
                                     sum(books_in_order.number_of_books) as count,
                                     books.name as name, 
                                     books.isbn as isbn,
                                     books.autor as autor
                                      from books_in_order
                                       inner join books
                                         on books.isbn = books_in_order.id_book
                                       inner join orders
                                         on books_in_order.id_order = orders.id
                                         where (orders.id_status > 1 and orders.id_status < 7) 
                                `;
                let params = [];
                if(req.query.name){
                    params.push(req.query.name);
                    query+= ` and Position( $${params.length}  in books.name) <> 0`;
                }
                if(req.query.autor){
                    params.push(req.query.autor);
                    query+= ` and Position( $${params.length}  in books.autor) <> 0`;
                }
                if(req.query.isbn){
                    params.push(req.query.isbn);
                    query+= ` and $${params.length} = books.name`;
                }
                query+=`group by books.isbn
                            order by books.isbn DESC`;
                client.query(query,params,(err,result)=>{
                if(err){
                    console.log(err.message);
                }else{
                    res.send({res:result.rows,user:r.rows[0]});
                }
            })
            } );
               
           }else{
               res.send('error');
           } 
        
    });
}