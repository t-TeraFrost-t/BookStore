$(document).ready(()=>{
    $('#orders-p').click(()=>{
        window.location.href='/backoffice/reports/orders';
    })
    $('#orders-c').click(()=>{
        window.location.href='/backoffice/reports/orders-range'
    });
    $('#geners').click(()=>{
        window.location.href='/backoffice/reports/geners'
    });
    $('#books').click(()=>{
        window.location.href='/backoffice/reports/books'
    });
});