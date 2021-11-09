const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const request = require('request');
let dt = new Date("2019-09-15");
let arr = new Array();
setInterval(()=>{
    for(let i = 0;i<5;i++){
        let str = `https://api.nytimes.com/svc/books/v3/lists/${dt.getFullYear()}-${dt.getDay()<8? '0'+(parseInt(dt.getDay())+1).toString() : (parseInt(dt.getDay())+1).toString()}-${dt.getMonth()<9? '0'+(parseInt(dt.getMonth())+1).toString() : (parseInt(dt.getMonth())+1).toString()}/sports.json?api-key=Ge24UmMAb4L8w6Ez3Xc2nDKHOHinRasd`; 
        console.log(str);
        request(str.toString(),(err,response,body)=>{
            if(err){
                console.log(err);
            }else{
                body = JSON.parse(body);
                console.log(body);
                body.results.books.forEach((book)=>{
                    if(book.weeks_on_list<=3){
                        
                        let temp = {
                            isbn : book.primary_isbn13,
                            title : book.title,
                            author : book.author,
                            price : (Math.random()*40 + 10).toFixed(2),
                            number_of_books: Math.floor(Math.random()*500),
                            gener: Math.floor(Math.random()*5),
                            description : book.description,
                            cover : book.book_image,
                        }
                        arr.push(temp);
                    }
                });
                    
                    
                
            }
            
            console.log(arr.length);
            fs.writeFile('data-sports.json', JSON.stringify(arr), function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
        });
        dt.setDate(dt.getDate()-20);
         //sleep(20000); 
    }
},40000);


function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }