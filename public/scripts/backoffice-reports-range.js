$(document).ready(()=>{
    $('#f-button').click(()=>{
        
        $.ajax({
        url: '/backoffice/reports/orders/get',
        method: 'GET',
        data: { 
            period: $('#period').val(),
            user: $('#user').val(),
            status: $('#status').val(),
            startDate: $('#startDate').val(),
            endDate: $('#endDate').val()
        },
        success: (data)=>{
            console.log(data);
            console.log(data);
            $('#tb ').empty();
            let s = `<tr>`;
            
            Object.keys(data.res[0]).forEach((el)=>{
                s+=`<th>${el}</th>`;
            });
            s+='</tr>';
            $('#tb ').append(s);
            data.res.forEach(element => {
                let str = `<tr>`;
                Object.keys(element).forEach((el)=>{
                    str+=`<td class='number'>${element[el]}</td>`;
                });
                str+=`</tr>`;
                $('#tb tr:last').after(str)
            });
            let t = '';
            for( let i =0;i<Object.keys(data.res[0]).length-3;i++){
                t+='<td></td>'
            }
            t+= `<td class='number'><b>Total:</b></td>
                 <td class='number'> <b>${data.total.sum}</b></td>
                 <td class='number'><b>${data.total.currency}</b></td>`
            $('#tb tr:last').after(t)
            //if(!alert(data)){window.location.href='/backoffice-books';}
        }
        })
    })
    $('#fillter-button').click(()=>{
        console.log('hi');
        $.ajax({
        url: '/backoffice/reports/orders-range/get',
        method: 'GET',
        data: { 
            lower: $('#lower').val(),
            upper: $('#upper').val(),
        },
        success: (data)=>{
            console.log(data);
            $('#tb ').empty();
            $('#tb ').append(`<tr><th>Period</th><th>Count</th><th>Sum</th></tr>`)
            data.forEach(element => {
                $('#tb tr:last').after(`<tr><td class="text">${$('#lower').val()} - ${$('#upper').val()}</td><td class="number">${element.count}</td><td class="number">${element.sum}</td></tr>`)
            });
            //if(!alert(data)){window.location.href='/backoffice-books';}
        }
        })
    })
    $('#gener-button').click(()=>{
        console.log('hi');
        $.ajax({
        url: '/backoffice/reports/geners/get',
        method: 'GET',
        success: (data)=>{
            console.log(data);
            $('#tb ').empty()
            $('#tb ').append(`<tr><th>Period</th><th>Count</th><th>Sum</th></tr>`)
            data.res.forEach(element => {
                $('#tb tr:last').after(`<tr><td class="text">${element.gener}</td><td class="number">${element.count}</td><td class="number">${element.sum}</td></tr>`)
            });
            //if(!alert(data)){window.location.href='/backoffice-books';}
        }
        })
    })
    $('#books-button').click(()=>{
        console.log('hi');
        $.ajax({
        url: '/backoffice/reports/books/get',
        method: 'GET',
        data: {
            name: $('#name').val(),
            autor: $('#autor').val(),
            isbn: $('#isbn').val()
        },
        success: (data)=>{
            console.log(data);
            $('#tb ').empty()
            $('#tb ').append(`<tr><th>ISBN</th><th>Name</th><th>Autor</th><th>Count</th><th>Sum</th></tr>`)
            data.res.forEach(element => {
                $('#tb tr:last').after(`<tr><td class="text">${element.isbn}</td> <td class="text">${element.name}</td><td class="text">${element.autor}</td><td class="text">${element.count}</td><td class="number">${element.sum}</td></tr>`)
            });
            //if(!alert(data)){window.location.href='/backoffice-books';}
        }
        })
    })
});