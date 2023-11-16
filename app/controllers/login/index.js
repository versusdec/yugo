define(
    ["microcore", "mst!/login/auth"],
    function (mc, view
    ) {
        function preload(cb) {
            require([
                "mst!/layouts/main",
                "mst!/layouts/areas/footer",
                "mst!/layouts/areas/header",
                "mst!/layouts/areas/nav",
                "mst!/dashboard/index",
                "mst!/layouts/components/confirm",
                "mst!/layouts/components/popup",
                "mst!/layouts/components/notify",
                "app/modules/header",
                "app/modules/confirm",
                "app/modules/popup",
                "app/modules/notify",
                "app/controllers/dashboard/index"
            ], () => {})
        }

        mc.events.on('login.vk',  () => {
            const params = {
                client_id: '7623103',
                redirect_uri: `https://${ location.host }/login`,
                scope: 4 + 4194304, // photos + email
                state: 'vk',
                display: 'page',
                response_type: 'code',
            }
            const oAuthUrl = `https://oauth.vk.com/authorize?${ buildQueryParamsString(params) }`
            window.location.replace(oAuthUrl)
        })

        mc.events.on('login',  () => {
            mc.api.call('auth.login', {
                email: $('#login input[name="login"]').val(),
                password: $('#login input[name="password"]').val()
            }).then((res) => {
                if (res) {
                    $('#login').addClass('open')
                    preload()
                    setTimeout(() => {
                        mc.router.go('/')
                    }, 2250)
                } else {
                    $('header .error').removeClass('invisible')
                    setTimeout(() => {
                        $('header .error').addClass('invisible')
                    }, 3000)
                }
                
            })

        })

        return function (params) {
            document.title = "Авторизация | Yugo Platform";
            if (params.code) {
                setTimeout(function () {
                    $('#login').addClass('open')
                }, 100)
                return ''
            }
            return view();
        }
    });