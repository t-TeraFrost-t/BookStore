const { render } = require('ejs');
const express = require('express');
const {Client} = require('pg');
const session = require('express-session');
const bodyParser = require('body-parser');
const request = require('request');
const paypal = require('paypal-rest-sdk');
var nodemailer = require('nodemailer'); 
const multer = require('multer');
const path = require('path');
var fs = require('fs');

const client = new Client({
    user: 'mincho',
    host: 'localhost',
    database: 'testbookstore',
    password: 'PALEsedem1@'
  });
const storage = multer.diskStorage({
    destination : function(req, file, callback){
        callback(null, './public/images-books'); // set the destination
    },
    filename : (req, file, cb)=>{
        cb(null,file.originalname);
    }
});
const upload = multer({
    storage:storage
}).single('cover');
paypal.configure({
    mode:'sandbox',
    client_id: 'AfTNzbMlmpqCzFxlPepARk1Li79atWwV9Qistl71utUfqpPze2zGMrTl2WNqMUjlGVgnBNyDbSdwX2vm',
    client_secret: 'EOWAVb72nB2qJgkzXuEKPIY68mw4IV8LbMEzL--NGludvtu3vw13PQVO2vPIYX0-U3ckxXz20PpoosUs'
});
 
let currency = 'USD';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'angelsedmakov@gmail.com',
	  pass: 'PALEsedem'
	}
  });
  client.connect();
    const app = express();
	app.use(express.static('public'));
    app.set('view engine', 'ejs');

    app.use(
        bodyParser.urlencoded({
            extended: false
        })
    );
    app.use(session({
        secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
        saveUninitialized:true,
        cookie: { maxAge: 3600000 },
        resave: false
    }));
app.get("/pay/:id",(req,res)=>{
    if(req.session.idUser){
        client.query(`select books.name as name, 
                             books.price as price, 
                             books_in_order.id_book as isbn, 
                             books_in_order.number_of_books
                              from books_in_order inner join books on books.isbn=books_in_order.id_book 
                               where id_order=$1`,[req.params.id],(err,result)=>{
                                 if(err){
                                     console.log(err.message);
                                 }else{
                                    client.query(`select * from orders where id=$1`,[req.params.id],(e,r)=>{
                                        if(e){
                                            console.log(e.message);
                                        }else{
                                            let item = [];
                                            req.session.order=r.rows[0];
                                            result.rows.forEach((row)=>{
                                                item.push({
                                                    name: row.name,
                                                    sku: row.isbn,
                                                    currency: currency,
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
                                                            currency: currency,
                                                            total: r.rows[0].price
                                                    }
                                                }],
                                               
                                        
                                        
                                            };
                                            paypal.payment.create(create_paypemnt_json,(error,payment)=>{
                                                if(error){
                                                    console.log(error.response.details[0]);
                                                }else{
                                                    payment.links.forEach((link)=>{
                                                        if(link.rel === 'approval_url'){
                                                            
                                                            res.redirect(link.href);
                                                        }
                                                    });
                                                    //res.send('error');
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
app.get("/succes",(req,res)=>{
    const execute_paiment_json = {
        payer_id: req.query.PayerID,
        transactions: [{
            amount: {
                currency: currency,
                total: req.session.order.price
            }
        }]
    }
    paypal.payment.execute(req.query.paymentId,execute_paiment_json,(error,payment)=>{
        if(error){
            console.log(error.response.details[0]);
        }else{
            client.query(`update orders set id_status=2 where id=$1`,[req.session.order.id],(er,re)=>{
                if(er){
                    console.log(er.message);
                }else{
                    res.redirect('/orders');
                }
            } );
            
        }
    });
});
app.get('/cancel',(req,res)=>{
    client.query(`update orders set id_status=7 where id=$1`,[req.session.order.id],(er,re)=>{
        if(er){
            console.log(er.message);
        }else{
            res.redirect('/orders');
        }
    } );
});
app.get("/backoffice-books",(req,res)=>{
    let number_of_element = 50;
 if(req.session.idStaff){
    let query = `select books.isbn as isbn,
                        books.name, 
                        books.autor as autor, 
                        books.amount, 
                        books.price as price, 
                        books.amount as amount, 
                        geners.name as gener 
                            from books 
                                inner join geners 
                                 on books.id_gener=geners.id 
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
                                                           curent: 'books',
                                                           currency:currency,
                                                           pages:{current:req.query.page,
                                                                  maxPage:Math.floor(result.rows.length/number_of_element)}
                                                                });
                        }
                    })
                    
                }
            });
            
        }
    });
 }else{
     res.send('error');
 }
    
});
app.get("/add-book",(req,res)=>{
    if(req.session.idStaff){
        client.query("select * from geners order by id DESC",(err,result)=>{
            if(err){
                console.log(err);
            }else{
              client.query(`select * from staff where id = $1`,[req.session.idStaff],(e,r)=>{
                  if(e){
                      console.log(e.message);
                  }else{
                    res.render("client/newbook",{geners:result.rows,user:r.rows[0]});
                  }
              });  
                
            }
        });
    }else{
        res.send('error');
    }
    
    
});
app.post("/add-book1",(req,res)=>{
    console.log(req.body);
    upload(req,res,(err) =>{
        if(err){
            console.log(err);
        }else{
            let query = `insert into books(isbn,name,autor,cover,price,amount,id_gener,description) 
            values (cast($1 as text),cast($2 as text),cast($3 as text) ,cast($4 as text),$5,$6,$7,cast($8 as text))`;
            client.query(query,[req.body.isbn,
                req.body.name,
                req.body.autor,
                '../images-books/'+req.file.filename,
                req.body.price,
                req.body.amount,
                req.body.gener,
                req.body.description],(err,result)=>{
        if(err){
            console.log(err.message);
        }else{
            res.send("done");
        }
    })
        }
    });
   
});
app.get("/update-book/:isbn",(req,res)=>{
    if(req.session.idStaff){
        client.query(`select books.isbn as isbn, 
                             books.name, 
                             books.cover as cover ,
                             books.autor as autor, 
                             books.amount, 
                             books.price as price, 
                             books.amount as amount, 
                             geners.name as gener 
                                from books 
                                 inner join geners 
                                    on books.id_gener=geners.id 
                                      where isbn=$1`,[req.params.isbn],(error,resl)=>{
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
                                                                 book:resl.rows[0],
                                                                 user:r.rows[0]});
                        }   
                    })
                    
                }
            });
        }   
   });
    }else{
        res.send('error');
    }
   
    
});
app.post("/update-book",(req,res)=>{
    upload(req,res,(err) =>{
        if(err){
            console.log(err);
        }else{
            console.log(req.body);
            if(!req.file){
                
                client.query(`update books set id_gener=$1, 
                description=cast($2 as text),
                name=cast($3 as text), 
                autor=cast($4 as text), 
                price=$5,
                amount=$6,
                cover=$7  
                    where isbn=cast($8 as text)`,[req.body.gener,
                                                      req.body.description,
                                                      req.body.name,
                                                      req.body.autor,
                                                      req.body.price,
                                                      req.body.amount,
                                                      req.body.link,
                                                      req.body.isbn],(error,result)=>{
                        if(error){
                            console.log(error.message);
                        }else{
                            res.send('updated');
                        }

                });            
            }else{
                client.query('select * from books where isbn=$1',[req.body.isbn],(er,re)=>{
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
                               where isbn=cast($8 as text)`,[req.body.gener,
                                       req.body.description,
                                       req.body.name,
                                       req.body.autor,
                                       req.body.price,
                                       req.body.amount,
                                       '../images-books/'+req.file.filename,
                                       req.body.isbn],(error,result)=>{
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
    
     
 });
 app.post("/delete-book/:isbn",(req,res)=>{
     client.query(`delete from books where isbn=$1`,[req.params.isbn],(err,result)=>{
         if(err){
             console.log(err.message);
             res.send("error");
         }else{
             res.send("deleted");
         }
     });
 });
app.get("/book/:isbn",(req,res)=>{
    
    client.query(`select books.isbn,
                         books.description,
                         books.amount,
                         books.name, 
                         books.cover,
                         books.autor,
                         books.price, 
                         geners.name as gener 
                            from books inner join geners on books.id_gener=geners.id 
                                where isbn=$1`,[req.params.isbn],(error,ressult)=>{
                                
                                if(error){
            console.log(error.message);
        }else{
            
            //console.log(ressult.rows);
            
                if(req.session.idUser){
                    console.log("hi");
                    client.query(`select username from users where id=$1`,[req.session.idUser],(error,result)=>{
                        if(error){
                            console.log(error.message);
                        }else{
                            console.log(result.rows[0]);
                            res.render('client/book',{book: ressult.rows[0],currency:currency,user:result.rows[0]});        
                        }
                    })
                }else{
                    res.render('client/book',{book: ressult.rows[0],currency:currency});
                }
                
            
            
        }
    });
});
app.get("/books",(req,res)=>{
    let query = "select isbn,name,cover,autor,price,description from books where true";
    let params = []
    if(req.query.name){
        params.push(req.query.name);
        query+= ` and Position( $${params.length}  in name) <> 0`;
    }
    if(req.query.autor){
        params.push(req.query.autor);
        query+= ` and Position( $${params.length}  in autor) <> 0`;
    }
    if(req.query.isbn){
        params.push(req.query.isbn);
        query+= ` and $${params.length}=isbn`;
    }
    if(req.query.lower){
        params.push(req.query.lower);
        query+= ` and $${params.length}<=price`;
    }
    if(req.query.upper){
        params.push(req.query.upper);
        query+= ` and $${params.length}>=price`;
    }
    if(req.query.genere && req.query.genere!=0){
        params.push(req.query.genere);
        query+= ` and $${params.length}=id_gener`
    }
   console.log(req.query.orderby);
   let number_of_element = 50;
   
   if(!req.query.page){
    req.query.page=1;
   }
   //console.log(req.query.page); 
   //params.push('ASC');().toString()
   query+= ` order by price ${req.query.orderby == 1 ? 'ASC': 'DESC'};`
    
    //console.log(query);
    client.query(query,params,(error,ressult)=>{//   
        if(error){
            res.send(error.message);
        }else{
            client.query('select * from geners ',(err,ress)=>{
                if(err){
                    console.log(err.message);
                }else{
                    let temp = ressult.rows.slice((req.query.page-1)*number_of_element,(req.query.page-1)*(number_of_element)+number_of_element);
                       // console.log(temp);
                    if(req.session.idUser){
                        
                        client.query(`select username from users where id=$1`,[req.session.idUser],(error,result)=>{
                            if(error){
                                console.log(error.message);
                            }else{
                               // console.log(result.rows[0]);
                                res.render('client/main',{value:req.query,
                                                          books: temp,
                                                          currency:currency,
                                                          geners: ress.rows, 
                                                          user:result.rows[0],
                                                          curent:'books',
                                                          pages:{
                                                              current:req.query.page, 
                                                              maxPage:Math.floor(ressult.rows.length/number_of_element)
                                                                }
                                                            });        
                            }
                        })
                    }else{
                        console.log()
                        res.render('client/main',{value:req.query,
                                                  currency:currency,
                                                  books: temp, 
                                                  curent:'books',
                                                  geners: ress.rows, 
                                                  pages:{
                                                      current:req.query.page, 
                                                      maxPage:Math.floor(ressult.rows.length/number_of_element)
                                                    }
                                                });
                    }
                    
                }
            });
        }
    });
});

app.get("/backoffice-genere",(req,res)=>{
  if(req.session.idStaff){
    client.query("select * from geners order by id",(err,ress)=>{
        if(err){
            console.log(err.message);
        }else{
            client.query(`select * from staff where $1=id`,[req.session.idStaff],(e,r)=>{
                if(e){
                    console.log(e.message);
                }else{
                    res.render("backoffice/genere",{geners: ress.rows, user:r.rows[0], curent:'gener'});
                }
            })
            
        }
    });
  }else{
      res.send('error');
  }
    
    
});
app.post("/update-gener/:id/:name",(req,res)=>{
    client.query(`update geners set name=$1 where id=$2`,[req.params.name,req.params.id],(error,result)=>{
       if(error){
            console.log(error.message);
       }else{
           res.send('updated');
       }
    });
});
app.post("/delete-gener/:id",(req,res)=>{
    client.query(`delete from geners where id=$1`,[req.params.id],(error,result)=>{
       if(error){
            console.log(error.message);
       }else{
           res.send('deleted');
       }
    });
});
app.get("/backoffice-gener/:id",(req,res)=>{
    if(req.session.idStaff){
        client.query(`select * from geners where id=$1;`,[req.params.id],(error,ressult)=>{
            if(error){
                console.log(error.message);
            }else{
                client.query(`select * from staff where id = $1`,[req.session.idStaff],(e,r)=>{
                    if(e){
                        console.log(e.message);
                    }else{
                        res.render('backoffice/submit-gener',{gener:ressult.rows[0],user:r.rows[0]});
                    }
                });
                

            }
        });
    }else{
        res.send('error');
    }   
    
    
});
app.get("/backoffice-gener",(req,res)=>{
    if(req.session.idStaff){
        client.query(`select * from staff where id = $1`,[req.session.idStaff],(e,r)=>{
            if(e){
                console.log(e.message);
            }else{
                res.render('backoffice/add-gener',{user:r.rows[0]});
            }
        });
        
    }else{
        res.send('error');
    }
           
});
app.post("/add-gener/:name",(req,res)=>{
    client.query(`insert into geners(name) values($1);`,[req.params.name],(error,result)=>{
        if(error){
             console.log(error.message);
        }else{
            res.send('added');
        }
     });
});
app.get("/backoffice-login",(req,res)=>{
    res.render('backoffice/login');
});
app.get('/backoffice',(req,res)=>{
    console.log(req.session.idStaff);
    if(req.session.idStaff){
            client.query(`select * from staff where id=$1`,[req.session.idStaff],(error,result)=>{
            if(error){
                console.log(result);
                //console.log(error.message);
                res.render('plaeselogin');      
            }else{
                console.log(result.rows);
                res.render('backoffice/backoffice',{user:result.rows[0]});
            }
        });    
    }else res.render('/plaeselogin');
});
app.get("/backoffice-login/:name/:password",(req,res)=>{
    client.query(`select * from staff 
                        where 
                        username=$1 
                        and password=MD5(CONCAT(cast($2 as text),salt))`,[req.params.name,req.params.password],(error,result)=>{
        if(error){
            res.send('error');
            console.log(error.message);
        }else{
            if(result.rows[0]){
                req.session.idStaff = result.rows[0].id;
                res.send('/backoffice'); 
            }else{
                res.send('nouser');
            }
        }
    });
});

app.get("/backoffice-staff",(req,res)=>{
   if(req.session.idStaff){
    client.query(`select id,username,email from staff order by id`,(error,result)=>{
        if(error){
            console.log(error.message);
        }else{    
            client.query(`select id,username,email from staff where id=$1;`,[req.session.idStaff],(e,r)=>{
                if(e){
                    console.log(e.message);
                }else{
                    res.render("backoffice/staff",{staff:result.rows,user:r.rows[0],curent:'staff'});
                    //res.render('backoffice/update-staff',{staff:ressult.rows[0]});
        
                }
            });
            
        }
    });
   }else{
       res.send('error');
   }
    
});
app.get("/backoffice-staff/:id",(req,res)=>{
    client.query(`select id,username,email from staff where id=$1;`,[req.params.id],(error,ressult)=>{
        if(error){
            console.log(error.message);
        }else{
            res.render('backoffice/update-staff',{staff:ressult.rows[0]});

        }
    });
});
app.get("/backoffice-staff/:id",(req,res)=>{
    client.query(`select id,username,email from staff where id=$1;`,[req.params.id],(error,ressult)=>{
        if(error){
            console.log(error.message);
        }else{
            res.render('backoffice/update-staff',{staff:ressult.rows[0]});

        }
    });
});
app.post("/update-staff/:id/:name/:email",(req,res)=>{
    client.query(`update staff set username=$1, 
                                    email=$2 
                                        where id=$3`,[req.params.name,req.params.email,req.params.id],(error,result)=>{
       if(error){
            console.log(error.message);
       }else{
           res.send('updated');
       }
    });
});
app.post("/update-staff/:id/:name/:email/:password",(req,res)=>{
    client.query(`update staff set username=$1, 
                                    email=$2, 
                                    password=MD5(CONCAT($3,salt)) 
                                        where id=$4`,[req.params.name,
                                                      req.params.email,
                                                      req.params.password,
                                                      req.params.id],(error,result)=>{
       if(error){
            console.log(error.message);
       }else{
           res.send('updated');
       }
    });
});
app.get("/add-staff",(req,res)=>{
    res.render("backoffice/add-staff");
});
app.post("/add-staff/:name/:email/:password",(req,res)=>{
    let salt = getRandomString(20);
    client.query(`insert into staff(username,email,password,salt) 
                        values ($1,
                                $2,
                                MD5(CONCAT($3,$4)),
                                $4)`,[req.params.name,req.params.email,req.params.password,salt],(error,result)=>{
        if(error){
            console.log(error.message);
        }else{
            res.send('added');
        }
    });
});
app.post("/delete-staff/:id",(req,res)=>{
    client.query(`delete from staff where id=$1`,[req.params.id],(error,result)=>{
        if(error){
            console.log(error.message);
        }else{
            res.send('deleted');
        }
    });
});


app.get("/backoffice-users",(req,res)=>{
    if(req.session.idStaff){
        client.query(`select users.id,username,
                         email,
                         valid from users 
                            inner join validated_users 
                                on users.id=validated_users.id_user
                                    order by id DESC`,(error,result)=>{
            if(error){
                console.log(error.message);
            }else{
                client.query('select * from staff where id=$1',[req.session.idStaff],(e,r)=>{
                    if(e){
                        console.log(e.message);
                    }else{
                        res.render("backoffice/users",{users:result.rows,user:r.rows[0],curent:'users'});
                    }
                });    
                
             }
        });
    }else{
        res.send('error');
    }
    
});
app.get("/backoffice-user/:id",(req,res)=>{
    if(req.session.idStaff){
        client.query(`select users.id,
                             username,
                             email,
                             valid from users 
                                inner join validated_users 
                                    on users.id=validated_users.id_user 
                                        where users.id=$1;`,[req.params.id],(error,ressult)=>{
            if(error){
                console.log(error.message);
            }else{
                client.query('select * from staff where id=$1',[req.session.idStaff],(e,r)=>{
                    if(e){
                        console.log(e.message);
                    }else{
                       // res.render("backoffice/users",{users:result.rows,user:r.rows[0],curent:'users'});
                        res.render('backoffice/update-users',{user:ressult.rows[0],staff:r.rows[0]});
                    }
                });   
                

            }
        });
    }else{
         res.send('error');
    }
});
app.post("/update-user/:id/:name/:email",(req,res)=>{
    client.query(`update users set username=$1, 
                                    email=$2 
                                    where id=$3`,[req.params.name,req.params.email,req.params.id],(error,result)=>{
       if(error){
            console.log(error.message);
       }else{
           res.send('updated');
       }
    });
});
app.post("/update-user/:id/:name/:email/:password",(req,res)=>{
    client.query(`update users set username=$1,
                                   email=$2, 
                                   password=MD5(CONCAT($3,salt))
                                    where id=$4`,[req.params.name,req.params.email,req.params.password,req.params.id],(error,result)=>{
       if(error){
            console.log(error.message);
       }else{
           res.send('updated');
       }
    });
});
app.post("/delete-user/:id",(req,res)=>{
    client.query(`delete from users where id=$1`,[req.params.id],(error,result)=>{
        if(error){
            console.log(error.message);
        }else{
            res.send('deleted');
        }
    });
});

app.get('/login',(req,res)=>{
    res.render('client/login');
});

app.get('/login/:name/:password',(req,res)=>{
    client.query(`select users.id as id from users 
                        inner join validated_users on users.id=validated_users.id_user 
                            where (username=$1 
                                    or email=$2) 
                                    and password=MD5(CONCAT(cast($3 as text),salt)) 
                                    and valid=TRUE`,[req.params.name,req.params.name,req.params.password.toString()],(error,result)=>{
       console.log('li');
        if(error){
            console.log(error.message);
        }else{
            if(result.rows[0]){
                req.session.idUser = result.rows[0].id;
                console.log(req.session.idUser)
                res.send('/books');
            }else{
                console.log('no');
                res.send("error");
            }
        }
    });
});
app.get("/basket",(req,res)=>{
    if(req.session.idUser){
        client.query(`select * from baskets where id_user=$1`,[req.session.idUser],(error,result)=>{
            if(error){
                console.log(error.message);
            }else{
                client.query(`select * from users where id=$1;`,[req.session.idUser],(e,r)=>{
                    if(e){
                        console.log(e.message);
                    }else{
                        if(result.rows[0]){
                            client.query(`select books.name as name,
                                                 books_in_basket.id as id,
                                                 books_in_basket.number_of_books as number_of_books , 
                                                 books.isbn as isbn, 
                                                 books.price as price 
                                                    from books_in_basket 
                                                        inner join books on books_in_basket.id_book=books.isbn
                                                           where books_in_basket.id_basket=$1
                                                              order by books.isbn`,[result.rows[0].id],(err,resl)=>{
                            if(err){
                                console.log(err.message);
                            }else{
                                client.query(`select sum(books_in_basket.number_of_books*books.price) 
                                                from books_in_basket 
                                                    inner join books on books_in_basket.id_book=books.isbn
                                                        where books_in_basket.id_basket=$1`,[result.rows[0].id],(errTotal,reslTotal)=>{
                                                    if(errTotal){
                                                        console.log(errTotal.message);
                                                    }else{
                                                        res.render('client/basket',{books:resl.rows,
                                                                                    currency:currency,
                                                                                    curent:'basket', 
                                                                                    user:r.rows[0], 
                                                                                    total:reslTotal.rows[0].sum});
                                                    }
                                            });
                            }
                           });
                        }else{
                            res.render('client/basket',{books: new Array(),currency:currency,curent:'basket' ,user:r.rows[0]});
                        }
                    }

                });
                
                    
                
                     
            }
        });
    }else{
        res.send("error");
    }
});
app.post("/basket-delete/:id",(req,res)=>{
    if(req.session.idUser){
        client.query(`delete from books_in_basket  
                        where id=$1`,[req.params.id],(err,resl)=>{
                            res.send('deleted');
                        });
    }else {
        res.send("error");
    }
});
app.post("/basket/:id/:count",(req,res)=>{
    if(req.session.idUser){
        client.query(`update books_in_basket 
                       set number_of_books=$1 
                        where id=$2`,[req.params.count,req.params.id],(err,resl)=>{
                            res.send();
                        });
    }else {
        res.send("error");
    }
});
app.post("/basket/:idBook",(req,res)=>{
    if(req.session.idUser){
        client.query(`select * from baskets 
                        where id_user=$1`,[req.session.idUser],(error,result)=>{
            if(error){
                console.log(error.message);
            }else{
                if(!result.rows[0]){
                    let date = new Date()
                    client.query(`insert into baskets(creation_date,id_user) 
                                    values ($1,$2)`,[date.toISOString().replace('T',' ').substring(0,18),req.session.idUser],(err,resl)=>{
                        if(err){
                            console.log(err.message);
                        }else{
                            client.query(`select * from baskets where id_user=$1`,[req.session.idUser],(e,resu)=>{
                                if(e){
                                    console.log(e.message);
                                }else{
                                    client.query(`insert into books_in_basket(id_basket,id_book,number_of_books) 
                                                    values ($1,
                                                        $2,1)`,[resu.rows[0].id,req.params.idBook],(err,resl)=>{
                                        if(err){
                                            console.log(err.message);
                                        }else{
                                            res.send("added");
                                        }
                                        
                                    });
                                }
                            });
                            
                        }
                    });
                    
                }else{
                    client.query(`select * from books_in_basket 
                                        where id_book=$1`,[req.params.idBook],(errorBook,resultBook)=>{
                        if(errorBook){
                            console.log(errorBook.message)
                        }else{
                            if(resultBook.rows[0]){
                                console.log(resultBook);
                                client.query(`update books_in_basket 
                                                set number_of_books=$1 
                                                    where id_book=$2 
                                                          and id_basket=$3`,[resultBook.rows[0].number_of_books+1,
                                                                             req.params.idBook,
                                                                             resultBook.rows[0].id_basket],(err,resl)=>{
                                    if(err){
                                        console.log(err.message);
                                    }else{
                                        res.send("added");
                                    }
                                });
                            }else{
                                console.log(result.rows);
                                client.query(`insert into books_in_basket(id_basket,id_book,number_of_books) 
                                                          values ($1,
                                                                  $2,1)`,[result.rows[0].id,req.params.idBook],(err,resl)=>{
                                    if(err){
                                        console.log(err.message);
                                    }else{
                                        res.send("added");
                                    }
                                    
                                });
                            }
                        }
                    });
                }
                
                
            }
        });
    }else{
        res.send("error");
    }
});
app.get("/orders",(req,res)=>{
    if(req.session.idUser){
        client.query(`select orders.id as id,
                             orders.creation_date, 
                             status_of_order.name, 
                             orders.price 
                              from orders 
                                inner join status_of_order 
                                    on status_of_order.id = orders.id_status 
                                        where id_user=$1
                                            order by id DESC`,[req.session.idUser],(error,result)=>{
            if(error){
                console.log(error.message);
            }else{
                console.log(result.rows[0]);
                client.query(`select * from users where id=${req.session.idUser}`,(e,r)=>{
                    res.render("client/orders",{orders:result.rows,
                                                currency:currency,
                                                curent:'orders',
                                                user:r.rows[0]});
                });
                
            }
        });
    }else{
        res.send("error");
    }
});
app.get("/order",(req,res)=>{
    if(req.session.idUser){
        let date = new Date();
        
        client.query(`select * from baskets where id_user=$1`,[req.session.idUser],(er,basket)=>{
                if(er){
                    console.log(er.message);
                    }else{
                      client.query(`select bool_and((books.amount-books_in_basket.number_of_books)>=0)  
                                            from books 
                                                inner join books_in_basket 
                                                    on books.isbn=books_in_basket.id_book    
                                                        where books_in_basket.id_basket=$1`,[basket.rows[0].id],(errCheck,resultCheck)=>{
                                                    if(errCheck){
                                                        console.log(errCheck.message);
                                                    }else{
                                                        console.log(resultCheck.rows);
                                                        if(resultCheck.rows[0].bool_and){
                                                            client.query(`select sum(books_in_basket.number_of_books * books.price) 
                                                                            from books_in_basket 
                                                                                inner join books 
                                                                                    on books_in_basket.id_book=books.isbn 
                                                                                        where books_in_basket.id_basket=$1;`,[basket.rows[0].id],(errorSum,resultSum)=>{
                                                                    if(errorSum){
                                                                        console.log(errorSum.message);
                                                                    }else{
                                                                        //console.log(resultSum);
                                                                        client.query(`insert into orders(id_user,
                                                                                                         creation_date,
                                                                                                         id_status,
                                                                                                         price) 
                                                                                                            values ($1,
                                                                                                                     $2,
                                                                                                                     1,
                                                                                                                     $3)`,[req.session.idUser,
                                                                                                                           date.toISOString().replace('T',' ').substring(0,18),
                                                                                                                           parseFloat(resultSum.rows[0].sum).toFixed(2)],(error,result)=>{
                                                                                            if(error){
                                                                                                console.log(error.message);
                                                                                            }else{
                                                                                                client.query(`select * from orders 
                                                                                                                where id_user=$1 
                                                                                                                    order by creation_date DESC`,[req.session.idUser],(err,order)=>{
                                                                                                if(err){
                                                                                                    console.log(err.message);
                                                                                                }else{
                                                                          
                                                                                                    client.query(`insert into books_in_order(id_order,id_book,number_of_books,current_price) 
                                                                                                                        select $1,
                                                                                                                                books_in_basket.id_book,
                                                                                                                                books_in_basket.number_of_books,
                                                                                                                                books.price 
                                                                                                                                    from books_in_basket
                                                                                                                                        inner join books
                                                                                                                                         on books.isbn = books_in_basket.id_book  
                                                                                                                                            where id_basket=$2`,[order.rows[0].id,basket.rows[0].id],(e,re)=>{
                                                                                                    if(e){
                                                                                                        console.log(e.message)
                                                                                                    }else{
                                                                                                        client.query(`delete from books_in_basket 
                                                                                                                        where id_basket=$1`,[basket.rows[0].id],(errorD,resD)=>{
                                                                                                        if(errorD){
                                                                                                            console.log(errorD.message);
                                                                                                        }else{
                                                                                                            client.query(`delete from baskets where id=$1`,[basket.rows[0].id],(errD,resD)=>{
                                                                                                                if(errD){
                                                                                                                console.log(errD.message);
                                                                                                                }else{
                                                                                                                    client.query(`update books set amount=amount-subquery.number_of_books 
                                                                                                                                        FROM (select * 
                                                                                                                                                from books_in_order 
                                                                                                                                                    where id_order=$1) as subquery  
                                                                                                                                             where books.isbn=subquery.id_book`,[order.rows[0].id],(errU,resultU)=>{
                                                                                                                                                if(errU){
                                                                                                                                                    console.log(errU.message);
                                                                                                                                                    res.send("err");
                                                                                                                                                }else{
                                                                                                                                                    res.redirect(`/pay/${order.rows[0].id}`);
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                          });
                                                                        
                                                                      }
                                                                  });
                                                        }
                                                    });
                                                        }else{
                                                            res.send("out_of_order");
                                                        }
                                                    }
                                                });  
                                        
                    }
        });
    }else{
        res.send("error");
    }
});
app.get("/order/:id",(req,res)=>{
    client.query(`select books.name as name, 
                         books.autor as autor, 
                         books.isbn as isbn, 
                         books_in_order.current_price as price, 
                         books_in_order.number_of_books as amount 
                            from books_in_order 
                                inner join books 
                                    on books_in_order.id_book=books.isbn
                                        where id_order=$1`,[req.params.id],(error,result)=>{
        if(error){
            console.log(error.message);
        }else{
            client.query(`select sum(books_in_order.current_price*books_in_order.number_of_books)
                            from books_in_order 
                                    where id_order=$1`,[req.params.id],(err,relt)=>{
                                        if(err){
                                            console.log(err.message);
                                        }else{
                                            res.render("client/books_in_order",{books:result.rows ,sum:relt.rows[0].sum ,currency:currency})
                                        }
                                    });
            
        }
    });
});
app.get("/view-order/:id",(req,res)=>{
    client.query(`select books.name as name, 
                         books.autor as autor, 
                         books.isbn as isbn,
                         books.price as price, 
                         books_in_order.number_of_books as amount 
                          from books_in_order 
                            inner join books 
                                on books_in_order.id_book=books.isbn
                                  where id_order=$1`,[req.params.id],(error,result)=>{
        if(error){
            console.log(error.message);
        }else{
            client.query(`select sum(books.price*books_in_order.number_of_books)
            from books_in_order 
                inner join books 
                 on books_in_order.id_book=books.isbn
                    where id_order=$1`,[req.params.id],(err,relt)=>{
                        if(err){
                            console.log(err.message);
                        }else{
                            res.render("client/books_in_order",{books:result.rows ,sum:relt.rows[0].sum ,currency:currency})
                        }
                    });
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
app.get("/backoffice-orders",(req,res)=>{
   if(req.session.idStaff){
    let query =`select orders.id as id ,
                       users.username as name_of_user, 
                       orders.price as price, 
                       status_of_order.name as status, 
                       orders.creation_date as time_of_creation 
                        from orders 
                            inner join users 
                                on users.id=orders.id_user
                            inner join status_of_order 
                                on status_of_order.id=orders.id_status 
                                    where true`;
    let params = [];
    if(req.query.dateFrom){
        params.push(req.query.dateFrom);
        query+= ` and orders.creation_date < $${params.length}::timestamp with time zone at time zone '+03'`
    }
    if(req.query.name){
        params.push(req.query.name);
        query += ` and users.username =$${params.length} `;        
    }
    if(req.query.priceUpper){
        params.push(req.query.priceUpper);
        query+= ` and price <= $${params.length} `
    }
    if(req.query.priceLower){
        params.push(req.query.priceLower);
        query+= ` and price >= $${params.length} `
    }
    if(req.query.status && req.query.status!=0 ){
        params.push(req.query.status);
        query+= ` and orders.id_status=$${params.length}`
    }
    query+=` order by id desc`
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
                        res.render('backoffice/orders',{orders:result.rows,
                            currency:currency,
                            user:r.rows[0],
                            statuses: resl.rows,
                            value: req.query});
    
                     }
                 });   
                }                    
            });
            
        }
    });
   }else{
       res.send("error");
   }
    
});

app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/books");
})

app.get("/forgoten",(req,res)=>{
    res.render("client/forgoten");
});
app.get("/forgoten/:mail",(req,res)=>{

});
app.get("/forgoten/:name/:key",(req,res)=>{

});

app.get('/register',(req,res)=>{
    res.render('client/register');
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
app.post('/register/:name/:email/:password/:captcha',(req,res)=>{
    if(req.params.captcha === undefined ||
		req.params.captcha === "" ||
		req.params.captcha === null){
			return res.send('error_not_found');
		}
	const secretKey = '6LfxfGMcAAAAAKo9HDzkBnr0sAN8WLADJydG1Ik_';
	const verifyURL = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.params.captcha}&remoteip=${req.connection.remoteAddress}`;
	
	request(verifyURL,(err,response,body)=>{
		body = JSON.parse(body);
		if(body.success !== undefined && !body.success){
			return res.send('error_not_seccessful');
		}

	});

    const query = `select * from users where $1=username`;  
		client.query(query,[req.params.name], (error, results) => {
			if (error) {
			return console.error(error.message);
			}
			if(!results.rows[0]){
				let salt = getRandomString(20);
				const queryInsert = `insert into users(username,email,password,salt) 
                                        values ($1,$2,MD5($3),$4);`;  
				client.query(queryInsert,[req.params.name,req.params.email,req.params.password+salt,salt], (err, resl) =>{
					console.log(err);
					 if(err){
					   return console.error(err);
					 }else{
						 
						client.query(query,(er,re)=>{
							if(er){
								return console.error(er);
							}else{
								let date_ob = new Date();
								console.log(re.rows[0].id);
								 const key = getRandomString(50);
					 			const queryV = `insert into validated_users(valid,key,time_of_creation,id_user)
                                                    values (FALSE,$1,$2,$3);`;
								
								let mailOptions = {
									from: 'angelsedmakov@gmail,com',
									to: re.rows[0].email,
									subject: 'Sending Verification Key',
									text: 'http://localhost:8080/activate/'+key
  								};
								  transporter.sendMail(mailOptions, function(error, info){
									if (error) {
									  console.log(error);
									} else {
									  console.log('Email sent: ' + info.response);
									  client.query(queryV,[key,
                                                           date_ob.toISOString().replace('T',' ').substring(0,18),
                                                           re.rows[0].id],(error,result)=>{
                                          console.log('hi');
										  if(error){
											  console.log(error.message)
										  }else{
                                              req.session.verificationID = re.rows[0].id;
											  res.send('/activate');
										  }
									  });
									}
								  });			
							}
							
						 });
						
					 }
					
				});
			}else {
				console.log('enter');
				res.send('error_exists');
			}
		});

});

app.get("/activate",(req,res)=>{
    res.render("client/activate");
});
app.get("/activate/:key",(req,res)=>{
    const query = `update validated_users set valid = TRUE where key=$1 ;`;
	client.query(query,[req.params.key],(error,result)=>{
		if(error){
            console.log('hi');
			console.log(error.message)
		}else{
            
			res.redirect('/login');
        }
	})
});
app.get("/resend",(req,res)=>{
    if(req.session.verificationID){
        let date_ob = new Date();
		const key = getRandomString(50);
		const queryV = `update validated_users set key=$1, time_of_creation = $2 where id_user=$3`;
		const queryE = `select id, email from users where id = ${req.session.verificationID} ;`;
		client.query(queryE,[key,
                             date_ob.toISOString().replace('T',' ').substring(0,18),
                             req.session.verificationID],(err,re)=>{
			if(err){
				console.log(err.message);
			}else{
				let mailOptions = {
                    from: 'angelsedmakov@gmail,com',
                    to: re.rows[0].email,
                    subject: 'Sending Verification Key',
                    text: 'http://localhost:8080/activate/'+key
                  };
				transporter.sendMail(mailOptions, function(error, info){
					if (error) {
					console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
						client.query(queryV,(er,result)=>{
							if(er){
							console.log(er.message);
							}else{
							res.send('send');
							}
						});
					}
				});	
			}
		});
    }else{
        res.send('error');
    }
});


const port = process.env.PORT || 8080;
	app.listen(port, () => console.log(`doing stuff ${port}`));

    function getRandomString(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    }