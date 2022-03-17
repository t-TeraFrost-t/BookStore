$(document).ready(()=>{
    console.log('li');
    $('#log').click(()=>{
        $.ajax({
            url: '/backoffice-login/',
            type: 'POST',
            data: { 
                name: $('#name').val(),
                password: $('#password').val()
            },
            success: (data)=>{
                if(data==='error'){
                    $("#error").show();
                }else{
                    window.location.href = data;
                }
            }
        });
    });
});