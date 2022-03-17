module.exports = function(app,client,pool,paypal){
    let number_of_element = 50;
    app.get("/orders",(req,res,next)=>{
        console.log(req.session);
        if(req.session.idUser){
            console.log(req.session);
            client.query(`select orders.id as id,
                                 orders.creation_date, 
                                 status_of_order.name, 
                                 round(orders.price/cast(currency.devision as decimal),2) as price
                                  from orders 
                                    inner join status_of_order 
                                        on status_of_order.id = orders.id_status 
                                    inner join currency 
                                        on currency.id = orders.id_currency
                                            where id_user=$1
                                                order by id DESC`,[req.session.idUser],(error,result)=>{
                if(error){
                    next({message:error.message});
                    //console.log(error.message);
                }else{
                    console.log(result.rows[0]);
                    if(!req.query.page)req.query.page=1;
                    let temp = result.rows.slice((req.query.page-1)*number_of_element,(req.query.page-1)*(number_of_element)+number_of_element);
                    client.query(`select * from users where id=$1`,[req.session.idUser],(e,r)=>{
                        res.render("client/orders",{orders:temp,
                                                    curent:'orders',
                                                    user:r.rows[0],
                                                    pages : {
                                                        current:req.query.page, 
                                                        maxPage:Math.floor(result.rows.length/number_of_element)
                                                          }
                                                }
                                                    );
                    });
                    
                }
            });
        }else{
            res.send("error");
        }
    });
    app.get("/order", async (req,res,next)=>{
        if(req.session.idUser){
            try{
                const client = await pool.connect();
                await client.query('BEGIN');
                const basket = await client.query(`select * from baskets where id_user=$1`,[req.session.idUser]);
                const check = await client.query(`select books.amount,books.name, books.isbn  
                                                    from books 
                                                        inner join books_in_basket 
                                                            on books.id=books_in_basket.id_book    
                                                        where books_in_basket.id_basket=$1  
                                                              and (books.amount-books_in_basket.number_of_books)<0`,[basket.rows[0].id])
                //console.log(JSON.stringify(check));                                              
                if(check.rows.length == 0){
                    const sum = await client.query(`select sum(books_in_basket.number_of_books * (books.price - books.discount))  
                                                        from books_in_basket 
                                                            inner join books 
                                                                on books_in_basket.id_book=books.id 
                                                                    where books_in_basket.id_basket=$1;`,[basket.rows[0].id])
                                await   client.query(`insert into orders( id_user,
                                                                        creation_date,
                                                                        id_status,
                                                                        price,
                                                                        id_currency) 
                                                                        values ($1, now(),1,$2,1)`,[req.session.idUser, sum.rows[0].sum])
                    const order = await client.query(`select * from orders 
                                                    where id_user=$1 
                                                     order by id desc
                                                    limit 1 `,[req.session.idUser])
                                console.log(JSON.stringify(order));
                                
                                await   client.query(`insert into books_in_order(id_order,id_book,number_of_books,current_price,id_currency) 
                                                                                select $1,
                                                                                books_in_basket.id_book,
                                                                                books_in_basket.number_of_books,
                                                                                (books.price - books.discount ),
                                                                                currency.id as currency
                                                                                from books_in_basket
                                                                                inner join books
                                                                                    on books.id = books_in_basket.id_book  
                                                                                inner join currency 
                                                                                    on books.id_currency = currency.id
                                                                                    where id_basket=$2`,[order.rows[0].id,basket.rows[0].id])                                                                    
                                await   client.query(`delete from books_in_basket 
                                                        where id_basket=$1`,[basket.rows[0].id]) 
                                await   client.query(`delete from baskets where id=$1`,[basket.rows[0].id])
                                await   client.query(`update books set amount=amount-subquery.number_of_books 
                                                        FROM (select * 
                                                                from books_in_order 
                                                                    where id_order=$1) as subquery  
                                                        where books.id=subquery.id_book`,[order.rows[0].id])
                                await client.query('COMMIT')
                                res.redirect(`/pay/${order.rows[0].id}`);
                }else{
                    let str = 'Not sufficent quantity for books\n'
                    check.rows.forEach((el)=>{
                        str+=`Name: ${el.name} ISBN: ${el.isbn} InStock: ${el.amount}`;
                    })
                    res.send(str);
                                
                }                                              
            }catch(err){
                console.log(err);
                await client.query('ROLLBACK')
                next({message:error.message});
            }
            finally {
                client.release()
            } 
        }else{
            res.send("error");
        }
    });
    app.get("/order/:id",(req,res,next)=>{
     client.query('select * from users where $1=id',[req.session.idUser],(w,u)=>{
         if(w){
             console.log(w.message);
         }else{
            client.query(`select books.name as name, 
                                 books.autor as autor, 
                                 books.isbn as isbn, 
                                 round(books_in_order.current_price/cast(currency.devision as decimal),2) as price, 
                                 books_in_order.number_of_books as amount,
                                 currency.name as currency 
                                 from books_in_order 
                                    inner join books 
                                        on books_in_order.id_book=books.id
                                    inner join currency
                                        on currency.id = books_in_order.id_currency
                                    where id_order=$1`,[req.params.id],(error,result)=>{
            if(error){
                next({message:error.message});
            }else{
                client.query(`select round(orders.price/cast(currency.devision as decimal),2) as sum,
                                     currency.name as currency
                                      from orders 
                                        inner join currency 
                                         on currency.id = orders.id_currency
                                            where orders.id = $1 `,[req.params.id],(err,relt)=>{
                                        if(err){
                                            next({message:error.message});
                                        }else{
                                            res.render("client/books_in_order",{books:result.rows,user: u.rows[0] ,sum:relt.rows[0] })
                                        }
                       });
    
    }
    });     
         }
     })
        
    });
    app.get("/view-order/:id",(req,res,next)=>{
     if(req.session.idUser){
        client.query(`select from users where $1=id`,[req.session.idUser],(e,r)=>{
            if(e){
                console.log(e);
            }else{
                client.query(`select books.name as name, 
                             books.autor as autor, 
                             books.isbn as isbn,
                             round(books_in_order.current_price/cast(currency.devision as decimal),2) as price, 
                             books_in_order.number_of_books as amount 
                              from books_in_order 
                                inner join books 
                                    on books_in_order.id_book=books.id
                                inner join currency
                                    on books_in_order.id_currency = currency.id
                                      where id_order=$1`,[req.params.id],(error,result)=>{
            if(error){
                next({message:error.message});
            }else{
                client.query(`select sum(round(books_in_order.current_price/cast(currency.devision as decimal),2)*books_in_order.number_of_books)
                from books_in_order 
                    inner join books 
                     on books_in_order.id_book=books.id
                     inner join currency
                                    on books_in_order.id_currency = currency.id
                        where id_order=$1`,[req.params.id],(err,relt)=>{
                            if(err){
                                next({message:err.message});
                            }else{
                                res.render("client/books_in_order",{books:result.rows,user: e.rows[0],user:r.rows[0] ,sum:relt.rows[0].sum ,currency:currency})
                            }
                        });
            }
        })
            }
        });
     }else{
         res.send('error');
     }
            
    
    });
    app.get("/pay/:id", async (req,res,next)=>{
        let date = new Date();
        if(req.session.idUser){
            client.query(`select books.name as name, 
                                 round((books.price - books.discount )/cast(currency.devision as decimal),2) as price, 
                                 books_in_order.id_book as isbn,
                                 currency.name as currency,
                                 books_in_order.number_of_books
                                  from books_in_order 
                                   inner join books on books.id=books_in_order.id_book
                                     inner join currency on books.id_currency = currency.id 
                                       where id_order=$1`,[req.params.id],(err,result)=>{
                                         if(err){
                                            next({message:err.message});
                                         }else{
                                            client.query(`select round(orders.price/cast(currency.devision as decimal),2) as price,
                                                                 currency.name as currency, 
                                                                 orders.id as id
                                                                 from orders 
                                                                    inner join currency on orders.id_currency=currency.id
                                                                        where orders.id=$1
                                                                            group by currency.name,currency.devision,orders.id`,[req.params.id],(e,r)=>{
                                                if(e){
                                                    next({message:e.message});
                                                }else{
                                                    let item = [];
                                                    req.session.order=r.rows[0];
                                                    result.rows.forEach((row)=>{
                                                        item.push({
                                                            name: row.name,
                                                            sku: row.isbn,
                                                            currency: row.currency,
                                                            price: row.price,
                                                            quantity: row.number_of_books
                                                        });
                                                });
                                                let create_paypemnt_json = {
                                                    intent: 'sale',
                                                    payer: {
                                                        payment_method: 'paypal'
                                                    },
                                                    redirect_urls: {
                                                        return_url: 'http://localhost:8080/succes',
                                                        cancel_url: 'http://localhost:8080/cancel'
                                                    },
                                                    transactions: [{
                                                        item_list: {
                                                            items: item
                                                        },
                                                        amount: {
                                                                currency: r.rows[0].currency,
                                                                total: r.rows[0].price
                                                        }
                                                    }],
                                                   
                                            
                                            
                                                };
                                                paypal.payment.create(create_paypemnt_json, async(error,payment)=>{
                                                    if(error){
                                                        next({message:error.response.details[0]});
                                                    }else{
                                                        const client = await pool.connect();
                                                         try{
                                                            await client.query('BEGIN');
                                                            await client.query(`insert into payments (id,time_of_creation,id_status) values ($1,now(),1)`,[payment.id])
                                                            await client.query(`update orders set id_payment = $1 where id = $2`,[payment.id,req.session.order.id])
                                                            await client.query('COMMIT')
                                                            payment.links.forEach((link)=>{
                                                                if(link.rel === 'approval_url'){
                                                                    
                                                                    res.redirect(link.href);
                                                                }
                                                            });
                                                        }catch(err){
                                                            console.log(err);
                                                            await client.query('ROLLBACK')
                                                            next({message:err.message});
                                                        }
                                                        finally {
                                                            client.release()
                                                        } 
                                                        
                                                    }
                                                });
    
                                            }
                                        }) 
                                     }
                                 })
        }else{
            res.send('error');
        }
    
    });  
    app.get("/succes", async (req,res,next)=>{
        
    
        const execute_paiment_json = {
            payer_id: req.query.PayerID,
            transactions: [{
                amount: {
                    currency: req.session.order.currency,
                    total: req.session.order.price
                }
            }]
        }
        try{
            const client = await pool.connect();
        
                await client.query('BEGIN');
                await client.query(`update payments set id_status = 2 where id = $1`,[req.query.paymentId])
                await client.query(`COMMIT`);
                paypal.payment.execute(req.query.paymentId,execute_paiment_json, async (error,payment)=>{
                    if(error){
                        console.log(error.response.details[0]);
                        next({message:error.response.details[0]});
                    }else{
                        try{
                            await client.query('BEGIN');
                            await client.query(`update orders set id_status=2 where id=$1`,[req.session.order.id])
                            await client.query(`update payments set id_status = 3 where id=$1`,[req.query.paymentId])
                            await client.query(`COMMIT`);
                        }catch(err){
                            console.log(err);
                            await client.query('ROLLBACK')
                            next({message:err.message});
                        }
                        client.release();
                        res.redirect('/orders');


                        
                        
                    }
                });
            
        }catch(err){
                console.log(err);
                await client.query('ROLLBACK')
                next({message:error.message});
        }
        
        
        
                                                                                                      
        
    });
    app.get('/cancel',(req,res,next)=>{
        client.query(`delete from payments where id in (select * from orders where id = $1) `,[req.session.order.id],(e,r)=>{
            client.query(`update orders set id_status=7 ,  id_payment = null where id=$1`,[req.session.order.id],(er,re)=>{
                
                if(er){
                    next({message:error.message});
                }else{
                    res.redirect('/orders');
                }
            } );
        }) 
        
    });
}