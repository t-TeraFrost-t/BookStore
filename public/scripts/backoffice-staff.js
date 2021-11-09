$(document).ready(()=>{
    $('#error').hide(); 
    console.log("hrip");
    $(".update").click(()=>{
        
        window.location.href = `/backoffice-staff/${$(event.currentTarget).attr("id")}`;
    })
    $(".delete").click(()=>{
        console.log("hi");
        $.post(`/delete-staff/${$(event.currentTarget).attr("id")}`,(data)=>{
            if(!alert('deleted')){window.location.href='/backoffice-staff';}
            
        });
    })
    $("#add").click(()=>{
        window.location.href = `/add-staff`;
    });
    $("#submit").click(()=>{
        if($("#pas1").val()!==$("#pas2").val()){
            $('#error').show(); 
         }else{
            $.post(`/add-staff/${$("#name").val()}/${$("#email").val()}/${$("#pas1").val()}`,(data)=>{
                if(data==='added'){
                    if(!alert('added')){window.location.href='/backoffice-staff';}
                }
            })
        }
    });
    $(".submit").click(()=>{
        console.log("neshto");
        if($("#pas1").val()==='' && $("#pas1").val()===''){
            $.post(`/update-staff/${$(event.currentTarget).attr("id")}/${$("#name").val()}/${$("#email").val()}`,(data)=>{
                if(data==='updated'){

                    if(!alert('updated username or email')){window.location.href='/backoffice-staff';}   
                }else{
                    console.log(data);
                }
            });
        }else{
            if($("#pas1").val()!==$("#pas2").val()){
               $('#error').show(); 
            }else{
                $.post(`/update-staff/${$(event.currentTarget).attr("id")}/${$("#name").val()}/${$("#email").val()}/${$("#pas1").val()}`,(data)=>{
                    if(data==='updated'){
                        if(!alert('updated username,email, or password')){window.location.href='/backoffice-staff';}
                    }else{
                        console.log(data);
                    }
                });
            }
        }
        
    });
});