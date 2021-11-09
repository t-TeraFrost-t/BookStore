$(document).ready(()=>{
    $('#error').hide(); 
    console.log("hrip");
    $(".update").click(()=>{
        
        window.location.href = `/update-book/${$(event.currentTarget).attr("id")}`;
    })
    $(".delete").click(()=>{
        console.log("hi");
        $.post(`/delete-book/${$(event.currentTarget).attr("id")}`,(data)=>{
            if(!alert('daleted')){window.location.href='/backoffice-books';}
        });
    })
    $("#add").click(()=>{
        window.location.href = `/add-book`;
    });
    $(".submit").click(()=>{
        console.log($('#gener').val());
        $.ajax({
            url: '/update-book',
            method: 'GET',
            data: { 
                cover: $('#cover').val(),
                description: $('#description').val(),
                name: $('#name').val(),
                autor: $('#autor').val(),
                price: $('#price').val(),
                amount: $('#amount').val(),
                gener: $('#gener').val(),
                isbn: $(event.currentTarget).attr("id")
            },
            success: (data)=>{
                if(!alert(data)){window.location.href='/backoffice-books';}
            }
        });
        
    });
    $("#filter-button").click(()=>{
        $.ajax({
            url: '/backoffice-books',
            method: 'GET',
            data: {
                name: $('#name').val(),
                autor: $('#autor').val(),
                amountUpper: $('#amountUpper').val(),
                amountLower: $('#amountLower').val(),
                gener: $('#gener').val()
            },
            success : (data)=>{
                let newDoc = document.open("text/html", "replace");
                newDoc.write(data);
                newDoc.close();
            }
        });
    });
    $(".pages").click(()=>{
        if(/^-?\d+$/.test($('#amountUpper').val()) || /^-?\d+$/.test($('#amountLower').val())){
            alert('price is not a number');
            return;
        }
        console.log($('#fillter-gener').val());
        $.ajax({
            url: '/backoffice-books',
            method: 'GET',
            data: {
                name: $('#name').val(),
                autor: $('#autor').val(),
                amountUpper: $('#amountUpper').val(),
                amountLower: $('#amountLower').val(),
                gener: $('#gener').val(),
                page: $(event.currentTarget).attr("value")
            },
            success : (data)=>{
                let newDoc = document.open("text/html", "replace");
                newDoc.write(data);
                newDoc.close();
            }
        }); 
    }); 
});