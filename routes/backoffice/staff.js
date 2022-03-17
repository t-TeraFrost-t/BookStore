module.exports = function(app,client){

    app.get("/backoffice-staff",(req,res)=>{
        if(req.session.idStaff){
         client.query(`select bool_or(permitions_for_role.id_permition = 18) as check
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
                                                                 client.query(`select id,username,email from staff order by id`,(error,result)=>{
                                                                     if(error){
                                                                         console.log(error.message);
                                                                     }else{    
                                                                         client.query(`select id,username,email from staff where id=$1;`,[req.session.idStaff],(e,r)=>{
                                                                             if(e){
                                                                                 console.log(e.message);
                                                                             }else{
                                                                                 res.render("backoffice/staff",{staff:result.rows,permitions: resultP.rows,user:r.rows[0],curent:'staff'});
                                                                                 //res.render('backoffice/update-staff',{staff:ressult.rows[0]});
                                                                     
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
     app.get("/backoffice-staff/:id",(req,res)=>{
       if(req.session.idStaff){
         client.query(`select bool_or(permitions_for_role.id_permition = 19) as check
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
                                                                         client.query(`select id,username,email from staff where id=$1;`,[req.session.idStaff],(error,ressult)=>{
                                                                             if(error){
                                                                                 console.log(error.message);
                                                                             }else{
                                                                                 if(ressult.rows[0]){
                                                                                     client.query(`select id,username,email from staff where id=$1;`,[req.params.id],(error,ress)=>{
                                                                                         if(error){
                                                                                             console.log(error.message);
                                                                                         }else{
                                                                                             client.query(`select * from roles`,(err,re)=>{
                                                                                                 if(err){
                                                                                                     console.log(err.message);
                                                                                                 }else{
                                                                                                     res.render('backoffice/update-staff',{staff:ress.rows[0],
                                                                                                                                           user:ressult.rows[0],
                                                                                                                                           permitions: resultP.rows});
                                                                                                 }
                                                                                             })
                                                                                             
                                                                                 
                                                                                         }
                                                                                     });
                                                                                 }else{
                                                                                     res.send('errorP');
                                                                                 }
                                                                     
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
     app.get("/backoffice-staff/:id",(req,res)=>{
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
                                                                         client.query(`select * from roles`,(er,re)=>{
                                                                             if(er){
                                                                                 console.log(er.message);
                                                                             }else{
                                                                               client.query(`select id,username,email from staff where id=$1;`,[req.params.id],(error,ressult)=>{
                                                                                   if(error){
                                                                                       console.log(error.message);
                                                                                   }else{
                                                                                       res.render('backoffice/update-staff',{staff:ressult.rows[0], permitions:resultP.rows});
                                                                           
                                                                                   }
                                                                               });
                                                                             }
                                                                         })
                                                                     }
                                                                 })
     
                                         }else{
                                             res.send('no access');    
                                         }
                             }
                         })
       
         
     });
     app.post("/update-staff/:id/:name/:email",(req,res)=>{
         client.query(`select bool_or(permitions_for_role.id_permition = 19) as check
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
                                                             
                                                             console.log(req.params);
                                                             client.query(`update staff set username=$1, 
                                                                                            email=$2
                                                                                             where id=cast($3 as bigint)`,[req.params.name,
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
     app.post("/update-staff/:id/:name/:email/:password",(req,res)=>{
         client.query(`select bool_or(permitions_for_role.id_permition = 19) as check
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
                                                                                     client.query(`update staff set username=$1, 
                                                                                                     email=$2, 
                                                                                                     password=MD5(CONCAT(cast($3 as text),salt))
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
                                                                                 }
                                                                             })
                                                             
                                                         }else{
                                                             res.send('no access');    
                                                         }
                                                     }
                                                 })
     });
     app.get("/add-staff",(req,res)=>{
       if(req.session.idStaff){
         client.query(`select bool_or(permitions_for_role.id_permition = 17) as check
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
                                                                             client.query(`select * from staff where id = $1`,[req.session.idStaff],(err,resul)=>{
                                                                                 if(err){
                                                                                     console.log(err.message);
                                                                                 }else{
                                                                                     if(resul.rows[0]){
                                                                                         client.query(`select * from roles`,(er,re)=>{
                                                                                             if(er){
                                                                                                 console.log(er.message);
                                                                                             }else{
                                                                                                 res.render("backoffice/add-staff",{user:resul.rows[0],
                                                                                                                                    curent:'cur',
                                                                                                                                    permitions: resultP.rows});
                                                                                             }
                                                                                         })
                                                                                     }else{
                                                                                         res.send('error');
                                                                                     }
                                                                                 }
                                                                             })
                                                                           }
                                                                         })
     
                                 }else{
                                     res.send('no access');    
                                 }
                             }
                         })
         
       }  else{
           res.send('error');
       }
          
         
     });
     app.post("/add-staff/:name/:email/:password",(req,res)=>{
         client.query(`select bool_or(permitions_for_role.id_permition = 17) as check
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
         
                                                             let salt = getRandomString(20);
                                                             client.query(`insert into staff(username,email,password,salt) 
                                                                             values ($1,
                                                                                     $2,
                                                                                     MD5(CONCAT(cast($3 as text),cast($4 as text))),
                                                                                     cast($4 as text))`,[req.params.name,
                                                                                                             req.params.email,
                                                                                                             req.params.password,
                                                                                                             salt],(error,result)=>{
                                                                                     if(error){
                                                                                         console.log(error.message);
                                                                                     }else{
                                                                                         res.send('added');
                                                                                     }
                                                                 });
                                                             
                                                         }else{
                                                             res.send('no access');    
                                                         }
                                                     }
                                                 })
         
     });
     app.post("/delete-staff/:id",(req,res)=>{
         client.query(`select bool_or(permitions_for_role.id_permition = 20) as check
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
         
                                                             client.query(`delete from staff where id=$1`,[req.params.id],(error,result)=>{
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

    //other routes..
}