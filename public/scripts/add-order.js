$(document).ready(()=>{
    $('#user').keyup(()=>{
        $.get(`/sugestions/user/${$('#user').val()}`,(data)=>{
            console.log(data);
            $('#suggestions-users').empty();
            data.forEach(element => {
                $('#suggestions-users' ).append(`<option>${element.username}</option>`)
            });
        })
    });
    $('#isbn').keyup(()=>{
        $.get(`/sugestions/isbn/${$('#isbn').val()}`,(data)=>{
            console.log(data);
            $('#suggestions-books').empty();
            data.forEach(element => {
                $('#suggestions-books').append(`<option>${element.isbn}</option>`)
            });
        })
    });
    $('#add-book').click(()=>{
        var data = Array();
    
        $("table tr").each(function(i, v){
            data[i] = Array();
            $(this).children('td').each(function(ii, vv){
                data[i][ii] = $(this).text();
             }); 
         })
        console.log(data);
        for(let i=1;i<data.length-1;i++){
            if(data[i][0]===$('#isbn').val()){
                alert("you can't add this book again" );
                return;
             }
        }
        $('#tb').append(`<tr><td>${$('#isbn').val()}</td><td>${$('#price').val()}</td><td>${$('#amount').val()}</td></tr>`);
    })
    $('#add-order').click(()=>{
        var data = Array();
    
        $("table tr").each(function(i, v){
            data[i] = Array();
            $(this).children('td').each(function(ii, vv){
                data[i][ii] = $(this).text();
             }); 
         })
        let isbns = [];
        let prices = [];
        let amounts = [];
        for(let i=1;i<data.length-1;i++){
            isbns[i-1] = data[i][0];
            prices[i-1] = data[i][1];
            amounts[i-1] = data[i][2];
        }
        console.log(isbns,prices,amounts);
        if(isbns.length===0){
            alert('You can not Create an empthy order');
            return;
        }
        $.post('/add-order',{date:$('#date').val(),
                             user:$("#user").val(),
                             status:$('#status').val(),
                             isbns: isbns,
                             prices: prices,
                             amounts: amounts},(data)=>{
                                if(!alert(data)){window.location.href=`/backoffice-orders`;}
                             })
       
    })  
})