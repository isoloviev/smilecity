$(document).ready(function () {


    $('.upload-smile-popup-link').magnificPopup({
        type: 'ajax'
    });


    $.ajax({
        url: "/api/photos"
    }).success(function (data) {
            console.log(data);

            $.each(data.list, function (index, file) {
                var node = $('<div/>')
                    .addClass('smile-item')
                    .append($('<img/>')
                        .attr('src', '/images/300x300/' + file.fileName));
                node.appendTo($('#smiles'));
            });
        }).complete(function () {
            var m = $('#smiles').mosaicflow({
                itemSelector: ".smile-item",
                minItemWidth: 150
            });
            m.mosaicflow('refill');
        });

});