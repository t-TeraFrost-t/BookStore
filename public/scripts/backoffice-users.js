$(document).ready(()=>{
    $('#error').hide(); 
    console.log("hrip");
    $(".update").click(()=>{
        
        window.location.href = `/backoffice-user/${$(event.currentTarget).attr("id")}`;
    })
    $(".delete").click(()=>{
        console.log("hi");
        $.post(`/delete-user/${$(event.currentTarget).attr("id")}`,(data)=>{
            if(!alert('deleted')){window.location.href='/backoffice-users';}   
        });
    })
    $("#add").click(()=>{
        window.location.href = `/add-user`;
    });
    $(".submit").click(()=>{
        console.log("neshto");
        if($("#pas1").val()==='' && $("#pas1").val()===''){
            $.post(`/update-user/${$(event.currentTarget).attr("id")}/${$("#name").val()}/${$("#email").val()}`,(data)=>{
                if(data==='updated'){
                    if(!alert('updated username or email')){window.location.href='/backoffice-users';}
                }else{
                    console.log(data);
                }
            });
        }else{
            if($("#pas1").val()!==$("#pas2").val()){
               $('#error').show(); 
            }else{
                $.post(`/update-user/${$(event.currentTarget).attr("id")}/${$("#name").val()}/${$("#email").val()}/${$("#pas1").val()}`,(data)=>{
                    if(data==='updated'){
                        if(!alert('updated username,email, or password')){window.location.href='/backoffice-users';}
                    }else{
                        console.log(data);
                    }
                });
            }
        }
        
    });
});