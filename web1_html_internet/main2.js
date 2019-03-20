const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

function templateHTML(title, list, body, control){

return  `
<!doctype html>
<html>
<head>
<title>WEB1 - ${title}</title>
<meta charset="utf-8">
</head>
<body>
<h1><a href="/">WEB</a></h1>
<ul>
    ${list}
</ul>
${control}
${body}
</body>
</html>


`;
}
function templateList(filelist){

    let list =  '<ul>';
    for(let i = 0; i < filelist.length; i++){
        list += `<li><a href = "/?id=${filelist[i]}">${filelist[i]}</a></li>`
    }
    list = list + '</ul>'  
    return list;
}
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    let title = queryData.id;
    let pathname = url.parse(_url, true).pathname
    console.log(title);
    
    console.log(pathname);
//   console.log(url.parse(_url, true).query);
    if(pathname === '/'){
        if(title === undefined){
            fs.readdir('./data', (err,filelist) =>{
            let title = "Welcome";
            let description = "welcome";
            let list = templateList(filelist);
            let template = templateHTML(title, list, 
                `<h2>${title}</h2>${description}`,
                `<a href = '/create'>create<a>`)
                response.writeHead(200);
                response.end(template);
            })
        }
        else{
            fs.readFile(`data/${title}`, 'utf8', (err, description) => {
                fs.readdir('./data', (err,filelist) =>{
                if (err) throw err;
                let list =  templateList(filelist);
                let template = templateHTML(title, list, // delete는 form으로 구현해야한다.
                    `<h2>${title}</h2>${description}`,
                    `<a href = '/create'>create<a> 
                     <a href = '/update?id=${title}'>update</a>
                     <form action = "/delete_process" method = "post">
                     <input type = "hidden" name = "id" value = "${title}"> 
                     <input type = "submit" value = "delete">
                     </form>
                     `)
                response.writeHead(200);
                response.end(template);
                });
            });     
        }
        
    } else if(pathname ==='/create'){
        fs.readdir('./data', (err,filelist) =>{
            let title = "Web-create";
            
            let list = templateList(filelist);
            let template = templateHTML(title, list, 
                `
                <form action = "/create_process" method = "post" >
                <p><input type ="test" name ="title" placeholder ="title"></p>
                <p><textarea name="description" placeholder ="description"></textarea></p>
                <input type="submit">
                </form>
                `,
                ``)
            response.writeHead(200);
            response.end(template);
        });
    } else if(pathname==='/create_process'){
        let body = '';
        request.on('data',function(data){
            body = body + data;
            console.log(body);

        });
        request.on('end',function(){
            let post = qs.parse(body);
            let title = post.title;
            let description = post.description;
            fs.writeFile(`./data/${title}`, `${description}`, 'utf8', (err) => {
                if (err) throw err;
                response.writeHead(302, {
                    'Location': `/?id=${title}`
                    //add other headers here...
                });
                response.end();
            });
        });
        
    } else if(pathname ==='/update'){
        fs.readFile(`data/${title}`, 'utf8', (err, description) => {
            fs.readdir('./data', (err,filelist) =>{
            if (err) throw err;
            let list =  templateList(filelist);
            console.log(description);
            let template = templateHTML(title, list, 
                `
                <form action = "/update_process" method = "post" >
                <input type="hidden" name="id" value=${title}>
                <p><input type ="test" name ="title" placeholder = "title" value = "${title}"></p>
                <p><textarea name="description" placeholder ="description">${description}</textarea></p>
                <input type="submit">
                </form>
                `,
                `<a href = '/create'>create<a> 
                 <a href = '/update?id=${title}'>update</a>
                 <form action = "/delete_process method = "post">
                 <input type = "hidden" name = "id" value = "${title}"> 
                 <input type = "submit" value = "delete">
                 </form>
                 `)
            response.writeHead(200);
            response.end(template);
            });
        });     

    } else if(pathname ==='/update_process'){
        let body = '';
        request.on('data',function(data){
            body = body + data;
            console.log(body);

        });
        request.on('end',function(){
            let post = qs.parse(body);
            let title = post.title;
            let description = post.description;
            let id = post.id;
            fs.rename(`./data/${id}`,`./data/${title}`, (err) => {
                if ( err ) console.log('ERROR: ' + err);
            })
            console.log(post);
            fs.writeFile(`./data/${title}`, `${description}`, 'utf8', (err) => {
                if (err) throw err;
                response.writeHead(302, {
                    'Location': `/?id=${title}`
                    //add other headers here...
                });
                response.end();
            });
            
        });

    } else if(pathname ==='/delete_process'){
        let body = '';
        request.on('data',function(data){
            body = body + data;
            console.log(body);

        });
        request.on('end',function(){
            let post = qs.parse(body);
            console.log(post);
            let id = post.id;
            fs.unlink(`./data/${id}`,(err) => {
                if (err) {
                  console.error(err)
                  return
                }
                response.writeHead(302, {
                    'Location': `/`
                    //add other headers here...
                });
                response.end();
            })
            /*
            fs.rename(`./data/${id}`,`./data/${title}`, (err) => {
                if ( err ) console.log('ERROR: ' + err);
            })
            console.log(post);
            fs.writeFile(`./data/${title}`, `${description}`, 'utf8', (err) => {
                if (err) throw err;
                response.writeHead(302, {
                    'Location': `/?id=${title}`
                    //add other headers here...
                });
                response.end();
            });
            */
        });

    }
    else {
        response.writeHead(404);
        response.end("Not Found");
    }
});
app.listen(3000);

