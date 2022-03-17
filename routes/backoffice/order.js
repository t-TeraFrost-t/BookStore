module.exports = function(app,client){
    let number_of_element = 50;
    app.get("/backoffice-orders",(req,res)=>{
    
        if(req.session.idStaff){
         client.query(`select bool_or(permitions_for_role.id_permition = 10) as check
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
                                     
                                     client.query(`select permitions_for_role.id_permition  as id
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
                                                                                 let query =`select orders.id as id ,
                                                                                                    users.username as name_of_user, 
                                                                                                    round(orders.price/cast(currency.devision as decimal),2) as price, 
                                                                                                    status_of_order.name as status, 
                                                                                                    orders.creation_date as time_of_creation, 
                                                                                                    currency.name as currency
                                                                                                         from orders 
                                                                                                             inner join users 
                                                                                                                 on users.id=orders.id_user
                                                                                                             inner join status_of_order 
                                                                                                                 on status_of_order.id=orders.id_status
                                                                                                             inner join currency
                                                                                                                 on currency.id = orders.id_currency
                                                                                                                     where true`;
                                                                                 let params = [];
                                                                                 if(req.query.dateFrom){
                                                                                     params.push(req.query.dateFrom);
                                                                                     query+= ` and orders.creation_date >= $${params.length}::timestamp with time zone at time zone '+03'`
                                                                                 }
                                                                                 if(req.query.dateTo){
                                                                                     params.push(req.query.dateTo);
                                                                                     query+= ` and orders.creation_date <= $${params.length}::timestamp with time zone at time zone '+03'`
                                                                                 }
                                                                                 if(req.query.name){
                                                                                     params.push(req.query.name);
                                                                                     query += ` and users.username =$${params.length} `;        
                                                                                 }
                                                                                 if(req.query.priceUpper){
                                                                                     params.push(req.query.priceUpper);
                                                                                     query+= ` and price <= $${params.length}*100 `
                                                                                 }
                                                                                 if(req.query.priceLower){
                                                                                     params.push(req.query.priceLower);
                                                                                     query+= ` and price >= $${params.length}*100 `
                                                                                 }
                                                                                 if(req.query.status && req.query.status!=0 ){
                                                                                     params.push(req.query.status);
                                                                                     query+= ` and orders.id_status=$${params.length}`
                                                                                 }
                                                                                 if(!req.query.page)req.query.page=1;
                                                                                 params.push(req.query.page);
                                                                                 query+=` order by creation_date asc, id desc `
                                                                                 query += `offset $${params.length} rows
                                                                                             FETCH FIRST ${number_of_element} ROW ONLY `
                                                                                 console.log(query);
                                                                                 client.query(query,params,(error,result)=>{
                                                                                     if(error){
                                                                                         console.log(error.message);
                                                                                     }else{
                                                                                         client.query(`select * from status_of_order`,(err,resl)=>{
                                                                                             if(err){
                                                                                                 console.log(err.message);
                                                                                             }else{
                                                                                              client.query(`select * from staff where id = $1`,[req.session.idStaff],(e,r)=>{
                                                                                                  if(e){
                                                                                                      console.log(e.message);
                                                                                                  }else{
                                                                                                     client.query(`select count(*)/${number_of_element} as count from orders`,(errNum,resNum)=>{
                                                                                                         if(errNum){
                                                                                                             console.log(errNum.message);
                                                                                                         }else{
                                                                                                             res.render('backoffice/orders',{
                                                                                                                 orders:result.rows,
                                                                                                                 user:r.rows[0],
                                                                                                                 statuses: resl.rows,
                                                                                                                 value: req.query,
                                                                                                                 permitions: resultP.rows,
                                                                                                                 pages:{
                                                                                                                     current:req.query.page, 
                                                                                                                     maxPage:resNum.rows[0].count
                                                                                                             }});
                                                                                                         }
                                                                                                     })
                                                                                                     
                                                                                                             
                                                                                                  }
                                                                                              });   
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
            res.send("error");
        }
         
     });
     app.get('/add-order',(req,res)=>{
         
         if(req.session.idStaff){
             client.query(`select bool_or(permitions_for_role.id_permition = 13) as check
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
                                                             
                                                             client.query(`select permitions_for_role.id_permition  as id
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
                                                                                                 client.query(`select * from staff where id=$1`,[req.session.idStaff],(err,relt)=>{
                                                                                                     if(err){
                                                                                                         console.log(err.message)
                                                                                                     }else{
                                                                                                         client.query(`select * from status_of_order`,(er,re)=>{
                                                                                                             if(er){
                                                                                                                 console.log(er);
                                                                                                             }else{
                                                                                                                if(relt.rows[0]){
                                                                                                                    res.render('backoffice/add-order',{user:relt.rows[0],permitions:resultP.rows,statuses:re.rows});    
                                                                                                                 }else{
                                                                                                                     res.send('error');
                                                                                                                 } 
                                                                                                             }
                                                                                                         })
                                                                                                         
                                                                                                     }   
                                                                                                    })
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
     app.post('/add-order',(req,res)=>{
         console.log(req.body.user);
         if(req.session.idStaff){
             client.query(`select bool_or(permitions_for_role.id_permition = 13) as check
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
             
                                                             client.query(`select * from users where username=$1`,[req.body.user],(e,r)=>{
                                                                 if(e){
                                                                     console.log(e.message);
                                                                 }else{
                                                                     if(r.rows[0]){
                                                                         client.query(`insert into orders(id_user,id_status,creation_date,price,id_currency) 
                                                                                          values ($1,1,$2,0,1)`,[r.rows[0].id,req.body.date],(err,result)=>{
                                                                                             if(err){
                                                                                                 console.log(err.message);
                                                                                             }else{
                                                                                                 client.query(`select * from orders order by id desc`,(error,resl)=>{
                                                                                                     if(error){
                                                                                                         console.log(error.message);
                                                                                                     }else{
                                                                                                         let queryI = `insert into books_in_order(id_book,id_order,number_of_books,current_price,id_currency) values `;
                                                                                                         let params = [resl.rows[0].id];
                                                                                                         let sum = 0;
                                                                                                         let len = Array.isArray(req.body['isbns[]']) ? req.body['isbns[]'].length : 1;
                                                                                                         for(let i=0;i<len;i++){
                                                                                                             sum += Math.round((req.body['prices[]'][i]*100)*req.body['amounts[]'][i]);
                                                                                                             params.push(req.body['isbns[]'][i],req.body['amounts[]'][i],Math.round(req.body['prices[]'][i]*100));
                                                                                                             queryI+= `($${params.length-2},$1,$${params.length-1},$${params.length},1), `;
                                                                                                         }
                                                                                                         console.log(queryI.slice(0,-2)+';');
                                                                                                         console.log(params);
                                                                                                         client.query(queryI.slice(0,-2)+';',params,(ero,resu)=>{
                                                                                                             if(ero){
                                                                                                                 console.log(ero.message);
                                                                                                             }else{
                                                                                                                 console.log(resu);
                                                                                                                 client.query(`update orders 
                                                                                                                                 set price = $1
                                                                                                                                     where id = $2`,[sum,resl.rows[0].id],(error,results)=>{
                                                                                                                                 if(error){
                                                                                                                                     console.log(error.message);
                                                                                                                                 }else{
                                                                                                                                   if(req.body.status != 7){
                                                                                                                                     client.query(`update books
                                                                                                                                                     set amount = amount-sub.number_of_books
                                                                                                                                                         from (select * from books_in_order where id_order = $1) as sub
                                                                                                                                                         where isbn = sub.id_book`,[resl.rows[0].id],(erro,reslti)=>{
                                                                                                                                                     if(erro){
                                                                                                                                                         console.log(erro.message);
                                                                                                                                                     }else{
                                                                                                                                                         res.send('added');
                                                                                                                                                     }
                                                                                                                                         })
                                                                                                                                      }else{
                                                                                                                                         res.send('added');
                                                                                                                                     }  
                                                 
                                                                                                                                   }
                                                                                                                                                                                                                 })
                                                                                                             }
                                                                                                         })
                                                                                                     }
                                                                                                 });
                                                                                                 
                                                                                              }
                                                                                     });                 
                                                                     }else{
                                                                         res.send('no such user');
                                                                     }
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
     })
     app.get("/backoffice-view-order/:id",(req,res)=>{
         
         if(req.session.idStaff){
             
             client.query(`select bool_or(permitions_for_role.id_permition = 10) as check
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
                                                             
                                                             client.query(`select permitions_for_role.id_permition  as id
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
                                                                             client.query(`select * from staff where $1=id`,[req.session.idStaff],(e,r)=>{
                                                                                 if(e){
                                                                                     console.log(e.message);
                                                                                 }else{
                                                                                     client.query(`select books.name as name, 
                                                                                                          books.autor as autor, 
                                                                                                          books.isbn as isbn, 
                                                                                                          round(books_in_order.current_price/cast(currency.devision as decimal),2) as price, 
                                                                                                          books_in_order.number_of_books as amount,
                                                                                                          currency.name as currency 
                                                                                                           from books_in_order 
                                                                                                             inner join books 
                                                                                                             on books_in_order.id_book=books.isbn
                                                                                                                 inner join currency
                                                                                                                     on currency.id = books_in_order.id_currency
                                                                                                                         where id_order=$1`,[req.params.id],(error,result)=>{
                                                                             if(error){
                                                                                 console.log(error.message);
                                                                             }else{
                                                                                 client.query(`select round(orders.price/cast(currency.devision as decimal),2) as sum,
                                                                                                      currency.name as currency,
                                                                                                      orders.id as id
                                                                                                       from orders 
                                                                                                         inner join currency 
                                                                                                          on currency.id = orders.id_currency
                                                                                                             where orders.id = $1 `,[req.params.id],(err,relt)=>{
                                                                                                         if(err){
                                                                                                             console.log(err.message);
                                                                                                         }else{
                                                                                                             console.log(relt.rows);
                                                                                                             res.render("backoffice/books_in_order",{books:result.rows,permitions:resultP.rows,user: r.rows[0] ,sum:relt.rows[0] })
                                                                                                         }
                                                                                        });
                                                                     }
                                                                     })
         
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
             console.log('error');
         }
         
     });
     app.post('/backoffice/insert-book/:id/:isbn',(req,res)=>{
        if(req.session.idStaff){
          client.query(`select bool_or(permitions_for_role.id_permition = 11) as check
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
                                                              
                                                              client.query(`select * from books where isbn = cast($1 as text)`,[req.params.isbn],(e,r)=>{
                                                                  if(e){
                                                                      console.log(e.message);
                                                                      
                                                                  }else{
                                                                      if(r.rows[0]){
                                                                        client.query(`select * from books_in_order where id_order = $1 and id_book = cast($2 as text) `,[req.params.id,req.params.isbn],(err,result)=>{
                                                                            if(err){
                                                                                console.log(req.params.id);
                                                                                console.log(err.message);
                                                                                
                                                                            }else{
                                                                                if(result.rows[0]){
                                                                                    client.query(`update books_in_order 
                                                                                                    set number_of_books= number_of_books+1 
                                                                                                      where id_order=$1 and id_book= cast($2 as text)`,[req.params.id,req.params.isbn],(er,re)=>{
                                                                                                          if(er){
                                                                                                              console.log(er.message)
                                                                                                          }else{
                                                                                                            client.query(`update orders 
                                                                                                            set price = price + $1
                                                                                                             where id = $2`,[r.rows[0].price,req.params.id],(error,results)=>{
                                                                                                                 if(error){
                                                                                                                     console.log(error.message);
                                                                                                                 }else{
                                                                                                                     client.query(`update books
                                                                                                                                    set amount = amount-1
                                                                                                                                     where isbn= cast($1 as text)`,[req.params.isbn],(erro,reslti)=>{
                                                                                                                                         if(erro){
                                                                                                                                             console.log(erro.message);
                                                                                                                                         }else{
                                                                                                                                             res.send('added');
                                                                                                                                         }
                                                                                                                                     })
                                                                                                                 }
                                                                                                             })
                                                                                                          }
                                                                                                      })
                                                                                }else{
                                                                                    client.query(`insert into books_in_order(id_book,id_order,number_of_books,current_price,id_currency) 
                                                                                                                values (cast($1 as text),$2,1,$3,1)`,[req.params.isbn,req.params.id,r.rows[0].price],(er,re)=>{
                                                                                                                    if(er){
                                                                                                                        console.log(er.message);
                                                                                                                    }else{
                                                                                                                        client.query(`update orders 
                                                                                                                                        set price = price + $1
                                                                                                                                         where id = $2`,[r.rows[0].price,req.params.id],(error,results)=>{
                                                                                                                                             if(error){
                                                                                                                                                 console.log(error.message);
                                                                                                                                             }else{
                                                                                                                                                 client.query(`update books
                                                                                                                                                                set amount = amount-1
                                                                                                                                                                 where isbn=cast($1 as text)`,[req.params.isbn],(erro,reslti)=>{
                                                                                                                                                                     if(erro){
                                                                                                                                                                         console.log(erro.message);
                                                                                                                                                                     }else{
                                                                                                                                                                         res.send('added');
                                                                                                                                                                     }
                                                                                                                                                                 })
                                                                                                                                             }
                                                                                                                                         })
                                                                                                                    }
                                                                                                                });
                                                                                }
                                                                            }
                                                                        })
                                                                      }else{
                                                                          res.send('book with this isbn does not exist');
                                                                      }
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
      app.get('/cancel-order/:id',(req,res)=>{
        if(req.session.idUser){
            client.query(`select orders.id_status<=3 as check from orders where orders.id=$1`,[req.params.id],(error,result)=>{
                if(error){
                    console.log(error.message);
                }else{
                    if(result.rows[0].check){
                        client.query(`update orders set id_status=6 where orders.id=$1`,[req.params.id],(e,r)=>{
                            if(e){
                                console.log(e.message);
                            }else{
                                client.query(`update books set amount=amount+subquery.number_of_books 
                                                FROM (select * 
                                                            from books_in_order 
                                                                where id_order=$1) as subquery  
                                                    where books.isbn=subquery.id_book`,[req.params.id],(err,reslt)=>{
                               if(err){
                                   console.log(err.message);
                               }else{
                                res.send('canceled');
                               }
                           });
                            }
                        });
                       
                        
                    }else{
                        res.send('cant')
                    }
                    
                }
            });
        }else{
            res.send('error');
        }
    });
    app.post('/update-oder/:id/:isbn/:price/:amount',(req,res)=>{
        req.params.price*=100;
      client.query(`select * from books_in_order where id_order = $1 and id_book = cast($2 as text)`,[req.params.id,req.params.isbn],(e,r)=>{
          if(e){
              console.log(e.message);
          }else{
            console.log(r.rows[0]);
                  if(r.rows[0]){
                      let sql = `update books_in_order
                      set current_price = $1, number_of_books = $2 
                         where id_order = $3 and id_book = cast($4 as text)`;
                         let params = [req.params.price,req.params.amount,req.params.id,req.params.isbn];
                         console.log(sql);
                         console.log(params);
                    client.query(sql,params,(err,result)=>{
                               if(err){
                                   console.log(err.message);
                               }else{
                                client.query('delete from books_in_order where number_of_books=0',(erU,reU)=>{
                                    if(erU){
                                        console.log(erU.message);
                                    }else{
                                        client.query(`select sum(books_in_order.current_price*books_in_order.number_of_books)
                                        from books_in_order 
                                            inner join books 
                                             on books_in_order.id_book=books.isbn
                                                where id_order=$1`,[req.params.id],(er,relt)=>{
                                                    if(err){
                                                        console.log(err.message);
                                                    }else{
                                                        client.query(`update orders set price = cast($1 as float) where id=$2`,[relt.rows[0].sum,req.params.id],(erF,reF)=>{
                                                            if(erF){
                                                                console.log(erF.message);
                                                            }else{
                                                                res.send('updated');
                                                            }
                                                        });
                                                    }
                                                });
                                    }
                                })
                               
                                
                               }
                           })    
                }else{
                    res.send('no such book in order');
                }
          }
      })
        
    });
    app.post('/update-oder/:id/:status',(req,res)=>{
        let query = `update orders set id_status=$1 where id=$2`;
        console.log(query);
        client.query(query,[req.params.status,req.params.id],(error,result)=>{
            if(error){
                console.log(error.message);
            }else{
                console.log(req.params.status);
                if(req.params.status==6){
                    client.query(`update books set amount=amount+subquery.number_of_books 
                                                FROM (select * 
                                                            from books_in_order 
                                                                where id_order=$1) as subquery  
                                                    where books.isbn=subquery.id_book`,[req.params.id],(err,reslt)=>{
                               if(err){
                                   console.log(err.message);
                               }else{
                                res.send('canceled');
                               }
                           });
                }else{
                    res.send('done');
                }
                
            }
        });
    });
           
}