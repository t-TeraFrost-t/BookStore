$(document).ready(()=>{
    console.log("brun");
    //$("#fillter-div").hide();
    $(".book").click(()=>{
        window.location.href  = `/book/${$(event.currentTarget).attr("id")}` 
    });
    $("#search").click(()=>{
        console.log();
        $("#fillter-div").show();
        $.ajax({
            url: '/books',
            method: 'GET',
            data: {
                name:  $('#search-name').val(),
                autor: $('#search-autor').val(),
                isbn:  $('#fillter-isbn').val()
            },
            success : (data)=>{
                let newDoc = document.open("text/html", "replace");
                newDoc.write(data);
                newDoc.close();
               // $("#fillter-div").show();
            }
        });
    }); 
    $("#fillter").click(()=>{
        console.log($('#fillter-gener').val());
        $.ajax({
            url: '/books',
            method: 'GET',
            data: {
                name:  $('#search-name').val(),
                autor: $('#search-autor').val(),
                isbn:  $('#fillter-isbn').val(),
                lower: $('#fillter-lower-price').val(),
                upper: $('#fillter-upper-price').val(),
                genere: $('#fillter-gener').val(),
                orderby: $('#order').val(),
            },
            success : (data)=>{
                let newDoc = document.open("text/html", "replace");
                newDoc.write(data);
                newDoc.close();
            }
        }); 
});   
$(".pages").click(()=>{

    console.log($('#fillter-gener').val());
    $.ajax({
        url: '/books',
        method: 'GET',
        data: {
            name:  $('#search-name').val(),
            autor: $('#search-autor').val(),
            isbn:  $('#fillter-isbn').val(),
            lower: $('#fillter-lower-price').val(),
            upper: $('#fillter-upper-price').val(),
            genere: $('#fillter-gener').val(),
            orderby: $('#order').val(),
            page: $(event.currentTarget).attr("value")
        },
        success : (data)=>{
            let newDoc = document.open("text/html", "replace");
            newDoc.write(data);
            newDoc.close();
        }
    }); 
});   
    $("#add").click(()=>{
        $.get("sub",(data)=>{
            window.location.href = data;
        });
    });
});