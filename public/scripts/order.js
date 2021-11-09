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
});