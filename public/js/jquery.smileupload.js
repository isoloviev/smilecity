(function ($) {

    $.fn.smileUpload = function () {

        $('<img>')
            .attr('src', '/preview.png')
            .attr('width', 300)
            .appendTo(this.find('.smile-upload-preview'));

        this.find('.smile-upload-button').on('click', function () {
                $('#yourinputname').trigger('click');
            })
            .appendTo(this);
        $('<input id="yourinputname" type="file" name="yourinputname" style="display: none;" />')
            .change(function () {
                var fileObj = this,
                    file;

                if (fileObj.files) {
                    file = fileObj.files[0];
                    var fr = new FileReader;
                    fr.onloadend = changeimg;
                    fr.readAsDataURL(file);
                } else {
                    file = fileObj.value;
                    changeimg(file);
                }
            }).appendTo(this);

        function changeimg(str) {
            if (typeof str === "object") {
                str = str.target.result; // file reader
            }

            $(".smile-upload-preview").find('img').attr('src', str);
        }
    };
})(jQuery);
