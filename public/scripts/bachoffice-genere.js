$(document).ready(()=>{
    console.log("hrip");
    $(".update").click(()=>{
        
        window.location.href = `/backoffice-gener/${$(event.currentTarget).attr("id")}`;
    })
    $(".delete").click(()=>{
        console.log("hi");
        $.post(`/delete-gener/${$(event.currentTarget).attr("id")}`,(data)=>{
            if(!alert('deleted')){window.location.reload();}
        });
    })
    $("#add").click(()=>{
        window.location.href = `/backoffice-gener`;
    });
    $("#submit").click(()=>{
       // console.log(encodeURI($('#name').val()));
        $.post(`/add-gener/${ encodeURIComponent($('#name').val())}`,(data)=>{
            if(data==='added'){
                if(!alert('added')){window.location.href='/backoffice-genere';}

            }
        })
    });
    $(".submit").click(()=>{
        console.log("neshto");
        $.post(`/update-gener/${$(event.currentTarget).attr("id")}/${encodeURIComponent($("#name").val())}`,(data)=>{
            if(data==='updated'){
                if(!alert('updated')){window.location.href='/backoffice-genere';}
            }else{
                console.log(data);
            }
        });
    });
});