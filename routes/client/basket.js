module.exports = function(app,client,pool){

    app.get("/basket",(req,res,next)=>{
        if(req.session.idUser){
            client.query(`select * from baskets where id_user=$1`,[req.session.idUser],(error,result)=>{
                if(error){
                    next({message:error.message});
                }else{
                    client.query(`select * from users where id=$1;`,[req.session.idUser],(e,r)=>{
                        if(e){
                            next({message:e.message});
                        }else{
                            if(result.rows[0]){
                                client.query(`select books.name as name,
                                                     books_in_basket.id as id,
                                                     books_in_basket.number_of_books as number_of_books , 
                                                     books.isbn as isbn, 
                                                     round((books.price - books.discount )/cast(currency.devision as decimal),2) as price
                                                        from books_in_basket 
                                                            inner join books on books_in_basket.id_book=books.id
                                                            inner join currency on books.id_currency = currency.id
                                                              where books_in_basket.id_basket=$1
                                                                  order by books.id`,[result.rows[0].id],(err,resl)=>{
                                if(err){
                                    next({message:err.message});
                                }else{
                                    client.query(`select sum(books_in_basket.number_of_books*round((books.price - books.discount )/cast(currency.devision as decimal),2)) 
                                                    from books_in_basket 
                                                        inner join books on books_in_basket.id_book=books.id
                                                        inner join currency on books.id_currency = currency.id
                                                            where books_in_basket.id_basket=$1`,[result.rows[0].id],(errTotal,reslTotal)=>{
                                                        if(errTotal){
                                                            next({mesage:errTotal.message});
                                                        }else{
                                                            res.render('client/basket',{books:resl.rows,
                                                                                        curent:'basket', 
                                                                                        user:r.rows[0], 
                                                                                        total:reslTotal.rows[0].sum});
                                                        }
                                                });
                                }
                               });
                            }else{
                                res.render('client/basket',{books: new Array(),curent:'basket' ,user:r.rows[0]});
                            }
                        }
    
                    });
                    
                        
                    
                         
                }
            });
        }else{
            next({message:'error'});
        }
    });
    app.post("/basket-delete",(req,res,next)=>{
        if(req.session.idUser){
            client.query(`delete from books_in_basket  
                            where id=$1`,[req.body.id],(err,resl)=>{
                                if(err){
                                    next({message:err.message,json:'err'});
                                }else{
                                    res.send('deleted');    
                                }
                            });
        }else {
            next({message:'error'});
        }
    });
    app.post("/update-basket",(req,res,next)=>{
        if(req.session.idUser){
            client.query(`update books_in_basket 
                           set number_of_books=$1 
                            where id=$2`,[req.body.count,req.body.id],(err,resl)=>{
                                if(err){
                                    next({message:er.message,json:'err'});
                                }else{
                                    res.send();
                                }
                            });
        }else {
            next({message:error.message});
        }
    });
    app.post("/add-basket",async (req,res,next)=>{
        if(req.session.idUser){
            const client = await pool.connect();
            try{
                             await client.query('BEGIN')
                let basket = await client.query(`select * from baskets where id_user=$1`,[req.session.idUser]);
                if(!basket.rows[0]){
                             await client.query(`insert into baskets(creation_date,id_user) values (now(),$1)`,[req.session.idUser]);
                    basket = await client.query(`select * from baskets where id_user=$1`,[req.session.idUser]);         
                }
           basket_contents = await client.query(`select * from books_in_basket 
                                                 where id_book=$1 and id_basket = $2`,[req.body.idBook,basket.rows[0].id])
                if(basket_contents.rows[0]){
                             await client.query(`update books_in_basket 
                                                    set number_of_books=$1 
                                                 where id_book=$2 
                                                   and id_basket=$3`,[basket_contents.rows[0].number_of_books+1,
                                                                      req.body.idBook,
                                                                      basket.rows[0].id])
             
                }else{
                             await client.query(`insert into books_in_basket(id_basket,id_book,number_of_books) 
                                                    values ($1,$2,1)`,[basket.rows[0].id,req.body.idBook])
                }
                             await client.query('COMMIT');
                client.release()
                res.send("added");

            }catch(err){
                console.log(err);
                await client.query('ROLLBACK')
                client.release()
                next({message:error.message,json:'err'});
            }
            
        }else{
            next({message:error.message});
        }
    });
    //other routes..
}