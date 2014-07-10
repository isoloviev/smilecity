$(document).ready(function () {


    $('.upload-smile-popup-link').magnificPopup({
        type: 'ajax'
    });

    var $smiles = $('#smiles');

    var m = $smiles.mosaicflow({
        itemSelector: ".smile-item"
    });

    $smiles.infinitescroll({
            navSelector: '#page-nav',
            nextSelector: '#page-nav a',
            itemSelector: '.smile-item',
            appendCallback: false,
            loading: {
                msgText: 'Loading new smiles...'
            }
        },
        function (newItems) {
            $.each(newItems, function(index, value) {
                m.mosaicflow('add', $(value));
            });
            popupRefill();
        });

    popupRefill();

    if ($('#authFailure').length > 0) {
        $.magnificPopup.open({
            modal: true,
            items: {
                src: '#authFailure',
                type: 'inline'
            }
        }, 0);

        $(document).on('click', '.popup-modal-dismiss', function (e) {
            e.preventDefault();
            $.magnificPopup.close();
        });
    }



});


function popupRefill()
{
    $('.image-popup-no-margins').magnificPopup({
        type: 'image',
        closeOnContentClick: false,
        closeBtnInside: false,
        fixedContentPos: true,
        mainClass: 'mfp-no-margins',
        image: {
            verticalFit: true,
            titleSrc: function (item) {
                return '<div class="pull-right"><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-star"></span> Give your smile <span class="label label-success">' + item.el.attr('item-likes') + '</span></button></div>';
            }
        },
        callbacks: {
            open: function () {
                var el = $(this.currItem.el);
                new Ya.share({
                    element: 'ya_share',
                    l10n: 'en',
                    theme: 'counter',
                    link: 'http://' + window.location.hostname + '/p/' + el.attr('item-id'),
                    image: el.attr('item-prev'),
                    description: "SmileCity: Share your smile!",
                    quickservices: "yaru,vkontakte,facebook,twitter,odnoklassniki,moimir,gplus",
                    onready: function () {
                        $('#ya_share').appendTo(".mfp-title");
                    }
                });
            },
            afterClose: function () {
                $('<div id="ya_share"/>').appendTo('body');
            }
        }
    });
}