$(document).ready(()=>{
    $('.books').click(()=>{
        window.location.href = `/order/${$(event.currentTarget).parent().parent().attr('id')}`
     });
     $('.cancel').click(()=>{
         console.log('hi');
        $.ajax({
            url: `/cancel-order/${$(event.currentTarget).parent().parent().attr('id')}`,
            method: 'GET',
            success : (data)=>{
                if(!alert(data)){window.location.reload()};
            }
        });
     });
     $(".pages").click(()=>{

        console.log($('#fillter-gener').val());
        $.ajax({
            url: '/orders',
            method: 'GET',
            data: {
                page: $(event.currentTarget).attr("value")
            },
            success : (data)=>{
                let newDoc = document.open("text/html", "replace");
                newDoc.write(data);
                newDoc.close();
            }
        }); 
    }); 
});