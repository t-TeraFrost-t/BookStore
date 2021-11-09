$(document).ready(()=>{
    $("#loggin").click(()=>{
        $.get(`/login/${$("#name").val()}/${$("#password").val()}`,(data)=>{
            if(data==='error'){
                $("#error").show();
            }else{
                window.location.href = data;
            }
        });
    });
    $("#forgoten").click(()=>{
        window.location.href = "/forgoten";
    });
});