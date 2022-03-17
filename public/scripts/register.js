$(document).ready(()=>{
    $("#register").click(()=>{
        if($("#g-recaptcha-response").val()===""){
            $('#error-captcha').show();
            return;
            
        }
        const reg = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/g;
        if(!reg.test($("#email").val())){
            $('#error-incorect-input').show();
        }
            if($("#pwd1").val()===$("#pwd2").val()){
                $.ajax({
                    url: '/register',
                    type: 'POST',
                    data: { 
                        user: $('#user').val(),
                        email: $('#user').val(),
                        password: $('#password').val(),
                        captcha: $("#g-recaptcha-response").val()
                    },
                    success: (data)=>{
                        switch(data){
                            case 'error': 
                                $('#error').show();
                                break;
                            case 'error_not_found':
                            case 'error_not_seccessful':
                                $('#error-captcha').show();
                                break;
                            case 'error_exists':
                                $('#error-exist').show();
                                break;
                            default: window.location.href=data;
                        }
                    }
                });
                
            }else $('#error-pas').show();
    });
    $("#resend").click(()=>{
        $.get('/resend',(data)=>{
            if(data=="send"){
                alert("Mail has been send");
            }else{
                alert("Error has ocured");
            }
        });
    });
});