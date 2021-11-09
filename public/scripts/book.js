$(document).ready(()=>{
    $(".add").click(()=>{
        $.post(`/basket/${$(event.currentTarget).attr("id")}`,(data)=>{
            if(data==="error"){

                alert("plese login to add to your cart");
            }else if(data==="added"){
                alert("you hava added to your basket");
            }
        });
        
    });
})