$(document).ready(()=>{
    $(".add").click(()=>{
        $.ajax({
            url: '/add-basket',
            type: 'POST',
            data: { 
                idBook: $(event.currentTarget).attr("id"),
            },
            success: (data)=>{
                if(data==="error"){

                    alert("plese login to add to your cart");
                }else if(data==="added"){
                    alert("you hava added to your basket");
                }
            }
        });
    });
})