(function( $ ) {
 
    $.fn.extend({
    	fileUpload: function(options){
    		var defaults = {
    			padding: 20,
    			template: '<div class="btn btn-file inputbutton btn-info btn-fileupload-medium" > <span class="fileupload-exists" id="btnBrowserFile">Select File Upload...</span> <input type="file" id="selectfile" name="file" /></div>' ,
            	Element: this,
                files: [], 
                Url:'',
                method:'',
                Authorization:''

    		};

            var settings = $.extend(defaults, options);
            var itemTemplate = '<div class="item"> <p class="item-content" style="float:left; font-size:15px;"> Itme 1 </p> <img class="btn-item" src="images/delete.png" style="width:15px; hight:15px; "> </div>';

            
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

                }                
                
                
               


            };


           
            // Khoi tao giao dien ban dau
           
            $('.container').html(defaults.template);
            $('.container').after('<input type="button" id="btn-upload" value="Upload" class="btn-primary">');
            

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