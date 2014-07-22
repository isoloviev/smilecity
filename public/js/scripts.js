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
            $.each(newItems, function (index, value) {
                m.mosaicflow('add', $(value));
            });
            popupRefill();
        });

    popupRefill();

    if ($('#authFailure').length > 0) {
        createModal('authFailure');
    }


});


function popupRefill() {
    $('.image-popup-no-margins').magnificPopup({
        type: 'image',
        closeOnContentClick: false,
        closeBtnInside: false,
        fixedContentPos: true,
        mainClass: 'mfp-no-margins',
        image: {
            verticalFit: true,
            titleSrc: function (item) {
                var btn = $('<button class="btn btn-default btn-sm"><span class="glyphicon glyphicon-star"></span> <span class="label-text">Give your smile</span> <span class="label label-success label-like">' + item.el.attr('item-likes') + '</span></button>').click(function () {
                    $.ajax({
                        url: '/api/photo/' + item.el.attr('item-id') + '/smile'
                    }).success(function () {
                            var like = parseInt(btn.find('.label-like').html());
                            like++;
                            item.el.attr('item-likes', like);
                            btn.find('.label-like').html(item.el.attr('item-likes'));
                            btn.attr('disabled', true);
                            btn.find('.label-text').html('Thank you!');
                        }).error(function(xhr, ajaxOptions, thrownError) {
                            if (xhr.status == 401) {
                                createModal('notLoggedIn');
                            }
                        });
                });

                // if smile exists - disable button
                $.ajax({
                    url: '/api/photo/' + item.el.attr('item-id') + '/hasSmile'
                }).done(function (res) {
                        if (res.result) {
                            btn.attr('disabled', true);
                        }
                    });

                return $('<div class="pull-right" style="margin-top: -3px;">').html(btn);
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

function createModal(id) {
    $.magnificPopup.open({
        modal: true,
        items: {
            src: '#' + id,
            type: 'inline'
        }
    }, 0);

    $(document).on('click', '.popup-modal-dismiss', function (e) {
        e.preventDefault();
        $.magnificPopup.close();
    });
}