$(document).ready(()=>{
    $('#isbn').keyup(()=>{
        $.get(`/sugestions/isbn/${$('#isbn').val()}`,(data)=>{
            console.log(data);
            $('#sugestions ').empty();
            data.forEach(element => {
               
                $('#sugestions ').append(`<option>${element.isbn}</option>`)
            });
        })
    }); 
    $('#add').click(()=>{
        $.post(`/backoffice/insert-book/${$('#order').val()}/${$('#isbn').val()}`,(data)=>{
            if(!alert(data)){window.location.href=`/backoffice-view-order/${$("#order").val()}`;}
        })
    });
    $('.update').click(()=>{
       // console.log($(event.currentTarget).parent().parent().children('#cur').children().val());
        //console.log(`/update-oder/${$("#order").val()}/${$(event.currentTarget).parent().parent().children('#isbnI').html()}/${$(event.currentTarget).parent().parent().children('#cur').children().val()}/${$(event.currentTarget).parent().parent().children('#amount').children().val()}`);
        $.post(`/update-oder/${$("#order").val()}/${$(event.currentTarget).parent().parent().children('#isbnI').html()}/${$(event.currentTarget).parent().parent().children('#cur').children().val()}/${$(event.currentTarget).parent().parent().children('#amount').children().val()}`,
                (data)=>{
                    if(!alert(data)){window.location.href=`/backoffice-view-order/${$("#order").val()}`;}
                });
    })
});