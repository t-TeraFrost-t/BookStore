$(document).ready(()=>{
    $(".subtract").click(()=>{
        if(parseInt($(event.currentTarget).parent().children("#number").val())!=1){
            $.post(`/basket/${$(event.currentTarget).parent().parent().attr("id")}/${parseInt($(event.currentTarget).parent().children("#number").val())-1}`,(data)=>{
                window.location.reload();
            });
        }else{
            $.post(`/basket-delete/${$(event.currentTarget).parent().parent().attr("id")}`,(data)=>{
                if(data==='deleted'){
                    
                    if(!alert('removed from basket')){window.location.reload();}
                }
                window.location.reload();
            });
        }
        
    })
    $(".add").click(()=>{
        console.log($(event.currentTarget).parent().parent().attr("id"));
        $.post(`/basket/${$(event.currentTarget).parent().parent().attr("id")}/${parseInt($(event.currentTarget).parent().children("#number").val())+1}`,(data)=>{
            window.location.reload();
        });
    });
    $("#order").click(()=>{
        window.location.href = '/order';
    });
});