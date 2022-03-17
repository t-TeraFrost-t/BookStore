$(document).ready(()=>{
    $('#permition').keyup(()=>{
        $.get(`/sugestions/permitions/${$('#permition').val()}`,(data)=>{
            console.log(data);
            $('#suggestions').empty();
            data.forEach(element => {
                $('#suggestions').append(`<option>${element.name}</option>`)
            });
        })
    });
    $("input[type='checkbox']").change(function() {
        console.log('hi');
        if(this.checked) {
            $.post(`/add-permition-of-role/${$('#add').val()}/${$(event.currentTarget).val()}`,(data)=>{
                if(!alert(data)) window.location.href = `/backoffice-permitions-for-role/${$('#add').val()}`;
            })
        }else{
            $.post(`/revoke-permition-of-role/${$('#add').val()}/${$(event.currentTarget).val()}`,(data)=>{
                if(!alert(data)) window.location.href = `/backoffice-permitions-for-role/${$('#add').val()}`;
            })
        }
    });
    $('#add').click(()=>{
        
    });
    $('.revoke').click(()=>{
        
    });
})