module.exports = function(app,client){

    app.get('/staff-in-role/:id_role',(req,res)=>{
        if(req.session.idStaff){
            client.query(`select bool_or(permitions_for_role.id_permition = 22) as check
                                            from staff 
                                                inner join roles_of_staff
                                                    on roles_of_staff.id_staff = staff.id
                                                inner join roles 
                                                  on roles_of_staff.id_role = roles.id
                                                inner join permitions_for_role 
                                                  on roles.id=permitions_for_role.id_role 
                                                where staff.id = $1;`,[req.session.idStaff],(e,r)=>{
                                                    if(e){
                                                        console.log(e.message);
                                                    }else{
                                                        if(r.rows[0].check){
                                                                client.query(`select distinct permitions_for_role.id_permition as id
                                                                                from staff
                                                                                    inner join roles_of_staff
                                                                                        on roles_of_staff.id_staff = staff.id
                                                                                    inner join roles 
                                                                                        on roles_of_staff.id_role = roles.id
                                                                                    inner join permitions_for_role 
                                                                                        on roles.id=permitions_for_role.id_role 
                                                                                         where staff.id = $1
                                                                                             order by permitions_for_role.id_permition;`,[req.session.idStaff],(errorP,resultP)=>{
                                                                                             if(errorP){
                                                                                                console.log(errorP.message,'q');
                                                                                            }else{
                                                                                                client.query(`select * from staff order by id`,(er,re)=>{
                                                                                                    if(er){
                                                                                                        console.log(er.message)
                                                                                                        
                                                                                                    }else{
                                                                                                            client.query(`select staff.id as id from staff 
                                                                                                                            inner join roles_of_staff
                                                                                                                                on  roles_of_staff.id_staff = staff.id
                                                                                                                                    where roles_of_staff.id_role = $1`,[req.params.id_role],(ero,resu)=>{
                                                                                                                                        if(ero){
                                                                                                                                            console.log(ero.message);
                                                                                                                                        }else{
                                                                                                                                            client.query('select * from roles where roles.id = $1',[req.params.id_role],(eror,resul)=>{
                                                                                                                                                if(eror){
                                                                                                                                                    console.log(eror.message);
                                                                                                                                                }else{
                                                                                                                                                    client.query('select * from staff where id = $1',[req.session.idStaff],(error,result)=>{
                                                                                                                                                        if(error){
                                                                                                                                                            console.log(error.message);
                                                                                                                                                        }else{
    
                                                                                                                                                            res.render('backoffice/roles_of_staff',{permitions:resultP.rows,
                                                                                                                                                                                                    all_staff:re.rows,
                                                                                                                                                                                                    staff:resu.rows,
                                                                                                                                                                                                    user:result.rows[0],
                                                                                                                                                                                                    role:resul.rows[0]});
    
                                                                                                                                                        }
                                                                                                                                                    })
    
                                                                                                                                                    
    
                                                                                                                                                }
                                                                                                                                            })
                                                                                                                                            
                                                                                                                                        }                                  
                                                                                                                                    })
                                                                                                    }
                                                                                                    
                                                                                                })
                                                                                            }
                                                                                });
                                                        }else{
                                                            res.send('no acces');
                                                        }
                                                    }
                                                })
        }else{
            res.send('error');
        }
    })
    app.post("/add-staff-to-role/:id_role/:id_staff",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select * from staff where id = $1`,[req.session.idStaff],(err,resu)=>{
                if(err){
                    console.log(err.message);
                }else{
                    client.query(`select bool_or(permitions_for_role.id_permition = 22) as check
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
                                                        if(resu.rows[0]){
                                                           
                                                                        client.query(`select * from roles_of_staff where id_role=$1 and id_staff = $2`,[req.params.id_role,req.params.id_id_staff],(error,result)=>{
                                                                            if(error){
                                                                                console.log(error.message);
                                                                            }else{
                                                                                if(result.rows[0]){
                                                                                    res.send('Staff has already been added');
                                                                                }else{
                                                                                    client.query(`insert into roles_of_staff(id_role,id_staff) values ($1,$2) `,[req.params.id_role,req.params.id_staff],(er,re)=>{
                                                                                        if(er){
                                                                                            console.log(er.message)
                                                                                        }else{
                                                                                            res.send('added');   
                                                                                        }
                                                                                    
                                                                                    })               
                                                                                }
                                                                            }    
                                                                        })
                                                                                 
                                                                
                                                            
                                                        }else{
                                                            res.send('error');                
                                                        }                                    
                                                        
                                                    }else{
                                                        res.send('no access');    
                                                    }
                                                }
                                            })
                    
                }
          })
    }else{
        res.send('error');
    }
    })
    app.post("/remove-staff-from-role/:id_role/:id_staff",(req,res)=>{
    if(req.session.idStaff){
        client.query(`select * from staff where id = $1`,[req.session.idStaff],(err,resu)=>{
            if(err){
                console.log(err.message);
            }else{
                if(resu.rows[0]){
                    client.query(`select bool_or(permitions_for_role.id_permition = 23) as check
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
                                    client.query(`delete from roles_of_staff where id_role = $1 and id_staff = $2`,[req.params.id_role,req.params.id_staff],(er,re)=>{
                                        if(er){
                                            console.log(er.message)
                                        }else{
                                            res.send('revoked');   
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
            }
      })
    }else{
    res.send('error');
    }
    })
    app.get('/backoffice-roles',(req,res)=>{
        if(req.session.idStaff){
                client.query(`select * from staff where id = $1`,[req.session.idStaff],(err,resu)=>{
                    if(err){
                        console.log(err.message);
                    }else{
                        if(resu.rows[0]){
                            client.query(`select bool_or(permitions_for_role.id_permition = 22) as check
                                            from staff 
                                                inner join roles_of_staff
                                                    on roles_of_staff.id_staff = staff.id
                                                inner join roles 
                                                  on roles_of_staff.id_role = roles.id
                                                inner join permitions_for_role 
                                                  on roles.id=permitions_for_role.id_role 
                                                where staff.id = $1;`,[req.session.idStaff],(errorC,resultC)=>{
                                                    if(errorC){
                                                        console.log(errorC.message,'c');
                                                    }else{
                                                        console.log(resultC.rows[0]);
                                                        if(resultC.rows[0].check){
                                                            client.query(`select distinct permitions_for_role.id_permition as id
                                                                            from staff
                                                                                inner join roles_of_staff
                                                                                    on roles_of_staff.id_staff = staff.id
                                                                                inner join roles 
                                                                                    on roles_of_staff.id_role = roles.id
                                                                                inner join permitions_for_role 
                                                                                    on roles.id=permitions_for_role.id_role 
                                                                                where staff.id = $1
                                                                                order by permitions_for_role.id_permition;`,[req.session.idStaff],(errorP,resultP)=>{
                                                                                    if(errorP){
                                                                                        console.log(errorP.message,'q');
                                                                                    }else{
                                                                                        client.query(`select * from roles order by id`,(er,re)=>{
                                                                                            if(er){
                                                                                                console.log(er.message)
                                                                                            }else{
                                                                                                console.log(resultP.rows);
                                                                                                res.render('backoffice/groups',{user: resu.rows[0],
                                                                                                                                groups: re.rows,
                                                                                                                                permitions: resultP.rows  })    
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
                    }
                })
        }else{
            res.send('error');
        }
    });
    app.get('/backoffice-permitions-for-role/:id',(req,res)=>{
        if(req.session.idStaff){
            client.query(`select * from staff where id = $1`,[req.session.idStaff],(err,resu)=>{
                if(err){
                    console.log(err.message);
                }else{
                    if(resu.rows[0]){
                      client.query(`select * from roles where roles.id = $1`,[req.params.id],(ero,resul)=>{
                          if(ero){
                              console.log(ero.message);
                          }else{
                            client.query(`select substring(name,8) as s  from permitions where mod(id,4)=0`,(err,ro)=>{
                                if(err){
                                    console.log(err);
                                }else{
                                client.query(`select * from permitions`,(errr,rl)=>{
                                    if(errr){
                                        console.log(errr);
                                    }else{
                                 
                                        client.query(`select permitions.id as id, permitions.name as name from roles 
                                                            inner join permitions_for_role on permitions_for_role.id_role = roles.id
                                                            inner join permitions on permitions_for_role.id_permition = permitions.id
                                                               where roles.id = $1`,[req.params.id],(er,re)=>{
                                                                   if(er){
                                                                       console.log(er.message)
                                                                   }else{
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
                                                                                                            res.render('backoffice/permitions_for_group',{user: resu.rows[0], 
                                                                                                                                                          types:ro.rows ,
                                                                                                                                                          group: resul.rows[0] ,
                                                                                                                                                          permitions: re.rows ,
                                                                                                                                                          all_permitions: rl.rows,
                                                                                                                                                          permitions_for_user: resuS.rows})
                                                                                                        }
                                                                                                    })
                                                                           
                                                                   }
                                                               
                                                 })        
     
    
                                    }
                                 })    
                                }
                            })
                            
                          }
                      })
                        
                    }else{
                        res.send('error');                
                    }
                }
            })
    }else{
        res.send('error');
    }
    });
    app.post('/create-group/:name',(req,res)=>{
        if(req.session.idStaff){
            client.query(`select * from staff where id = $1`,[req.session.idStaff],(err,resu)=>{
                if(err){
                    console.log(err.message);
                }else{
                    if(resu.rows[0]){
                        client.query(`select bool_or(permitions_for_role.id_permition = 21) as check
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
                                                            client.query(`insert into roles(name) values ($1)`,[req.params.name],(er,re)=>{
                                                                if(er){
                                                                    console.log(er.message);
                                                                }else{
                                                                    res.send('added');
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
                }
            })
        }else{
            res.send('error');
        }
    });
    app.post("/add-permition-of-role/:id_group/:id_permition",(req,res)=>{
            if(req.session.idStaff){
                client.query(`select * from staff where id = $1`,[req.session.idStaff],(err,resu)=>{
                    if(err){
                        console.log(err.message);
                    }else{
                        client.query(`select bool_or(permitions_for_role.id_permition = 22) as check
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
                                                            if(resu.rows[0]){
                                                               
                                                                            client.query(`select * from permitions_for_role where id_role=$1 and id_permition = $2`,[req.params.id_group,req.params.id_permition],(error,result)=>{
                                                                                if(error){
                                                                                    console.log(error.message);
                                                                                }else{
                                                                                    if(result.rows[0]){
                                                                                        res.send('Permition is already given');
                                                                                    }else{
                                                                                        client.query(`insert into permitions_for_role(id_role,id_permition) values ($1,$2) `,[req.params.id_group,req.params.id_permition],(er,re)=>{
                                                                                            if(er){
                                                                                                console.log(er.message)
                                                                                            }else{
                                                                                                res.send('added');   
                                                                                            }
                                                                                        
                                                                                        })               
                                                                                    }
                                                                                }    
                                                                            })
                                                                                     
                                                                    
                                                                
                                                            }else{
                                                                res.send('error');                
                                                            }                                    
                                                            
                                                        }else{
                                                            res.send('no access');    
                                                        }
                                                    }
                                                })
                        
                    }
              })
        }else{
            res.send('error');
        }
    })
    app.post("/revoke-permition-of-role/:id_group/:id_permition",(req,res)=>{
        if(req.session.idStaff){
            client.query(`select * from staff where id = $1`,[req.session.idStaff],(err,resu)=>{
                if(err){
                    console.log(err.message);
                }else{
                    if(resu.rows[0]){
                        client.query(`select bool_or(permitions_for_role.id_permition = 23) as check
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
                                        client.query(`delete from permitions_for_role where id_role = $1 and id_permition = $2`,[req.params.id_group,req.params.id_permition],(er,re)=>{
                                            if(er){
                                                console.log(er.message)
                                            }else{
                                                res.send('revoked');   
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
                }
          })
    }else{
        res.send('error');
    }
    })
}