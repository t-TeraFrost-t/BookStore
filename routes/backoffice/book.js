module.exports = function(app,client){
    app.get("/backoffice-books",(req,res)=>{
        let number_of_element = 50;
     if(req.session.idStaff){
        client.query(`select bool_or(permitions_for_role.id_permition = 2) as check
                            from staff 
                                inner join roles_of_staff
                                    on roles_of_staff.id_staff = staff.id
                                inner join roles 
                                    on roles_of_staff.id_role = roles.id
                                inner join permitions_for_role 
                                    on roles.id=permitions_for_role.id_role 
                                where staff.id = $1;`,[req.session.idStaff],(errorC,resultC)=>{
                                if(errorC){
                                    console.log(errorC.message);
                                }else{
                                    console.log(resultC.rows);
                                    if(resultC.rows[0].check){
                                        client.query(`select permitions_for_role.id_permition as id
                                                            from staff 
                                                                inner join roles_of_staff
                                                                    on roles_of_staff.id_staff = staff.id
                                                                inner join roles 
                                                                    on roles_of_staff.id_role = roles.id
                                                                inner join permitions_for_role 
                                                                    on roles.id=permitions_for_role.id_role 
                                                                    where staff.id = $1;`,[req.session.idStaff],(errorP,resultP)=>{
                                                            if(errorP){
                                                                console.log(errorP.message);
                                                            }else{
                                                                console.log(resultP.rows);
                                                                
                                                                    let query = `select books.isbn as isbn,
                                                                    books.name, 
                                                                    books.autor as autor, 
                                                                    books.amount, 
                                                                    round((books.price - books.discount )/cast(currency.devision as decimal),2) as price , 
                                                                    books.amount as amount, 
                                                                    books.id,
                                                                    currency.name as currency,
                                                                    geners.name as gener 
                                                                        from books 
                                                                            inner join geners 
                                                                             on books.id_gener=geners.id
                                                                            inner join currency
                                                                             on books.id_currency = currency.id  
                                                                              where true `;
                                                let params = [];
                                                if(req.query.name){
                                                    params.push(req.query.name);
                                                    query+= ` and Position( $${params.length}  in books.name) <> 0`;
                                                }
                                                if(req.query.autor){
                                                    params.push(req.query.autor);
                                                    query+= ` and Position( $${params.length}  in autor) <> 0`;
                                                }
                                                if(req.query.amountUpper){
                                                    params.push(req.query.amountUpper);
                                                    query+= ` and $${params.length}>=amount`;
                                                }
                                                if(req.query.amountLower){
                                                    params.push(req.query.amountLower);
                                                    query+= ` and $${params.length}<=amount`;
                                                }
                                                if(req.query.gener && req.query.gener!=0){
                                                    params.push(req.query.gener);
                                                    query+= ` and $${params.length}=id_gener`
                                                }
                                                if(!req.query.page){
                                                    req.query.page=1;
                                                   }
                                                   console.log(query);
                                                   query += ` order by isbn ASC`
                                                client.query(query,params,(err,result)=>{
                                                    if(err){
                                                        console.log(err.message);
                                                    }else{
                                                        client.query(`select * from geners;`,(error,resl)=>{
                                                            if(error){
                                                                console.log(error.message);
                                                            }else{
                                                                client.query(`select * from staff where id=$1`,[req.session.idStaff],(e,r)=>{
                                                                    if(e){
                                                                        console.log(e.message);
                                                                    }else{
                                                                        let temp = result.rows.slice((req.query.page-1)*number_of_element,(req.query.page-1)*(number_of_element)+number_of_element);
                                                                        res.render("backoffice/book",{value:req.query,
                                                                                                      books:temp,
                                                                                                      geners:resl.rows,
                                                                                                       user:r.rows[0],
                                                                                                       permitions: resultP.rows,
                                                                                                       curent: 'books',
                                                                                                       pages:{current:req.query.page,
                                                                                                              maxPage:Math.floor(result.rows.length/number_of_element)}
                                                                                                            });
                                                                    }
                                                                })
                                                                
                                                            }
                                                        });
                                                        
                                                    }
                                                });
                                        
                                                                  
                                                }
                                            })                  
                        
                                    }else{
                                        res.send('no access');    
                                    }
                                }
                            })
        
     }else{
         res.send('error');
     }
        
    });
    app.get("/add-book",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select bool_or(permitions_for_role.id_permition = 1) as check
                                from staff 
                                    inner join roles_of_staff
                                        on roles_of_staff.id_staff = staff.id
                                    inner join roles 
                                        on roles_of_staff.id_role = roles.id
                                    inner join permitions_for_role 
                                        on roles.id=permitions_for_role.id_role 
                                    where staff.id = $1;`,[req.session.idStaff],(errorC,resultC)=>{
                                                    if(errorC){
                                                        console.log(errorC.message);
                                                    }else{
                                                        client.query(`select permitions_for_role.id_permition as id
                                                                                from staff 
                                                                                    inner join roles_of_staff
                                                                                        on roles_of_staff.id_staff = staff.id
                                                                                    inner join roles 
                                                                                        on roles_of_staff.id_role = roles.id
                                                                                    inner join permitions_for_role 
                                                                                        on roles.id=permitions_for_role.id_role 
                                                                                    where staff.id = $1;`,[req.session.idStaff],(errorP,resultP)=>{
                                                                if(errorP){
                                                                    consosole.log(errorP.message);
                                                                }else{
                                                                    console.log(resultC.rows);
                                                                    if(resultC.rows[0].check){
                                                                        client.query("select * from geners order by id DESC",(err,result)=>{
                                                                            if(err){
                                                                                console.log(err);
                                                                            }else{
                                                                              client.query(`select * from staff where id = $1`,[req.session.idStaff],(e,r)=>{
                                                                                  if(e){
                                                                                      console.log(e.message);
                                                                                  }else{
                                                                                    res.render("client/newbook",{geners:result.rows,user:r.rows[0],permitions: resultP.rows});
                                                                                  }
                                                                              });  
                                                                                
                                                                            }
                                                                        });                                                
                                                                        
                                                                    }else{
                                                                        res.send('no access');    
                                                                    }            
                                                                }
                                                            });
                                                        
                                                    }
                                                })
            
        }else{
            res.send('error');
        }
        
        
    });
    app.post("/add-book1",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select bool_or(permitions_for_role.id_permition = 1) as check
                                from staff 
                                    inner join roles_of_staff
                                        on roles_of_staff.id_staff = staff.id
                                    inner join roles 
                                        on roles_of_staff.id_role = roles.id
                                    inner join permitions_for_role 
                                        on roles.id=permitions_for_role.id_role 
                                    where staff.id = $1;`,[req.session.idStaff],(errorC,resultC)=>{
                                                    if(errorC){
                                                        console.log(errorC.message);
                                                    }else{
                                                        console.log(resultC.rows);
                                                        if(resultC.rows[0].check){
                                                            upload(req,res,(err) =>{
                                                                if(err){
                                                                    console.log(err);
                                                                }else{
                                                                    let query = `insert into books(isbn,name,autor,cover,price,amount,id_gener,description,discount,id_currency) 
                                                                                    values (cast($1 as text),cast($2 as text),cast($3 as text) ,cast($4 as text),$5,$6,$7,cast($8 as text),$9,1)`;
                                                                    client.query(query,[
                                                                        req.body.isbn,
                                                                        req.body.name,
                                                                        req.body.autor,
                                                                        '../images-books/'+req.file.filename,
                                                                        Math.round(req.body.price*100),
                                                                        req.body.amount,
                                                                        req.body.gener,
                                                                        req.body.description,
                                                                        Math.round(req.body.discount*100)],(err,result)=>{
                                                                if(err){
                                                                    console.log(err.message);
                                                                }else{
                                                                    res.send("done");
                                                                }
                                                            })
                                                                }
                                                            });            
    
                                                        }else{
                                                            res.send('no access');    
                                                        }
                                                    }
                                                })
        }else{
            res.send('error');
        }
        
       
    });
    app.get("/update-book/:id",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select bool_or(permitions_for_role.id_permition = 3) as check
                                from staff 
                                    inner join roles_of_staff
                                        on roles_of_staff.id_staff = staff.id
                                    inner join roles 
                                        on roles_of_staff.id_role = roles.id
                                    inner join permitions_for_role 
                                        on roles.id=permitions_for_role.id_role 
                                    where staff.id = $1;`,[req.session.idStaff],(errorC,resultC)=>{
                                                    if(errorC){
                                                        console.log(errorC.message);
                                                    }else{
                                                        console.log(resultC.rows);
                                                        if(resultC.rows[0].check){
                                                            client.query(`select permitions_for_role.id_permition as id
                                                                                from staff 
                                                                                    inner join roles_of_staff
                                                                                        on roles_of_staff.id_staff = staff.id
                                                                                    inner join roles 
                                                                                        on roles_of_staff.id_role = roles.id
                                                                                    inner join permitions_for_role 
                                                                                        on roles.id=permitions_for_role.id_role 
                                                                                            where staff.id = $1;`,[req.session.idStaff],(errorP,resultP)=>{
                                                                            if(errorP){
                                                                                console.log(errorP.message);
                                                                            }else{
                                                                                client.query(`select books.isbn as isbn, 
                                                                                books.name, 
                                                                                books.cover as cover ,
                                                                                books.autor as autor, 
                                                                                books.amount,
                                                                                books.id, 
                                                                                round((books.price)/cast(currency.devision as decimal),2) as price,
                                                                                round((books.discount)/cast(currency.devision as decimal),2)as discount, 
                                                                                books.amount as amount, 
                                                                                geners.name as gener 
                                                                                   from books 
                                                                                    inner join geners 
                                                                                       on books.id_gener=geners.id 
                                                                                    inner join currency
                                                                                       on books.id_currency = currency.id 
                                                                                         where books.id=$1`,[req.params.id],(error,resl)=>{
                                                           if(error){
                                                               console.log(error.message);
                                                           }else{
                                                               client.query("select * from geners",(err,result)=>{
                                                                   if(err){
                                                                       console.log(err);
                                                                   }else{
                                                                       client.query(`select * from staff where id=$1`,[req.session.idStaff],(e,r)=>{
                                                                           if(e){
                                                                               console.log(e.message);
                                                                           }else{
                                                                               res.render("backoffice/update-book",{geners:result.rows,
                                                                                                                    permitions: resultP.rows,    
                                                                                                                    book:resl.rows[0],
                                                                                                                    user:r.rows[0]});
                                                                           }   
                                                                       })
                                                                       
                                                                   }
                                                               });
                                                           }   
                                                      });                       
                                                                            }
                                                                        });
                                                                                     
                                                        }else{
                                                            res.send('no access');    
                                                        }
                                                    }
                                                })
            
        }else{
            res.send('error');
        }
       
        
    });
    app.post("/update-book",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select bool_or(permitions_for_role.id_permition = 3) as check
                            from staff 
                                inner join roles_of_staff
                                    on roles_of_staff.id_staff = staff.id
                                inner join roles 
                                    on roles_of_staff.id_role = roles.id
                                inner join permitions_for_role 
                                    on roles.id=permitions_for_role.id_role 
                                where staff.id = $1;`,[req.session.idStaff],(errorC,resultC)=>{
                                                    if(errorC){
                                                        console.log(errorC.message);
                                                    }else{
                                                        console.log(resultC.rows);
                                                        if(resultC.rows[0].check){
                                                                    
                                                            upload(req,res,(err) =>{
                                                                if(err){
                                                                    console.log(err);
                                                                }else{
                                                                    console.log(req.body);
                                                                    if(!req.file){
                                                                        req.body.discount= Math.floor(req.body.discount*100);
                                                                        req.body.price = Math.floor(req.body.price*100); 
                                                                        client.query(`update books set id_gener=$1, 
                                                                        description=cast($2 as text),
                                                                        name=cast($3 as text), 
                                                                        autor=cast($4 as text), 
                                                                        price=$5,
                                                                        amount=$6,
                                                                        cover=$7,
                                                                        discount = cast($9 as bigint)  
                                                                            where id=$8`,[req.body.gener,
                                                                                                              req.body.description,
                                                                                                              req.body.name,
                                                                                                              req.body.autor,
                                                                                                              req.body.price,
                                                                                                              req.body.amount,
                                                                                                              req.body.link,
                                                                                                              req.body.id,
                                                                                                              req.body.discount],(error,result)=>{
                                                                                if(error){
                                                                                    console.log(error.message);
                                                                                }else{
                                                                                    res.send('updated');
                                                                                }
                                                        
                                                                        });            
                                                                    }else{
                                                                        client.query('select * from books where id=$1',[req.body.id],(er,re)=>{
                                                                            if(er){
                                                                                console.log(er.message);
                                                                            }else{
                                                                                fs.unlink('./public'+re.rows[0].cover.substring(2), (e)=>{
                                                                                    if(e){
                                                                                        console.log(e.message);
                                                                                    }else{
                                                                                        client.query(`update books set id_gener=$1, 
                                                                                        description=cast($2 as text),
                                                                                        name=cast($3 as text), 
                                                                                        autor=cast($4 as text), 
                                                                                        price=$5,
                                                                                        amount=$6,
                                                                                        cover=$7  
                                                                                       where id=cast($8 as text)`,[req.body.gener,
                                                                                               req.body.description,
                                                                                               req.body.name,
                                                                                               req.body.autor,
                                                                                               req.body.price,
                                                                                               req.body.amount,
                                                                                               '../images-books/'+req.file.filename,
                                                                                               req.body.id],(error,result)=>{
                                                                                                     if(error){
                                                                                                            console.log(error.message);
                                                                                                        }else{
                                                                                                            res.send('updated');
                                                                                                        }
                                                                
                                                                                                    });
                                                                
                                                                                    }
                                                                                });        
                                                                            }
                                                                        });
                                                                        
                                                                        }
                                                                }}); 
                                                            
                                                            
                                                        }else{
                                                            res.send('no access');    
                                                        }
                                                    }
                                                })
        }else{
            res.send('error');
        }
        
         
     });
     app.post("/delete-book/:id",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select bool_or(permitions_for_role.id_permition = 4) as check
                                from staff 
                                    inner join roles_of_staff
                                        on roles_of_staff.id_staff = staff.id
                                    inner join roles 
                                        on roles_of_staff.id_role = roles.id
                                    inner join permitions_for_role 
                                        on roles.id=permitions_for_role.id_role 
                                    where staff.id = $1;`,[req.session.idStaff],(errorC,resultC)=>{
                                                    if(errorC){
                                                        console.log(errorC.message);
                                                    }else{
                                                        console.log(resultC.rows);
                                                        if(resultC.rows[0].check){
                                                                
                                                            client.query(`delete from books where id=$1`,[req.params.id],(err,result)=>{
                                                                if(err){
                                                                    console.log(err.message);
                                                                    res.send("error");
                                                                }else{
                                                                    res.send("deleted");
                                                                }
                                                            });
                                                            
                                                        }else{
                                                            res.send('no access');    
                                                        }
                                                    }
                                                })
        }else{
            res.send('error');
        }
         
     });
}
