$(document).ready(()=>{
    console.log("brun");
    
    $("#submit").click(()=>{
        //console.log($('#cover').prop('files')[0]);
        //$("#img").attr("src",URL.createObjectURL($('#cover').prop('files')[0]))
        console.log($('#name').val());
        
        formData = new FormData();
        data.append('cover',$('#cover').val());
        data.append('description',$('#description').val());
        data.append('name',$('#name').val());
        data.append('autor',$('#autor').val());
        data.append('price',$('#price').val());
        data.append('amount',$('#amount').val());
        data.append('gener',$('#gener').val());
        data.append('isbn',$('#isbn').val());
       $.ajax({
            url: '/add-book1',
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            data: formData,
            success: (data)=>{
                if(!alert(data)){window.location.href='/books'};
            }
        });
    });
});