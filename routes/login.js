module.exports = function(app,client,config,pool,request,getRandomString,transporter){
    app.get("/backoffice-login",(req,res)=>{
        res.render('backoffice/login');
    });
    app.post("/backoffice-login",(req,res,next)=>{
        client.query(`select * 
                            from staff
                      where 
                            username=$1 
                        and password=MD5(CONCAT(cast($2 as text),salt))`,[req.body.name,req.body.password]
            ,(error,result)=>{
                if(error){
                    //res.send('error');
                    next({message:error.message,json:'error'})
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
    app.get('/login',(req,res)=>{
        res.render('client/login');
    });
    app.get("/logout",(req,res,next)=>{
        try{
            req.session.destroy();

        }catch(err){
            next({message:err.message});
        }
        res.redirect("/books");
    })
    
    app.get("/forgoten",(req,res)=>{
        res.render("client/forgoten");
    });
    app.get("/forgoten/:mail",(req,res)=>{
    
    });
    app.get("/forgoten/:name/:key",(req,res)=>{
    
    });
    app.post('/login',(req,res,next)=>{
        client.query(`  select users.id as id
                        from users 
                            inner join validated_users on users.id = validated_users.id_user 
                        where (    username = $1 
                                or email=$1) 
                               and password=MD5(CONCAT(cast($2 as text),salt)) 
                               and valid=TRUE`,[req.body.name,req.body.password.toString()],
            (error,result)=>{
                if(error){
                    next({message:error.message,json:'error'})
                }else{
                    if(result.rows[0]){
                        req.session.idUser = result.rows[0].id;
                        console.log(req.session.idUser)
                        res.send('/books');
                    }else{
                        console.log('no');
                        res.send('/nouser');
                    }
            }
        });
    });
    app.get("/activate/:key",(req,res,next)=>{
        const query = `update validated_users set valid = TRUE where key=$1 ;`;
        client.query(query,[req.params.key],(error,result)=>{
            if(error){
                console.log('hi');
                next({message:error.message});
            }else{
                
                res.redirect('/login');
            }
        })
    });
    app.get('/register',(req,res)=>{
        res.render('client/register');
    });
    app.post('/register', async (req,res,next)=>{
        if(req.body.captcha === undefined ||
            req.body.captcha === "" ||
            req.body.captcha === null){
            return res.send('error_not_found');
        }
        
        const verifyURL = `https://google.com/recaptcha/api/siteverify?secret=${config.captcha.secretKey}&response=${req.params.captcha}&remoteip=${req.connection.remoteAddress}`;
        var verify = {
            method: 'POST',
            uri: 'https://www.google.com/recaptcha/api/siteverify',
            form: {
              secret: config.captcha.secretKey,
              response: req.params.captcha,
            }
          };
        request(verify,(err,response,body)=>{
            body = JSON.parse(body);
            if(body.success !== undefined && !body.success){
                return res.send('error_not_seccessful');
            }
    
        });
        console.log('hi');
        const client = await pool.connect();
        try{
                       await client.query('BEGIN')
            let user = await client.query(`select * from users where $1=username`,[req.body.user]);
            if(!user.rows[0]){
                let salt = getRandomString(20);  
                        await client.query(`insert into users(username,email,password,salt) 
                                              values ($1,$2,MD5($3),$4);`,[req.body.user,req.body.email,req.body.password+salt,salt]);
                 user = await client.query(`select * from users where $1=username`,[req.body.user]);
                 const key = getRandomString(50);
                        await client.query(`insert into validated_users(valid,key,time_of_creation,id_user)
                                              values (FALSE,$1,now(),$2);`,[key,user.rows[0].id]);
                let mailOptions = {
                                        from: config.connection_email.auth.user,
                                        to: user.rows[0].email,
                                        subject: 'Sending Verification Key',
                                        text: 'http://localhost:8080/activate/'+key
                                      };
                transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                          console.log(error);
                                        } else {
                                          console.log('Email sent: ' + info.response);
                                        }
                                      }
                                    );
                req.session.verificationID = user.rows[0].id;
                await client.query('COMMIT');
                client.release()
                res.send('/activate');

            }else {
                console.log('enter');
                res.send('error_exists');
            }
        }catch(err){
            console.log(err);
            await client.query('ROLLBACK')
            client.release()
            next({message:'error with database'});
        }
        
        
              
    });
    app.get("/activate",(req,res)=>{
        res.render("client/activate");
    });
    app.get("/resend",(req,res,next)=>{
        if(req.session.verificationID){
            let date_ob = new Date();
            const key = getRandomString(50);
            const queryV = `update validated_users set key=$1, time_of_creation = $2 where id_user=$3`;
            const queryE = `select id, email from users where id = ${req.session.verificationID} ;`;
            client.query(queryE,[key,
                                 date_ob.toISOString().replace('T',' ').substring(0,18),
                                 req.session.verificationID],(err,re)=>{
                if(err){
                    next({message:err.message});
                }else{
                    let mailOptions = {
                        from: 'angelsedmakov@gmail,com',
                        to: re.rows[0].email,
                        subject: 'Sending Verification Key',
                        text: 'http://localhost:8080/activate/'+key
                      };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            next({message:error.message});
                        } else {
                            console.log('Email sent: ' + info.response);
                            client.query(queryV,(er,result)=>{
                                if(er){
                                    next({message:er.message});
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
}