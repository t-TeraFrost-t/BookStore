$(document).ready(()=>{
    $(".subtract").click(()=>{
        if(parseInt($(event.currentTarget).parent().children("#number").val())!=1){
            $.ajax({
                url: '/update-basket',
                type: 'POST',
                data: { 
                    id: $(event.currentTarget).parent().parent().attr("id"),
                    count: parseInt($(event.currentTarget).parent().children("#number").val())-1
                },
                success: (data)=>{
                    window.location.reload();
                }
            });
        }else{
            $.ajax({
                url: '/basket-delete',
                type: 'POST',
                data: { 
                    id: $(event.currentTarget).parent().parent().attr("id"),
                },
                success: (data)=>{
                    if(data==='deleted'){
                    
                        if(!alert('removed from basket')){window.location.reload();}
                    }
                    window.location.reload();
                }
            });
        }
        
    })
    $(".add").click(()=>{
        $.ajax({
            url: '/update-basket',
            type: 'POST',
            data: { 
                id: $(event.currentTarget).parent().parent().attr("id"),
                count: parseInt($(event.currentTarget).parent().children("#number").val())+1
            },
            success: (data)=>{
                window.location.reload();
            }
        });
    });
    $("#order").click(()=>{
        window.location.href = '/order';
    });
});