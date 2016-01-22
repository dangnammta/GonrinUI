(function( $ ) {
 
    $.fn.extend({
    	fileUpload: function(options){
    		var defaults = {
                background: 'gray',    			
                itemTemplate: '<li class="list-group-item item" style="float:left; font-size:15px;"> <p> Itme 1 </p><img class="btn-item" src="images/delete.png" ></img></li>',
                Element: this,
                files: [], 
                Url:'',
                method:'',
                Authorization:''

    		};

            var settings = $.extend(defaults, options);
            var template = '<div class="container" id="upload-container"></div>';

            var Element = defaults.Element;
            var files = defaults.files;

            var filelist={
                
                //them vao mot file
                add_file: function(file){
                    p = files.length;
                    files[p] = file;

                },
                //Hien thi danh sach file da chon
                draw_list:function(){},
                //loai bo mot file ra khoi danh sach
                remove_file:function(index){},
                //lay ra mot file
                get_file:function(index){
                    return defaults.files[index];
                }

            };


            var methods ={

                upload: function(file){
                   // console.log(defaults.Url);
                  //  console.log(defaults.Authorization);
                    var self     = this,
                    xhttp = new XMLHttpRequest();
                    fd       = new FormData();
                fd.append('image', file);
                xhttp.open('POST', defaults.Url);
                xhttp.setRequestHeader('Authorization', defaults.Authorization); //Get yout Client ID here: http://api.imgur.com/
                xhttp.onreadystatechange = function () {
                    if (xhttp.status === 200 && xhttp.readyState === 4) {
                        $('.btn-item').attr("src","images/complete.png");
                       var res = JSON.parse(xhttp.responseText), link, p, t;
                        link = res.data.link;                       
                        fileName.value = link;                      
                         
                         alert("File Up load Completed!");   
                         //Hien thi link upload                   
                          $('.item-content').html(link);                       
                    }
                };
                xhttp.send(fd);

                },

                init:function(){
                    console.log(Element);
                    Element.append(template);
                    header = $('#upload-container');
                    header.append('<div id="upload-header"></div>');
                    header = $('#upload-header');
                    header.append(' <input type="text" class="form-control" style="  float:left; width:50%" value="No File Selected.." readonly>');
                    header.append('  <img src="images/up.png" id="btn-view-list" class="btn-upload-control " title="view list"></img>');
                    header.append('<img  class="btn-upload-control" id="btnBrowserFile" src="images/browserfile.png" title="browser file upload"></img>');
                    header.append(' <img src="images/upload.png" class="btn-upload-control  " title="upload all"></img>');
                    header.append(' <img src="images/delete.png" class=" btn-upload-control " title="delete"></img>');
                    header.append('<div class="btn " ><input type="file" id="selectfile" style="display:none;"   name="file" multiple /></div>');
                    Element.append('<ul class="list-group" id="list-group">  </ul>');
                    var list = $('#list-group');
                    console.log(defaults.itemTemplate);
                    list.append(defaults.itemTemplate);

                     $('#btn-view-list').click(function(){
           
            if($('.list-group').css('display')=='none')
               {  $('.list-group').show('slow');
                    $(this).attr('src','images/down.png');
       }
             else if($('.list-group').css('display')=='block')            
                {
                    $('.list-group').hide('slow');
                     $(this).attr('src','images/up.png');
                 }
        });

            
        $('#btnBrowserFile').click(function(){
            $('#selectfile').click();
        });
           $('#selectfile').change(function(){

            var numberfile = $(this)[0].files.length;
            $('input[type=text]').val(numberfile + " files selected");

           });
                }                
                
                
               


            };


           
            // Khoi tao giao dien ban dau
            methods.init();
           
          //  $('.container').html(defaults.template);
           // $('.container').after('<input type="button" id="btn-upload" value="Upload" class="btn-primary">');
            

            //Bat su kien Select file
    		$("#selectfile").change(function(){
            file = $('#selectfile')[0].files[0];
           
            filelist.add_file(file);            
            
            fileName = file.name;
            
                    
    		$('div').remove('.item');
			$('.container').append(itemTemplate);
             $('.item-content').html(fileName);            

         
             $('.btn-item').click(function(){
                //Xu ly su kien xoa bo item

                    alert("Item deleted");
                });

    		});
            $('#btn-upload').click(function(){
                //Xu ly su kien upload file
                
                var file = filelist.get_file(0);
                //console.log(file);
                methods.upload(file);

               
            });

    	
    		
    		return this;

    	}
    });
 
}( jQuery ));