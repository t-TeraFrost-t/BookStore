$(document).ready(()=>{
    $('#status-modal').hide(); 
    $('#status-modal').draggable();
    console.log("hrip");
    $(".view").click(()=>{
        window.location.href = `/view-order/${$(event.currentTarget).attr("id")}`; 
    });
    $(".update").click(()=>{
        $('#qwer').empty().append(`Update status on order ${$(event.currentTarget).attr("id")}`);
        $('#status-modal').show();
        $('#button-update-status').val(`${$(event.currentTarget).attr("id")}`);  
    })
    $("#button-update-status").click(()=>{
        $.post(`/update-oder/${$(event.currentTarget).val()}/${$('#status-update').val()}`,(data)=>{
            if(!alert('data')){window.location.href='/backoffice-orders';}
        });
    });
    $(".delete").click(()=>{
        console.log("hi");
        $.post(`/delete-order/${$('#button-update-status').val()}/`,(data)=>{
            if(!alert('deleted')){window.location.href='/backoffice-orders';}

        });
    })
    $("#add").click(()=>{
        window.location.href = `/add-order`;
    });
    $(".submit").click(()=>{
        console.log($('#gener').val());
        $.ajax({
            url: '/update-order',
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
                if(!alert(data)){window.location.href='/backoffice-orders';}
            }
        });
        
    });
    $("#filter-button").click(()=>{
        $.ajax({
            url: '/backoffice-orders',
            method: 'GET',
            data: {
                dateFrom: $('#dateFrom').val(),
                dateTo: $('#dateTo').val(),
                name: $('#user').val(),
                priceUpper: $('#priceUpper').val(),
                priceLower: $('#priceLower').val(),
                status: $('#status').val()
            },
            success : (data)=>{
                let newDoc = document.open("text/html", "replace");
                newDoc.write(data);
                newDoc.close();
            }
        });
    });
    $("")
});