module.exports = function(app,client,pool){
    let number_of_element = 50;
    app.get("/books", async (req,res,next)=>{
    
        let query = `select isbn,
                            books.name as name,
                            books.id,
                            cover,autor,
                            round((books.price - books.discount )/cast(currency.devision as decimal),2) as price,
                            round((books.price)/cast(currency.devision as decimal),2) as price_usual , 
                            description, 
                            currency.name as currency      
                                from books 
                                    inner join currency on currency.id = books.id_currency
                                        where true`;
        let params = []
        let queryC = `select count(*) from books
                        inner join currency on currency.id = books.id_currency
                            where true` 
        let paramsC = []
        if(req.query.name){
            params.push(req.query.name);
            query+= ` and Position( $${params.length}  in name) <> 0`;
            paramsC.push(req.query.name);
            queryC+= ` and Position( $${params.length}  in books.name) <> 0`;
        }
        if(req.query.autor){
            params.push(req.query.autor);
            query+= ` and Position( $${params.length}  in autor) <> 0`;
            paramsC.push(req.query.autor);
            queryC+= ` and Position( $${params.length}  in autor) <> 0`;
        }
    
        if(req.query.id){
            params.push(req.query.id);
            query+= ` and $${params.length}=id`;
            paramsC.push(req.query.id);
            queryC+= ` and $${params.length}=id`;
        }
        if(req.query.lower){
            params.push(req.query.lower);
            query+= ` and $${params.length}<=price`;
            paramsC.push(req.query.lower);
            queryC+= ` and $${params.length}<=price`;
        }
        if(req.query.upper){
            params.push(req.query.upper);
            query+= ` and $${params.length}>=price`;
            paramsC.push(req.query.upper);
            queryC+= ` and $${params.length}>=price`;
        }
        if(req.query.genere && req.query.genere!=0){
            params.push(req.query.genere);
            query+= ` and $${params.length}=id_gener`
            paramsC.push(req.query.genere);
            queryC+= ` and $${params.length}=id_gener`
        }
       //console.log(req.query.orderby);
    
       
       if(!req.query.page){
        req.query.page=1;
       }
       //console.log(req.query.page); 
       //params.push('ASC');().toString()
       params.push(req.query.page);
       query+= ` order by books.discount DESC,books.price ${req.query.orderby == 1 ? 'ASC': 'DESC'}
                    offset $${params.length} rows
                        FETCH FIRST ${number_of_element} ROW ONLY `;
        
        //console.log(query);
        const c = await pool.connect();
        try{
            
            const ressult = await c.query(query,params);
            const ss = await c.query(queryC,paramsC);
            const ress = await c.query('select * from geners ');
            
            if(req.session.idUser){
                //console.log(req.session.idUser);
                const result = await c.query(`select username from users where id=$1`,[req.session.idUser])   
                console.log(result);
                            res.render('client/main',{value:req.query,
                                                  books: ressult.rows,
                                                  geners: ress.rows, 
                                                  user:result.rows[0],
                                                  curent:'books',
                                                  pages:{
                                                      current:req.query.page, 
                                                      maxPage:Math.floor(ss.rows[0].count/number_of_element)
                                                        }
                                                    });        
            }else{
                res.render('client/main',{value:req.query,
                    books: ressult.rows, 
                    curent:'books',
                    geners: ress.rows, 
                    pages:{
                        current:req.query.page, 
                        maxPage:Math.floor(ss.rows[0].count/number_of_element)
                      }
                  });
            }
            
        }catch(err){
            next({message:err.message});
           
        }
        finally {
            c.release();
        }
        
        
    });

    app.get("/book/:id",(req,res,next)=>{
    
        client.query(`select books.isbn,
                             books.description,
                             books.amount,
                             books.name, 
                             books.cover,
                             books.autor,
                             books.id,
                             round((books.price - books.discount )/cast(currency.devision as decimal),2) as price,
                             round((books.price)/cast(currency.devision as decimal),2) as price_usual,
                             currency.name as currency,  
                             geners.name as gener 
                                from books inner 
                                    join geners on books.id_gener=geners.id
                                    join currency on currency.id = books.id_currency 
                                        where books.id=$1`,[req.params.id],(error,ressult)=>{
                                    
                                    if(error){
                                        next({message:error.message});
            }else{
                
                //console.log(ressult.rows);
                
                    if(req.session.idUser){
                        console.log("hi");
                        client.query(`select username from users where id=$1`,[req.session.idUser],(error,result)=>{
                            if(error){
                                next({message:error.message});
                            }else{
                                console.log(result.rows[0]);
                                res.render('client/book',{book: ressult.rows[0],user:result.rows[0]});        
                            }
                        })
                    }else{
                        res.render('client/book',{book: ressult.rows[0]});
                    }
                    
                
                
            }
        });
    });
}