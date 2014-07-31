$(document).ready(function () {


    $('.upload-smile-popup-link').magnificPopup({
        type: 'ajax'
    });

    var $smiles = $('#smiles');

//    var m = $smiles.mosaicflow({
//        itemSelector: ".smile-item"
//    });

    var wall = new freewall("#smiles");
    wall.reset({
        selector: '.item',
        animate: false,
        cellW: 230,
        cellH: 230,
        onResize: function () {
            wall.refresh();
        }
    });
    wall.fitWidth();
    // for scroll bar appear;
    $(window).trigger("resize");

    $smiles.infinitescroll({
            navSelector: '#page-nav',
            nextSelector: '#page-nav a',
            itemSelector: '#smiles .item',
            appendCallback: false,
            loading: {
                msgText: 'Loading new smiles...'
            }
        },
        function (newItems) {
            $.each(newItems, function (index, value) {
                $('#smiles').append(value);
                //if (index == (newItems.length - 1 )) {
                    wall.refresh();
                //}
            });
            popupRefill();
        });

    popupRefill();

    if ($('#authFailure').length > 0) {
        createModal('authFailure');
    }


});


function popupRefill() {
    var yahsre = $('<div id="ya_share"/>');

    $('#smiles').magnificPopup({
        type: 'image',
        delegate: 'a',
        closeOnContentClick: false,
        closeBtnInside: false,
        fixedContentPos: true,
        mainClass: 'mfp-no-margins',
        tLoading: 'Loading image #%curr%...',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            tCounter: '',
            preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
        },
        image: {
            verticalFit: true,
            tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
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
                        }).error(function (xhr, ajaxOptions, thrownError) {
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
            change: function () {
                if ($('#ya_share').length > 0) {
                    $('#ya_share').remove();
                }
                yahsre.appendTo('body');
                var el = $(this.currItem.el);
                new Ya.share({
                    element: 'ya_share',
                    l10n: 'en',
                    theme: 'counter',
                    link: 'http://' + window.location.hostname + '/p/' + el.attr('item-id'),
                    image: 'http://' + window.location.hostname + '/' + el.attr('item-prev'),
                    description: "SmileCity: Share your smile!",
                    quickservices: "yaru,vkontakte,facebook,twitter,odnoklassniki,moimir,gplus"
                });
                var magnificPopup = $.magnificPopup.instance;
                magnificPopup.contentContainer.find('.mfp-title').append(yahsre);
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