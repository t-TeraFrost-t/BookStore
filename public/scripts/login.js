$(document).ready(()=>{
    $("#loggin").click(()=>{
        console.log($('#name').val());
        $.ajax({
            url: '/login',
            type: 'POST',
            data: { 
                name: $('#name').val(),
                password: $('#password').val()
            },
            success: (data)=>{
                console.log(data);
                if(data==='/books'){
                    window.location.href = data;
                }else if(data==='/nouser'){
                    $("#error").show();
                }else{
                    alert(data);
                }
            }
        });
    });
    $("#forgoten").click(()=>{
        window.location.href = "/forgoten";
    });
});