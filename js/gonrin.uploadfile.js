(function( $ ) {
 
    $.fn.extend({
    	fileUpload: function(options){
    		var defaults = {
    			padding: 20,
    			template: '<div class="btn btn-file inputbutton btn-info btn-fileupload-medium" > <span class="fileupload-exists" id="btnBrowserFile">Select File Upload...</span> <input type="file" id="selecfile" name="file" /></div>' ,
            	Element: this

    		};
            var itemTemplate = '<div class="item"> <p class="item-content" style="float:left; font-size:15px;"> Itme 1 </p> <img class="btn-item" src="images/delete.png" style="width:15px; hight:15px; "> </div>';
           
    		var settings = $.extend(defaults, options);
            // Khoi tao giao dien ban dau
           
            $('.container').html(defaults.template);
            $('.container').after('<input type="button" id="btn-upload" value="Upload" class="btn btn-primary">');
            //Bat su kien Select file
    		$("#selecfile").change(function(){
            console.log($('input[type=file]').files.name);
    		$('div').remove('.item');
			$('.container').append(itemTemplate);

            //
            var f = $('#btnBrowserFile').files;
            

            $('btn-item').hover(
                function(){
                        $(this).css('mouse','pointer');
                        },
                function(){
                    $(this).css('mouse','default');
                            });
             $('.btn-item').click(function(){
                //Xu ly su kien xoa bo item
                    alert("Item deleted");
                });

    		});
            $('#btn-upload').click(function(){
                //Xu ly su kien upload file
                alert("Upload file!");
            });

    	
    		
    		return this;

    	}
    });
 
}( jQuery ));