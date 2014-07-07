$(document).ready(function () {


    $('.upload-smile-popup-link').magnificPopup({
        type: 'ajax'
    });


    $.ajax({
        url: "/api/photos"
    }).success(function (data) {
            console.log(data);

            $.each(data.list, function (index, file) {
                var node = $('<a/>')
                    .addClass('smile-item')
                    .addClass('image-popup-no-margins')
                    .attr('item-id', file.id)
                    .attr('item-prev', 'http://' + window.location.hostname + '/images/300x300/' + file.fileName)
                    .attr('href', '/images/600x600/' + file.fileName)
                    .append($('<img/>')
                        .attr('src', '/images/300x300/' + file.fileName));
                node.appendTo($('#smiles'));
            });
        }).complete(function () {

            var m = $('#smiles').mosaicflow({
                itemSelector: ".smile-item",
                minItemWidth: 230
            });
            m.mosaicflow('refill');


            $('.image-popup-no-margins').magnificPopup({
                type: 'image',
                closeOnContentClick: true,
                closeBtnInside: false,
                fixedContentPos: true,
                mainClass: 'mfp-no-margins',
                image: {
                    verticalFit: true
                },
                callbacks: {
                    open: function() {
                        var el = $(this.currItem.el);
                        new Ya.share({
                            element: 'ya_share',
                            l10n: 'en',
                            theme: 'counter',
                            link: 'http://' + window.location.hostname + '/p/' + el.attr('item-id'),
                            image: el.attr('item-prev'),
                            description: "SmileCity: Share your smile!",
                            quickservices: "yaru,vkontakte,facebook,twitter,odnoklassniki,moimir,gplus",
                            onready: function() {
                                $('#ya_share').appendTo(".mfp-title");
                            }
                        });
                    },
                    afterClose: function() {
                        $('<div id="ya_share"/>').appendTo('body');
                    }
                }
            });

        });

});