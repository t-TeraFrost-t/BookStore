$(document).ready(()=>{
    $("input[type='checkbox']").change(function() {
        console.log('hi');
        if(this.checked) {
            $.post(`/add-staff-to-role/${$('#add').val()}/${$(event.currentTarget).val()}`,(data)=>{
                if(!alert(data)) window.location.href = `/staff-in-role/${$('#add').val()}`;
            })
        }else{
            $.post(`/remove-staff-from-role/${$('#add').val()}/${$(event.currentTarget).val()}`,(data)=>{
                if(!alert(data)) window.location.href = `/staff-in-role/${$('#add').val()}`;
            })
        }
    });
    
})