module.exports = function(app,client){

    app.get("/backoffice-genere",(req,res)=>{
        if(req.session.idStaff){
          client.query("select * from geners order by id",(err,ress)=>{
              if(err){
                  console.log(err.message);
              }else{
                  client.query(`select bool_or(permitions_for_role.id_permition = 6) as check
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
                                                                                                      res.render("backoffice/genere",{geners: ress.rows,permitions: resultP.rows, user:r.rows[0], curent:'gener'});
                                                                                                  }
                                                                                              })
                                                                                              
                                                                                          }
                                                                              })
                                                              
                                                          }else{
                                                              res.send('no access');    
                                                          }
                                                      }
                                                  })
      
                  
              }
          });
        }else{
            res.send('error');
        }
          
          
      });
      app.post("/update-gener/:id/:name",(req,res)=>{
          if(req.session.idStaff){
              client.query(`select bool_or(permitions_for_role.id_permition = 7) as check
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
                                                              
                                                              client.query(`update geners set name=$1 where id=$2`,[req.params.name,req.params.id],(error,result)=>{
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
      app.post("/delete-gener/:id",(req,res)=>{
          client.query(`select bool_or(permitions_for_role.id_permition = 8) as check
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
          
                                                              client.query(`delete from geners where id=$1`,[req.params.id],(error,result)=>{
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
      app.get("/backoffice-gener/:id",(req,res)=>{
          if(req.session.idStaff){
              client.query(`select bool_or(permitions_for_role.id_permition = 7) as check
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
                                                                                                      client.query(`select * from geners where id=$1;`,[req.params.id],(error,ressult)=>{
                                                                                                          if(error){
                                                                                                              console.log(error.message);
                                                                                                          }else{
                                                                                                              client.query(`select * from staff where id = $1`,[req.session.idStaff],(e,r)=>{
                                                                                                                  if(e){
                                                                                                                      console.log(e.message);
                                                                                                                  }else{
                                                                                                                      res.render('backoffice/submit-gener',{gener:ressult.rows[0],permitions:resultP.rows,user:r.rows[0]});
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
      app.get("/backoffice-gener",(req,res)=>{
          if(req.session.idStaff){
              client.query(`select bool_or(permitions_for_role.id_permition = 5) as check
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
                                                          client.query(`select * from staff where id = $1`,[req.session.idStaff],(e,r)=>{
                                                              if(e){
                                                                  console.log(e.message);
                                                              }else{
                                                                  res.render('backoffice/add-gener',{user:r.rows[0],permitions:resultP.rows});
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
      app.post("/add-gener/:name",(req,res)=>{
       if(req.session.idStaff){
          client.query(`select bool_or(permitions_for_role.id_permition = 5) as check
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
                                                              
                                                              client.query(`insert into geners(name) values($1);`,[req.params.name],(error,result)=>{
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
       }else{
           res.send('error');
       }
          
      });
}