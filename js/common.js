define(['miq', 'microcore', 'masked', 'render'], async function ($, mc, masked, render) {
    await require([
        "/app/modules/player",
        "/app/modules/pagination",
        "/app/modules/select",
        "/app/modules/dropzone"
    ], (
      player,
      pagination,
      select,
      dropzone
    ) => {
        render.helpers.add('player', player)
        render.helpers.add('pagination', pagination)
        render.helpers.add('select', select)
        render.helpers.add('dropzone', dropzone)
    })

    fetch('/phone-codes.json')
      .then(response => response.json())
      .then(codes => {
          mc.storage.set('phone_codes', codes)
      });

    window.$ = $
    window.onfocus = () => {
        if ((mc.auth.get().role === 'public') && (location.pathname !== '/login'
          && location.pathname !== '/registration'
          && location.pathname !== '/forgot'
          && location.pathname !== '/password')) {
            // console.log(mc.auth.get());
            location.href = '/login';
        }
    };

    function initWiki() {
        $('#wiki .mdi-close').on('click', () => {
            $('#wiki .block').addClass('hide');
            $('#wiki .open').removeClass('hide');
        })
        $('#wiki .open').on('click', () => {
            $('#wiki .open').addClass('hide');
            $('#wiki .block').removeClass('hide');
        })
    }

    mc.events.on('password.preview.toggle', btn => {
        $(btn).toggleClass('mdi-eye').toggleClass('mdi-eye-off')
        let input = $(btn).closest('.password').find('input')

        if (input.attr('type') === 'password') {
            input.attr('type', 'text')
        } else {
            input.attr('type', 'password')
        }
    })

    mc.events.on('routeChange', function () {
        $(document.body).find('main')[0].scroll(0, 0)
        $('.tabs li a').on('click', function (e) {
            e.preventDefault();
            if ($(this).attr('href')) {
                if (!$(e.target).closest('li').hasClass('disabled')) {
                    if ($(this).attr('href').substr(0, 5) == '#tab=') {
                        let tab = $(this).attr('href').substr(5)
                        let previous = $(this).closest('.tabs').find('.active a').attr('href').substr(5)

                        $(this).closest('.tabs').find('.active').removeClass('active')
                        $(this).closest('li').addClass('active')
                        $('#' + previous).addClass('hide')
                        $('#' + tab).removeClass('hide')
                    }
                }
            }
            return false
        })

        masked();

        if ($('#wiki').length) {
            initWiki()
        }

        if (location.hash.match('tab=.*?[^&]')) {
            $('.tabs a[href="' + location.hash + '"]')[0].click()
        }

        if (mc.auth.get().role == "admin") {
            mc.api.call("support.unanswered").then((unanswered) => {
                if (unanswered > 0) {
                    $('header .unanswered').text(unanswered);
                    $('header .unanswered').css('display', 'block');
                } else {
                    $('header .unanswered').text('');
                    $('header .unanswered').css('display', 'none');
                }
            });
        }
    })

    window.comparer = function (idx, order = 'asc') {
        function getCell(tr, idx) {
            return tr.children[idx].innerText || tr.children[idx].textContent
        }

        return (a, b) => (
          (v1, v2) => {
              return v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
          }
        )(getCell(order == 'asc' ? a : b, idx), getCell(order == 'asc' ? b : a, idx));
    }
});