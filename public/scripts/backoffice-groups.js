$(document).ready(()=>{
    $('.permitions').click(()=>{
        //console.log($(event.currentTarget).val());
        window.location.href = `/backoffice-permitions-for-role/${ $(event.currentTarget).val()}`;
    })
    $('.staff').click(()=>{
        //console.log($(event.currentTarget).val());
        window.location.href = `/staff-in-role/${ $(event.currentTarget).val()}`;
    })
    $('#add').click(()=>{
        $.post(`/create-group/${$('#name').val()}`,(data)=>{
            if(!alert(data)) window.location.href = `/backoffice-roles/${$('#add').val()}`;
        })
    })
    
});