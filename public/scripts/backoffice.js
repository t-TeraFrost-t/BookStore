$(document).ready(()=>{
    $('#geners').click(()=>{
        window.location.href='/backoffice-genere';
    })
    $('#books').click(()=>{
        window.location.href='/backoffice-books'
    });
    $('#staff').click(()=>{
        window.location.href='/backoffice-staff'
    });
    $('#users').click(()=>{
        window.location.href='/backoffice-users'
    });
    $('#orders').click(()=>{
        window.location.href='/backoffice-orders'
    });
    $('#reports').click(()=>{
        window.location.href='/backoffice/reports'
    });
});