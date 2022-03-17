module.exports = function(app,client){

    app.get("/backoffice-users",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select bool_or(permitions_for_role.id_permition = 14) as check
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
                                                                                                                            res.render("backoffice/users",{users:result.rows,permitions:resultP.rows,user:r.rows[0],curent:'users'});
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
    app.get("/backoffice-user/:id",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select bool_or(permitions_for_role.id_permition = 15) as check
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
                           
                                                                                                                                     res.render('backoffice/update-users',{user:ressult.rows[0],permitions:resultP.rows,staff:r.rows[0]});
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
    app.post("/update-user/:id/:name/:email",(req,res)=>{
        client.query(`select bool_or(permitions_for_role.id_permition = 15) as check
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
                                                            
                                                            client.query(`update users set username=$1, 
                                                                                           email=$2 
                                                                                            where id=$3`,[req.params.name,
                                                                                                          req.params.email,
                                                                                                          req.params.id],(error,result)=>{
                                                                                                   if(error){
                                                                                                        console.log(error.message);
                                                                                                    }else{
                                                                                                        res.send('updated');
                                                                                                    }
                                                                                                });
                                                            
                                                        }else{
                                                            res.send('no access');    
                                                        }
                                                    }
                                                })
        
    });
    app.post("/update-user/:id/:name/:email/:password",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select bool_or(permitions_for_role.id_permition = 15) as check
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
        
                                        client.query(`update users set username=$1,
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
                                        
                                    }else{
                                        res.send('no access');    
                                    }
                                }
                            })
        }else{
            res.send('error');
        }
        
    });
    app.post("/delete-user/:id",(req,res)=>{
        client.query(`select bool_or(permitions_for_role.id_permition = 16) as check
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
                                                            
                                                            client.query(`delete from users where id=$1`,[req.params.id],(error,result)=>{
                                                                if(error){
                                                                    console.log(error.message);
                                                                }else{
                                                                    res.send('deleted');
                                                                }
                                                            });
                                                            
                                                        }else{
                                                            res.send('no access');    
                                                        }
                                                    }
                                                })
        
    });
}